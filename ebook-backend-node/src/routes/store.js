import { Router } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

// Helper: récupérer le produit unique "ebook"
async function getEbook() {
  return prisma.product.findUnique({ where: { slug: "ebook" } });
}

r.post(
  "/checkout-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await getEbook();
    if (!product || !product.active)
      return fail(res, 409, "Produit indisponible.");

    // Déjà accès ?
    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
    });
    if (ent?.active) return fail(res, 409, "Déjà débloqué. Va au dashboard.");

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        status: "pending",
        amountCents: product.priceCents,
        currency: product.currency,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      metadata: { orderId: String(order.id), userId: String(req.user.id) },
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/?canceled=1`,
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
    if (!product) return ok(res, { hasAccess: false, orders: [] });

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
    const product = await getEbook();
    if (!product) return fail(res, 404, "Produit introuvable.");

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
    });
    if (!ent?.active)
      return fail(res, 403, "Téléchargement refusé (pas d’accès).");

    // PDF local dans le backend (ex: ebook-backend-node/storage/ebook.pdf)
    const filePath = path.isAbsolute(product.filePath)
      ? product.filePath
      : path.join(process.cwd(), product.filePath);

    if (!fs.existsSync(filePath))
      return fail(res, 404, "Fichier PDF manquant sur le serveur.");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ebook.pdf"');

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => fail(res, 500, "Erreur lecture fichier."));
    stream.pipe(res);
  }),
);

export default r;
