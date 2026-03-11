import { Router } from "express";
import { trackVisit } from "../lib/analytics.js";

const r = Router();

r.post("/analytics/track", async (req, res) => {
  await trackVisit(req, req.body || {});
  return res.json({ ok: true });
});

export default r;
