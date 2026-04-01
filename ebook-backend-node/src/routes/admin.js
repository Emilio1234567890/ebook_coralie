import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mail.js";
import { buildAdminReplyEmail } from "../lib/emailTemplates.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

r.use(requireAuth, requireAdmin);

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
      uniqueVisitorsRows,
      views7d,
      views30d,
      topCountriesRaw,
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
        by: ["countryCode"],
        where: {
          createdAt: { gte: d30 },
        },
        _count: {
          countryCode: true,
        },
        orderBy: {
          _count: {
            countryCode: "desc",
          },
        },
        take: 8,
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

    const uniqueVisitors30d = new Set(
      uniqueVisitorsRows.map((v) => v.ipHash).filter(Boolean),
    ).size;

    const topCountries = topCountriesRaw.map((item) => ({
      countryCode: item.countryCode || "??",
      country: item.countryCode || "Inconnu",
      count: item._count.countryCode,
    }));

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
        uniqueVisitors30d,
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

    const product = await prisma.product.update({
      where: { slug: "ebook" },
      data: {
        name: String(data.name || "").trim(),
        stripePriceId: String(data.stripePriceId || "").trim(),
        priceCents: Number(data.priceCents || 0),
        filePath: String(data.filePath || "").trim(),
        active: !!data.active,
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

    return ok(res, { orders });
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
