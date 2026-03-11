import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, fail, ok } from "../utils/http.js";
import { isEmail, passwordPolicy } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

function sign(user) {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

r.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    return ok(res, { user: req.user });
  }),
);

r.post(
  "/register",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const password2 = String(req.body?.password2 || "");

    const fields = {};
    if (name.length < 2) fields.name = "Nom invalide (2+).";
    if (!isEmail(email)) fields.email = "Email invalide.";

    const pol = passwordPolicy(password);
    if (!pol.ok) fields.password = pol.message;
    if (password2 && password2 !== password)
      fields.password2 = "Les mots de passe ne correspondent pas.";

    if (Object.keys(fields).length)
      return fail(res, 422, "Validation error.", fields);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return fail(res, 409, "Email déjà utilisé.", {
        email: "Email déjà utilisé.",
      });

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hash },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    const token = sign(user);
    return ok(res, { token, user });
  }),
);

r.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    const fields = {};
    if (!isEmail(email)) fields.email = "Email invalide.";
    if (!password) fields.password = "Mot de passe requis.";
    if (Object.keys(fields).length)
      return fail(res, 422, "Validation error.", fields);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail(res, 422, "Email ou mot de passe incorrect.");

    const okPw = await bcrypt.compare(password, user.password);
    if (!okPw) return fail(res, 422, "Email ou mot de passe incorrect.");

    const token = sign(user);
    return ok(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  }),
);

export default r;
