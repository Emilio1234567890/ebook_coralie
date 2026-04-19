import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import { sendMail } from "../lib/mail.js";
import { buildAdminReplyEmail } from "../lib/emailTemplates.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

r.use(requireAuth, requireAdmin);

function countryNameFromCode(code) {
  if (!code || code === "??" || code === "XX") return "Inconnu";

  try {
    const display = new Intl.DisplayNames(["fr"], { type: "region" });
    return display.of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

async function getStripeReceiptUrl(order) {
  try {
    if (!order?.stripePaymentIntentId) return null;

    const paymentIntent = await stripe.paymentIntents.retrieve(
      order.stripePaymentIntentId,
      {
        expand: ["latest_charge"],
      },
    );

    const receiptUrl = paymentIntent?.latest_charge?.receipt_url;
    return receiptUrl || null;
  } catch {
    return null;
  }
}

r.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const now = new Date();

    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 7);

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);

    const [
      users,
      ordersPaid,
      paidOrders,
      buyersCount,
      visits30d,
      views7d,
      views30d,
      topPagesRaw,
      totalMessages,
      unreadMessages,
      repliedMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({
        where: { status: "paid" },
      }),
      prisma.order.findMany({
        where: { status: "paid" },
        select: { amountCents: true },
      }),
      prisma.entitlement.count({
        where: { active: true },
      }),
      prisma.visit.findMany({
        where: {
          createdAt: { gte: d30 },
        },
        select: {
          ipHash: true,
          countryCode: true,
        },
      }),
      prisma.visit.count({
        where: {
          createdAt: { gte: d7 },
        },
      }),
      prisma.visit.count({
        where: {
          createdAt: { gte: d30 },
        },
      }),
      prisma.visit.groupBy({
        by: ["path"],
        where: {
          createdAt: { gte: d30 },
        },
        _count: {
          path: true,
        },
        orderBy: {
          _count: {
            path: "desc",
          },
        },
        take: 10,
      }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
      prisma.contactMessage.count({
        where: {
          repliedAt: { not: null },
        },
      }),
    ]);

    const revenueCents = paidOrders.reduce(
      (sum, o) => sum + Number(o.amountCents || 0),
      0,
    );

    const uniqueVisitorsSet = new Set();
    const countryMap = new Map();

    for (const visit of visits30d) {
      const code = (visit.countryCode || "XX").toUpperCase();
      const key = visit.ipHash || `anonymous-${Math.random()}`;

      uniqueVisitorsSet.add(key);

      if (!countryMap.has(code)) {
        countryMap.set(code, new Set());
      }

      countryMap.get(code).add(key);
    }

    const topCountries = Array.from(countryMap.entries())
      .map(([countryCode, visitorSet]) => ({
        countryCode,
        country: countryNameFromCode(countryCode),
        count: visitorSet.size,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topPages = topPagesRaw.map((item) => ({
      path: item.path || "/",
      count: item._count.path,
    }));

    return ok(res, {
      users,
      ordersPaid,
      buyersCount,
      revenueCents,
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        replied: repliedMessages,
      },
      analytics: {
        uniqueVisitors30d: uniqueVisitorsSet.size,
        views7d,
        views30d,
        topCountries,
        topPages,
      },
    });
  }),
);

r.get(
  "/products",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });

    return ok(res, { product });
  }),
);

r.patch(
  "/products",
  asyncHandler(async (req, res) => {
    const data = req.body || {};

    const name = String(data.name || "").trim();
    const description =
      data.description == null ? null : String(data.description).trim();
    const filePath = String(data.filePath || "").trim();
    const priceCents = Number(data.priceCents || 0);
    const active = !!data.active;

    if (!name) {
      return fail(res, 422, "Le nom du produit est requis.");
    }

    if (!filePath) {
      return fail(res, 422, "Le chemin du PDF est requis.");
    }

    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      return fail(res, 422, "Le prix doit être supérieur à 0.");
    }

    const product = await prisma.product.update({
      where: { slug: "ebook" },
      data: {
        name,
        description,
        priceCents,
        filePath,
        active,
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
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const ordersWithReceipt = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        receiptUrl:
          order.paymentProvider === "stripe"
            ? await getStripeReceiptUrl(order)
            : null,
      })),
    );

    return ok(res, { orders: ordersWithReceipt });
  }),
);

r.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            entitlements: true,
          },
        },
      },
    });

    return ok(res, { users });
  }),
);

r.post(
  "/users/:id/make-admin",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id || 0);
    if (!id) return fail(res, 400, "ID invalide.");

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, isAdmin: true },
    });

    if (!user) {
      return fail(res, 404, "Utilisateur introuvable.");
    }

    if (user.isAdmin) {
      return ok(res, { success: true, user });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return ok(res, { success: true, user: updated });
  }),
);

r.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id || 0);
    if (!id) return fail(res, 400, "ID invalide.");

    if (req.user.id === id) {
      return fail(
        res,
        409,
        "Tu ne peux pas supprimer ton propre compte admin.",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      return fail(res, 404, "Utilisateur introuvable.");
    }

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
      prisma.entitlement.deleteMany({ where: { userId: id } }),
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return ok(res, { success: true });
  }),
);

r.get(
  "/contact-messages",
  asyncHandler(async (req, res) => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return ok(res, { messages });
  }),
);

r.post(
  "/contact-messages/:id/read",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id || 0);
    if (!id) return fail(res, 400, "ID invalide.");

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return ok(res, { success: true });
  }),
);

r.post(
  "/contact-messages/:id/reply",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id || 0);
    const html = String(req.body?.html || "").trim();
    const subjectLine = String(req.body?.subject || "").trim();

    if (!id) return fail(res, 400, "ID invalide.");
    if (!html) return fail(res, 422, "Réponse vide.");

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return fail(res, 404, "Message introuvable.");
    }

    const mail = buildAdminReplyEmail({
      customerName: message.name,
      subjectLine:
        subjectLine || `Réponse à votre message : ${message.subject}`,
      htmlContent: html,
    });

    await sendMail({
      to: message.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    await prisma.contactMessage.update({
      where: { id },
      data: {
        adminReply: html,
        repliedAt: new Date(),
        isRead: true,
      },
    });

    return ok(res, { success: true });
  }),
);

export default r;
