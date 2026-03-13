import { Router } from "express";
import { stripe } from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

async function getEbook() {
  return prisma.product.findUnique({
    where: { slug: "ebook" },
  });
}

async function getActiveEntitlement(userId, productId) {
  return prisma.entitlement.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });
}

async function getReusablePendingOrder(userId, productId) {
  return prisma.order.findFirst({
    where: {
      userId,
      productId,
      status: "pending",
      paymentProvider: "stripe",
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Crée ou réutilise un PaymentIntent Stripe
 * pour afficher seulement le formulaire carte Stripe (PaymentElement)
 */
r.post(
  "/stripe/payment-intent",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();

    if (!product || !product.active) {
      return fail(res, 409, "Produit indisponible.");
    }

    const ent = await getActiveEntitlement(req.user.id, product.id);
    if (ent?.active) {
      return fail(res, 409, "Déjà débloqué.");
    }

    let order = await getReusablePendingOrder(req.user.id, product.id);

    // Si on a déjà une commande pending avec un payment intent réutilisable
    if (order?.stripePaymentIntentId) {
      try {
        const existingPi = await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId,
        );

        if (
          existingPi?.client_secret &&
          [
            "requires_payment_method",
            "requires_confirmation",
            "requires_action",
            "processing",
          ].includes(existingPi.status)
        ) {
          return ok(res, {
            clientSecret: existingPi.client_secret,
            orderId: order.id,
          });
        }
      } catch (e) {
        console.warn(
          "Impossible de réutiliser le PaymentIntent Stripe:",
          e.message,
        );
      }
    }

    // Sinon on crée une commande pending si besoin
    if (!order) {
      order = await prisma.order.create({
        data: {
          userId: req.user.id,
          productId: product.id,
          status: "pending",
          amountCents: product.priceCents,
          currency: product.currency,
          paymentProvider: "stripe",
        },
      });
    }

    // On crée un PaymentIntent carte uniquement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.priceCents,
      currency: String(product.currency || "eur").toLowerCase(),
      payment_method_types: ["card"],
      receipt_email: req.user.email,
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
        productId: String(product.id),
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return ok(res, {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  }),
);

/**
 * Confirmation côté serveur après succès côté front
 */
r.post(
  "/stripe/confirm-payment-intent",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body || {};

    if (!paymentIntentId) {
      return fail(res, 400, "paymentIntentId manquant.");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return fail(res, 404, "PaymentIntent introuvable.");
    }

    if (
      paymentIntent.status !== "succeeded" &&
      paymentIntent.status !== "processing"
    ) {
      return fail(res, 409, "Paiement non confirmé.");
    }

    const orderId = Number(paymentIntent.metadata?.orderId || 0);
    if (!orderId) {
      return fail(res, 400, "orderId manquant dans les metadata Stripe.");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== req.user.id) {
      return fail(res, 404, "Commande introuvable.");
    }

    if (order.status !== "paid") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntent.id,
          meta: paymentIntent,
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
          orderId: order.id,
          source: "stripe",
          grantedAt: new Date(),
        },
        create: {
          userId: order.userId,
          productId: order.productId,
          orderId: order.id,
          active: true,
          source: "stripe",
        },
      });
    }

    return ok(res, { success: true });
  }),
);

/**
 * Webhook Stripe
 * Utile si un paiement finit en dehors du flow front
 */
export const stripeWebhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = Number(paymentIntent.metadata?.orderId || 0);

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order && order.status !== "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntent.id,
            meta: paymentIntent,
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
