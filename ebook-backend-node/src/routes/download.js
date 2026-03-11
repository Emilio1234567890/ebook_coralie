import { Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail } from "../utils/http.js";

const r = Router();

r.get(
  "/download",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });
    if (!product || !product.active)
      return fail(res, 404, "Produit indisponible.");

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
    });
    if (!ent?.active) return fail(res, 403, "Accès non autorisé.");

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
