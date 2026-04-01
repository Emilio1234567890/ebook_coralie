import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { fail } from "../utils/http.js";

const r = Router();

r.get("/download", requireAuth, async (req, res) => {
  return fail(
    res,
    403,
    "Le téléchargement n’est pas autorisé pour cette édition.",
  );
});

export default r;
