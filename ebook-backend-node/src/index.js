import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import downloadRoutes from "./routes/download.js";
import stripeRoutes, { stripeWebhookHandler } from "./routes/stripe.js";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analytics.js";
import paypalRoutes from "./routes/paypal.js";
import orderRoutes from "./routes/orders.js";
import readerRoutes from "./routes/reader.js";
import contactRoutes from "./routes/contact.js";
import { fail } from "./utils/http.js";

const app = express();

app.set("trust proxy", 1);

function normalizeOrigin(origin = "") {
  return String(origin || "")
    .trim()
    .replace(/\/+$/, "");
}

function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || "";
  const fromEnv = raw
    .split(",")
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;

  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Autorise les requêtes sans Origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin non autorisée: ${origin}`));
  },
  credentials: true,
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "api",
  });
});

/**
 * IMPORTANT:
 * Le webhook Stripe doit rester AVANT express.json()
 * pour garder le body brut signé par Stripe.
 */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", downloadRoutes);
app.use("/api", stripeRoutes);
app.use("/api", paypalRoutes);
app.use("/api", orderRoutes);
app.use("/api", readerRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", contactRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  return fail(res, 404, "Not found");
});

app.use((err, req, res, next) => {
  console.error("API error:", err);

  if (res.headersSent) return next(err);

  if (
    err?.message &&
    (err.message.startsWith("Origin non autorisée:") ||
      err.message === "Not allowed by CORS")
  ) {
    return fail(res, 403, "Origin non autorisée.");
  }

  return fail(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Erreur serveur."
      : err.message || "Erreur serveur.",
  );
});

const port = Number(process.env.PORT || 8000);

app.listen(port, () => {
  console.log("✅ API Node running on", port);
  console.log("🌍 Allowed origins:", allowedOrigins.join(", "));
});
