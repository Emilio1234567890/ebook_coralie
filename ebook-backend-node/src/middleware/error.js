import { Prisma } from "@prisma/client";
import { fail } from "../utils/http.js";

export function errorMiddleware(err, req, res, next) {
  // Prisma: unique constraint (ex: email)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return fail(res, 409, "Conflit: valeur déjà utilisée.");
    }
  }

  // JSON parse / etc.
  const msg = err?.message || "Erreur serveur.";
  return fail(res, 500, msg);
}
