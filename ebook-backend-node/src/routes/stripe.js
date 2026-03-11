import { Router } from "express";
import { stripe } from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

async function getEbook() {
  return prisma.product.findUnique({ where: { slug: "ebook" } });
}

r.post(
  "/stripe/checkout-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();
    if (!product || !product.active) {
      return fail(res, 409, "Produit indisponible.");
    }

    if (!product.stripePriceId) {
      return fail(res, 500, "Stripe price ID manquant.");
    }

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
    });

    if (ent?.active) {
      return fail(res, 409, "Déjà débloqué.");
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        status: "pending",
        amountCents: product.priceCents,
        currency: product.currency,
        paymentProvider: "stripe",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      payment_method_types: ["card"],
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
      },
      success_url: `${process.env.FRONTEND_URL}/success?provider=stripe`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return ok(res, { url: session.url });
  }),
);

export const stripeWebhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = Number(session.metadata?.orderId || 0);

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (order && order.status !== "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent || null,
            stripeCustomerId: session.customer || null,
            meta: session,
          },
        });

        await prisma.entitlement.upsert({
          where: {
            userId_productId: {
              userId: order.userId,
              productId: order.productId,
            },
          },
          update: {
            active: true,
            revokedAt: null,
            orderId,
            source: "stripe",
            grantedAt: new Date(),
          },
          create: {
            userId: order.userId,
            productId: order.productId,
            orderId,
            active: true,
            source: "stripe",
          },
        });
      }
    }
  }

  return res.json({ received: true });
});

export default r;
