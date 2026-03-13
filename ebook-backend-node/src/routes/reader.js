import fs from "fs";
import path from "path";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail } from "../utils/http.js";

const r = Router();

function resolvePdfPath(productFilePath) {
  const envPath = process.env.EBOOK_FILE_PATH;
  const finalPath = envPath || productFilePath;

  if (!finalPath) return null;

  return path.isAbsolute(finalPath)
    ? finalPath
    : path.resolve(process.cwd(), finalPath);
}

r.get(
  "/reader/ebook",
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: "ebook" },
    });

    if (!product || !product.active) {
      return fail(res, 404, "Produit introuvable.");
    }

    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: product.id,
        },
      },
    });

    if (!ent?.active) {
      return fail(res, 403, "Accès refusé.");
    }

    const filePath = resolvePdfPath(product.filePath);

    if (!filePath || !fs.existsSync(filePath)) {
      return fail(res, 404, "Fichier introuvable.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="ebook.pdf"');
    res.setHeader("Cache-Control", "private, no-store, max-age=0");

    fs.createReadStream(filePath).pipe(res);
  }),
);

export default r;
