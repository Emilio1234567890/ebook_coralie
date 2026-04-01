import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, fail, ok } from "../utils/http.js";
import { isEmail } from "../utils/validate.js";

const r = Router();

r.post(
  "/contact",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();

    const fields = {};

    if (name.length < 2) fields.name = "Nom invalide.";
    if (!isEmail(email)) fields.email = "Email invalide.";
    if (subject.length < 3) fields.subject = "Sujet trop court.";
    if (message.length < 10) fields.message = "Message trop court.";

    if (Object.keys(fields).length) {
      return fail(res, 422, "Validation error.", fields);
    }

    const saved = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return ok(res, {
      message: "Votre message a bien été envoyé.",
      contactMessageId: saved.id,
    });
  }),
);

export default r;
