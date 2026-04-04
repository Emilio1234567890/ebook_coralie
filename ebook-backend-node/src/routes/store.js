import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

function getAppUrl() {
  return (
    process.env.APP_URL ||
    process.env.FRONTEND_URL?.split(",")[0]?.trim() ||
    "https://belenandcoco.com"
  );
}

async function getEbook() {
  return prisma.product.findUnique({ where: { slug: "ebook" } });
}

r.post(
  "/checkout-session",
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

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: String(product.currency || "eur").toLowerCase(),
            unit_amount: Number(product.priceCents || 0),
            product_data: {
              name: product.name,
              description: product.description || "eBook (PDF)",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
        productId: String(product.id),
      },
      success_url: `${appUrl}/dashboard?success=1`,
      cancel_url: `${appUrl}/?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return ok(res, { url: session.url });
  }),
);

r.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();

    if (!product) {
      return ok(res, { hasAccess: false, orders: [] });
    }

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
    });

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        createdAt: true,
        paidAt: true,
      },
    });

    return ok(res, {
      hasAccess: !!ent?.active,
      product: {
        name: product.name,
        priceCents: product.priceCents,
        currency: product.currency,
      },
      orders,
    });
  }),
);

r.get(
  "/download",
  requireAuth,
  asyncHandler(async (req, res) => {
    return fail(
      res,
      403,
      "Le téléchargement n’est pas autorisé pour cette édition.",
    );
  }),
);

export default r;
