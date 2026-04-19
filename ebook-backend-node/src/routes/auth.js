import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mail.js";
import { asyncHandler, fail, ok } from "../utils/http.js";
import { isEmail, passwordPolicy } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

function sign(user) {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");

  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
}

function normalizeUrl(value = "") {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function getAppUrl() {
  const appUrl = normalizeUrl(process.env.APP_URL || "");
  if (appUrl) return appUrl;

  const frontendRaw = String(process.env.FRONTEND_URL || "").trim();
  if (!frontendRaw) {
    throw new Error("Missing APP_URL or FRONTEND_URL");
  }

  const firstFrontend = frontendRaw
    .split(",")
    .map((item) => normalizeUrl(item))
    .find(Boolean);

  if (!firstFrontend) {
    throw new Error("Missing APP_URL or FRONTEND_URL");
  }

  return firstFrontend;
}

async function enrichUser(user) {
  const product = await prisma.product.findUnique({
    where: { slug: "ebook" },
    select: { id: true },
  });

  let hasEbookAccess = false;

  if (product) {
    const ent = await prisma.entitlement.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
      select: { active: true },
    });

    hasEbookAccess = !!ent?.active;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    hasEbookAccess,
  };
}

r.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!user) return fail(res, 404, "Utilisateur introuvable.");

    return ok(res, { user: await enrichUser(user) });
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

    if (password2 && password2 !== password) {
      fields.password2 = "Les mots de passe ne correspondent pas.";
    }

    if (Object.keys(fields).length) {
      return fail(res, 422, "Validation error.", fields);
    }

    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
      return fail(res, 409, "Email déjà utilisé.", {
        email: "Un compte existe déjà avec cet email.",
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hash },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    const token = sign(user);

    return ok(res, {
      token,
      user: await enrichUser(user),
    });
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

    if (Object.keys(fields).length) {
      return fail(res, 422, "Validation error.", fields);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail(res, 422, "Aucun compte trouvé avec cet email.", {
        email: "Aucun compte trouvé avec cet email.",
      });
    }

    const okPw = await bcrypt.compare(password, user.password);

    if (!okPw) {
      return fail(res, 422, "Mot de passe incorrect.", {
        password: "Mot de passe incorrect.",
      });
    }

    const token = sign(user);

    return ok(res, {
      token,
      user: await enrichUser(user),
    });
  }),
);

r.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!isEmail(email)) {
      return fail(res, 422, "Email invalide.", {
        email: "Email invalide.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail(res, 404, "Aucun compte trouvé avec cet email.", {
        email: "Aucun compte trouvé avec cet email.",
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    const appUrl = getAppUrl();
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `Bonjour ${user.name},

Vous avez demandé la réinitialisation de votre mot de passe.

Ouvrez ce lien :
${resetUrl}

Ce lien expirera dans 30 minutes.

Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a">
          <p>Bonjour ${user.name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#d4b060;color:#17130d;text-decoration:none;border-radius:10px;font-weight:700">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p>${resetUrl}</p>
          <p>Ce lien expirera dans 30 minutes.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        </div>
      `,
    });

    return ok(res, {
      message:
        "Un lien de réinitialisation a été envoyé à votre adresse email.",
    });
  }),
);

r.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const rawToken = String(req.body?.token || "");
    const password = String(req.body?.password || "");
    const password2 = String(req.body?.password2 || "");

    const fields = {};

    if (!rawToken) fields.token = "Token manquant.";

    const pol = passwordPolicy(password);
    if (!pol.ok) fields.password = pol.message;

    if (password2 !== password) {
      fields.password2 = "Les mots de passe ne correspondent pas.";
    }

    if (Object.keys(fields).length) {
      return fail(res, 422, "Validation error.", fields);
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetToken) {
      return fail(res, 422, "Lien invalide ou expiré.");
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
      }),
    ]);

    return ok(res, {
      message: "Mot de passe réinitialisé avec succès.",
    });
  }),
);

export default r;
