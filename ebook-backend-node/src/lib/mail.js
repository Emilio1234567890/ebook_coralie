import nodemailer from "nodemailer";

function getMailTransport() {
  const host = process.env.MAIL_HOST || "smtp.mail.ovh.net";
  const port = Number(process.env.MAIL_PORT || 465);
  const secure = String(process.env.MAIL_SECURE || "true") === "true";

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Missing MAIL_USER or MAIL_PASS");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = getMailTransport();

  console.log("📨 SMTP verify...");
  await transporter.verify();
  console.log("✅ SMTP ready");

  console.log("📨 Sending mail to:", to);

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });

  console.log("✅ Mail sent:", info.messageId);
  return info;
}
