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

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

app.use(express.json({ limit: "2mb" }));

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

app.use((req, res) => fail(res, 404, "Not found"));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

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
  console.log(
    "✅ API Node running on",
    port,
    "origin:",
    process.env.FRONTEND_URL,
  );
});
