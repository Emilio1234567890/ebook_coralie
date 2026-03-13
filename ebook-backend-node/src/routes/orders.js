import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, fail, ok } from "../utils/http.js";

const r = Router();

r.delete(
  "/orders/:id/pending",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id || 0);
    if (!id) return fail(res, 400, "ID invalide.");

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order || order.userId !== req.user.id) {
      return fail(res, 404, "Commande introuvable.");
    }

    if (order.status !== "pending") {
      return fail(
        res,
        409,
        "Seules les commandes pending peuvent être supprimées.",
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return ok(res, { deleted: true });
  }),
);

export default r;
