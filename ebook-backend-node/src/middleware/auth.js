import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { fail } from "../utils/http.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return fail(res, 401, "Non authentifié.");

    if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return fail(res, 401, "Token invalide.");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    if (!user) return fail(res, 401, "Utilisateur introuvable.");

    req.user = user;
    return next();
  } catch (e) {
    return fail(res, 500, e.message || "Erreur auth.");
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return fail(res, 403, "Accès admin requis.");
  return next();
}
