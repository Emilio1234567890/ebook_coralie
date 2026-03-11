"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";

function euro(cents = 0) {
  return (Number(cents) / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CheckoutPage() {
  const paypalRef = useRef(null);

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [busyStripe, setBusyStripe] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalRendered, setPaypalRendered] = useState(false);

  async function load() {
    setErr(null);
    try {
      const r = await apiFetch("/api/dashboard");
      setData(r);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const product = data?.product || null;
  const hasAccess = !!data?.hasAccess;

  async function payWithStripe() {
    setErr(null);
    try {
      setBusyStripe(true);
      const r = await apiFetch("/api/stripe/checkout-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      window.location.href = r.url;
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyStripe(false);
    }
  }

  useEffect(() => {
    if (
      !paypalReady ||
      paypalRendered ||
      !paypalRef.current ||
      !window.paypal ||
      hasAccess
    ) {
      return;
    }

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          shape: "rect",
          label: "paypal",
          height: 48,
        },

        createOrder: async () => {
          const res = await apiFetch("/api/paypal/create-order", {
            method: "POST",
            body: JSON.stringify({}),
          });
          return res.paypalOrderId;
        },

        onApprove: async (data) => {
          await apiFetch("/api/paypal/capture-order", {
            method: "POST",
            body: JSON.stringify({ paypalOrderId: data.orderID }),
          });

          window.location.href = "/success";
        },

        onError: (e) => {
          console.error(e);
          setErr("Le paiement PayPal a échoué.");
        },

        onCancel: () => {
          setErr("Paiement PayPal annulé.");
        },
      })
      .render(paypalRef.current)
      .then(() => setPaypalRendered(true))
      .catch((e) => {
        console.error(e);
        setErr("Impossible d’afficher PayPal.");
      });
  }, [paypalReady, paypalRendered, hasAccess]);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const summary = useMemo(() => {
    if (!product) return null;

    return {
      name: product.name,
      price: euro(product.priceCents),
    };
  }, [product]);

  return (
    <>
      <Header />

      {paypalClientId ? (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture`}
          strategy="afterInteractive"
          onLoad={() => setPaypalReady(true)}
        />
      ) : null}

      <main className="page">
        <div className="container">
          <section className="grid gap-6 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lux-card p-6 sm:p-8 lg:col-span-7"
            >
              <p className="lux-kicker">checkout</p>
              <h1 className="mt-3 text-4xl text-white">Finaliser l’achat</h1>

              <p className="mt-4 max-w-2xl leading-8 text-white/64">
                Tu restes sur ton site pour choisir ton moyen de paiement.
                Ensuite, ton accès est activé automatiquement après
                confirmation.
              </p>

              {err ? (
                <div className="mt-5 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {err}
                </div>
              ) : null}

              {hasAccess ? (
                <div className="mt-8 rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
                  Ton accès est déjà actif. Tu n’as pas besoin de repayer.
                </div>
              ) : (
                <>
                  <div className="mt-8 rounded-[22px] border border-white/10 bg-white/4 p-5">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/40">
                      Paiement par carte
                    </p>
                    <p className="mt-3 text-white/70">
                      Paiement sécurisé via Stripe, carte uniquement.
                    </p>

                    <button
                      onClick={payWithStripe}
                      disabled={busyStripe}
                      className="lux-btn lux-btn-gold mt-5"
                    >
                      {busyStripe ? "Redirection..." : "Payer par carte"}
                    </button>
                  </div>

                  <div className="mt-6 rounded-[22px] border border-white/10 bg-white/4 p-5">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/40">
                      Paiement PayPal
                    </p>
                    <p className="mt-3 text-white/70">
                      Paiement directement depuis cette page avec ton compte
                      PayPal.
                    </p>

                    <div ref={paypalRef} className="mt-5 min-h-[52px]" />
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="lux-card p-6 sm:p-8 lg:col-span-5"
            >
              <p className="lux-kicker">résumé</p>
              <h2 className="mt-3 text-3xl text-white">Ton édition</h2>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  produit
                </p>
                <p className="mt-2 text-white">{summary?.name || "ebook"}</p>
              </div>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  prix
                </p>
                <p className="mt-2 text-white">{summary?.price || "—"}</p>
              </div>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  accès après paiement
                </p>
                <p className="mt-2 text-white/72">
                  Bibliothèque privée + dashboard + lecture en ligne.
                </p>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </>
  );
}
