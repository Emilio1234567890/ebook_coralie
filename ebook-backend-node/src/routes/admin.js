import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import { getAnalyticsOverview } from "../lib/analytics.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

r.use(requireAuth, requireAdmin);

r.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const [users, ordersTotal, ordersPaid, revenue, analytics] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "paid" } }),
        prisma.order.aggregate({
          where: { status: "paid" },
          _sum: { amountCents: true },
        }),
        getAnalyticsOverview(),
      ]);

    return ok(res, {
      users,
      ordersTotal,
      ordersPaid,
      revenueCents: revenue._sum.amountCents || 0,
      analytics,
    });
  }),
);

r.get(
  "/product",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });

    return ok(res, { product });
  }),
);

r.patch(
  "/product",
  asyncHandler(async (req, res) => {
    const b = req.body || {};

    const data = {};

    if (b.name !== undefined) data.name = String(b.name);
    if (b.description !== undefined) {
      data.description = b.description ? String(b.description) : null;
    }
    if (b.priceCents !== undefined) {
      data.priceCents = Math.max(0, Number(b.priceCents) || 0);
    }
    if (b.currency !== undefined) {
      data.currency = String(b.currency || "eur").toLowerCase();
    }
    if (b.stripePriceId !== undefined) {
      data.stripePriceId = String(b.stripePriceId);
    }
    if (b.filePath !== undefined) {
      data.filePath = String(b.filePath);
    }
    if (b.active !== undefined) {
      data.active = !!b.active;
    }

    const product = await prisma.product.upsert({
      where: { slug: "ebook" },
      update: data,
      create: {
        slug: "ebook",
        name: data.name || "eBook",
        description: data.description ?? null,
        priceCents: data.priceCents ?? 999,
        currency: data.currency || "eur",
        stripePriceId: data.stripePriceId || "price_xxx",
        filePath: data.filePath || "storage/ebook.pdf",
        active: data.active ?? true,
      },
    });

    return ok(res, { product });
  }),
);

r.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    return ok(res, { orders });
  }),
);

r.post(
  "/orders/:id/refund",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return fail(res, 400, "Invalid order id");
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return fail(res, 404, "Order not found");
    }

    if (order.status !== "paid") {
      return fail(res, 409, "Order not paid");
    }

    if (!order.stripePaymentIntentId) {
      return fail(res, 400, "No payment_intent to refund");
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    await prisma.order.update({
      where: { id },
      data: { status: "refunded" },
    });

    await prisma.entitlement.updateMany({
      where: { orderId: id },
      data: {
        active: false,
        revokedAt: new Date(),
      },
    });

    return ok(res, { refund });
  }),
);

export default r;
