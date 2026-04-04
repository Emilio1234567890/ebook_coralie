import { Router } from "express";
import { stripe } from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mail.js";
import { buildOrderConfirmationEmail } from "../lib/emailTemplates.js";
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

async function sendOrderConfirmation(order) {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { id: true, name: true, email: true },
  });

  const product = await prisma.product.findUnique({
    where: { id: order.productId },
    select: { name: true, priceCents: true, currency: true },
  });

  if (!user?.email || !product) return;

  const priceLabel = `${(Number(order.amountCents || product.priceCents) / 100)
    .toFixed(2)
    .replace(".", ",")} ${String(
    order.currency || product.currency || "EUR",
  ).toUpperCase()}`;

  const libraryUrl = `${process.env.FRONTEND_URL}/bibliotheque`;

  const mail = buildOrderConfirmationEmail({
    customerName: user.name,
    productName: product.name,
    priceLabel,
    libraryUrl,
  });

  await sendMail({
    to: user.email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}

async function markOrderAsPaid(order, payload, source = "stripe") {
  if (!order || order.status === "paid") return false;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      meta: payload,
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
      source,
      grantedAt: new Date(),
    },
    create: {
      userId: order.userId,
      productId: order.productId,
      orderId: order.id,
      active: true,
      source,
    },
  });

  try {
    await sendOrderConfirmation(order);
  } catch (e) {
    console.error("Order confirmation email error:", e);
  }

  return true;
}

r.post(
  "/checkout-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();

    if (!product || !product.active) {
      return fail(res, 409, "Produit indisponible.");
    }

    const ent = await getActiveEntitlement(req.user.id, product.id);
    if (ent?.active) {
      return fail(res, 409, "Déjà débloqué. Va au dashboard.");
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
      line_items: [
        {
          price_data: {
            currency: String(product.currency || "eur").toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: product.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
        productId: String(product.id),
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    });

    return ok(res, { url: session.url });
  }),
);

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

    const metadataUserId = Number(paymentIntent.metadata?.userId || 0);
    if (metadataUserId && metadataUserId !== req.user.id) {
      return fail(res, 403, "PaymentIntent invalide pour cet utilisateur.");
    }

    if (Number(paymentIntent.amount || 0) !== Number(order.amountCents || 0)) {
      return fail(res, 409, "Montant Stripe incohérent.");
    }

    if (
      String(paymentIntent.currency || "").toLowerCase() !==
      String(order.currency || "").toLowerCase()
    ) {
      return fail(res, 409, "Devise Stripe incohérente.");
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
    }

    await markOrderAsPaid(order, paymentIntent, "stripe");

    return ok(res, { success: true });
  }),
);

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

      if (order) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        await markOrderAsPaid(order, paymentIntent, "stripe");
      }
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = Number(session.metadata?.orderId || 0);

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            stripeCheckoutSessionId: session.id,
          },
        });

        await markOrderAsPaid(order, session, "stripe");
      }
    }
  }

  return res.json({ received: true });
});

export default r;
