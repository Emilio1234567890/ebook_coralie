"use client";

import { apiFetch } from "@/app/lib/api";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    apiFetch("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
