import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, ok } from "../utils/http.js";

const r = Router();

r.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });

    if (!product) {
      return ok(res, {
        product: null,
        hasAccess: false,
        orders: [],
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

    return ok(res, {
      product: {
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        currency: product.currency,
        active: product.active,
      },
      hasAccess: !!ent?.active,
      orders,
    });
  }),
);

export default r;
