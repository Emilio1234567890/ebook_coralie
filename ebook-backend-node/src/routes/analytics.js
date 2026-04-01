import { Router } from "express";
import { trackVisit } from "../lib/analytics.js";

const r = Router();

r.post("/analytics/track", async (req, res) => {
  try {
    await trackVisit(req, req.body || {});
    return res.json({ ok: true });
  } catch (e) {
    console.error("analytics track error:", e);
    return res.status(200).json({ ok: false });
  }
});

export default r;
