import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, ok } from "../utils/http.js";

const r = Router();

function isFreeEbookAccess() {
  return String(process.env.FREE_EBOOK_ACCESS || "").toLowerCase() === "true";
}

r.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const freeAccess = isFreeEbookAccess();

    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });

    if (!product) {
      return ok(res, {
        product: null,
        hasAccess: freeAccess,
        freeAccess,
        orders: [],
        pendingOrders: [],
      });
    }

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: product.id,
        },
      },
    });

    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        productId: product.id,
        status: { in: ["paid", "refunded", "canceled"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        paidAt: true,
        createdAt: true,
        paymentProvider: true,
      },
    });

    const pendingOrders = freeAccess
      ? []
      : await prisma.order.findMany({
          where: {
            userId: req.user.id,
            productId: product.id,
            status: "pending",
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            status: true,
            amountCents: true,
            currency: true,
            paidAt: true,
            createdAt: true,
            paymentProvider: true,
          },
        });

    return ok(res, {
      product: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        currency: product.currency,
        active: product.active,
      },
      hasAccess: freeAccess || !!ent?.active,
      freeAccess,
      orders,
      pendingOrders,
    });
  }),
);

export default r;
