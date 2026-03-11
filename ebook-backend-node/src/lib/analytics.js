import crypto from "crypto";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import { prisma } from "./prisma.js";

function normalizeIp(ip) {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  if (ip === "::1") return "127.0.0.1";
  return ip;
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const first = String(xff).split(",")[0].trim();
    if (first) return normalizeIp(first);
  }

  const xrip = req.headers["x-real-ip"];
  if (xrip) {
    return normalizeIp(String(xrip));
  }

  return normalizeIp(
    String(
      req.ip ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        "",
    ),
  );
}

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_SALT || "ebook-coralie-salt";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

function resolveGeo(req, ip) {
  const headerCountry =
    req.headers["x-vercel-ip-country"] ||
    req.headers["cf-ipcountry"] ||
    req.headers["x-country-code"];

  if (headerCountry && headerCountry !== "XX") {
    return {
      country: String(headerCountry),
      countryCode: String(headerCountry),
      city: null,
    };
  }

  const geo = geoip.lookup(ip);

  if (!geo) {
    return {
      country: "Unknown",
      countryCode: "XX",
      city: null,
    };
  }

  return {
    country: geo.country || "Unknown",
    countryCode: geo.country || "XX",
    city: geo.city || null,
  };
}

export async function trackVisit(req, payload = {}) {
  try {
    const ip = getClientIp(req);
    const ua = req.headers["user-agent"] || "";
    const parser = new UAParser(ua);
    const parsed = parser.getResult();
    const geo = resolveGeo(req, ip);

    const path = String(payload.path || req.body?.path || "/").slice(0, 255);
    const referrer = String(
      payload.referrer || req.body?.referrer || req.headers.referer || "",
    ).slice(0, 500);

    await prisma.visit.create({
      data: {
        path,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        referrer: referrer || null,
        ua: ua ? String(ua).slice(0, 500) : null,
        browser: parsed.browser?.name || null,
        os: parsed.os?.name || null,
        device: parsed.device?.type || "desktop",
        ipHash: hashIp(ip),
      },
    });
  } catch (e) {
    console.error("trackVisit error:", e.message);
  }
}

export async function getAnalyticsOverview() {
  const now = new Date();

  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);

  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);

  const [views7d, views30d, uniqueVisitors30d, topCountries, topPages, recent] =
    await Promise.all([
      prisma.visit.count({
        where: { createdAt: { gte: d7 } },
      }),
      prisma.visit.count({
        where: { createdAt: { gte: d30 } },
      }),
      prisma.visit.groupBy({
        by: ["ipHash"],
        where: {
          createdAt: { gte: d30 },
          ipHash: { not: null },
        },
      }),
      prisma.visit.groupBy({
        by: ["countryCode"],
        where: { createdAt: { gte: d30 } },
        _count: { countryCode: true },
        orderBy: {
          _count: { countryCode: "desc" },
        },
        take: 8,
      }),
      prisma.visit.groupBy({
        by: ["path"],
        where: { createdAt: { gte: d30 } },
        _count: { path: true },
        orderBy: {
          _count: { path: "desc" },
        },
        take: 8,
      }),
      prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          path: true,
          countryCode: true,
          browser: true,
          os: true,
          device: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    views7d,
    views30d,
    uniqueVisitors30d: uniqueVisitors30d.length,
    topCountries: topCountries.map((x) => ({
      countryCode: x.countryCode || "XX",
      count: x._count.countryCode,
    })),
    topPages: topPages.map((x) => ({
      path: x.path,
      count: x._count.path,
    })),
    recent,
  };
}
