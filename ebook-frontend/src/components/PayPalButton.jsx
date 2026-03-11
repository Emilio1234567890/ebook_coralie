"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/app/lib/api";

export default function PayPalButton({ onSuccess }) {
  const ref = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const cfg = await apiFetch("/api/paypal/config");
        if (!mounted) return;
        setClientId(cfg.clientId);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      }
    }

    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !clientId || !window.paypal || !ref.current) return;

    ref.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          shape: "rect",
          label: "paypal",
          height: 48,
        },

        async createOrder() {
          const r = await apiFetch("/api/paypal/create-order", {
            method: "POST",
            body: JSON.stringify({}),
          });
          return r.orderId;
        },

        async onApprove(data) {
          await apiFetch("/api/paypal/capture-order", {
            method: "POST",
            body: JSON.stringify({ orderID: data.orderID }),
          });

          if (onSuccess) onSuccess(data.orderID);
        },

        onError(err) {
          console.error(err);
          setError("Le paiement PayPal a échoué.");
        },
      })
      .render(ref.current);
  }, [sdkReady, clientId, onSuccess]);

  if (error) {
    return (
      <div className="rounded-[16px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <>
      {clientId ? (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
        />
      ) : null}

      <div ref={ref} />
    </>
  );
}
