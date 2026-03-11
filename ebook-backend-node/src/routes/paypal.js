import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || "Erreur PayPal OAuth.");
  }

  return data.access_token;
}

async function getEbook() {
  return prisma.product.findUnique({ where: { slug: "ebook" } });
}

r.post(
  "/paypal/create-order",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();
    if (!product || !product.active) {
      return fail(res, 409, "Produit indisponible.");
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
        paymentProvider: "paypal",
      },
    });

    const accessToken = await getPayPalAccessToken();

    const resPayPal = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: String(order.id),
            amount: {
              currency_code: String(product.currency || "EUR").toUpperCase(),
              value: (product.priceCents / 100).toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await resPayPal.json();

    if (!resPayPal.ok) {
      throw new Error(data?.message || "Erreur PayPal create order.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalOrderId: data.id },
    });

    return ok(res, { paypalOrderId: data.id });
  }),
);

r.post(
  "/paypal/capture-order",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paypalOrderId } = req.body || {};
    if (!paypalOrderId) {
      return fail(res, 400, "paypalOrderId manquant.");
    }

    const order = await prisma.order.findFirst({
      where: {
        paypalOrderId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return fail(res, 404, "Commande introuvable.");
    }

    if (order.status === "paid") {
      return ok(res, { alreadyPaid: true });
    }

    const accessToken = await getPayPalAccessToken();

    const resPayPal = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await resPayPal.json();

    if (!resPayPal.ok) {
      throw new Error(data?.message || "Erreur PayPal capture.");
    }

    const captureId =
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        paypalCaptureId: captureId,
        meta: data,
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
        source: "paypal",
        grantedAt: new Date(),
      },
      create: {
        userId: order.userId,
        productId: order.productId,
        orderId: order.id,
        active: true,
        source: "paypal",
      },
    });

    return ok(res, { success: true });
  }),
);

export default r;
