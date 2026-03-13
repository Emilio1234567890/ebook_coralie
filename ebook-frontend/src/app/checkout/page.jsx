"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function euro(cents = 0) {
  return (Number(cents) / 100).toFixed(2).replace(".", ",") + " €";
}

function StripeCardForm({ email, onError, onSuccess, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    onError(null);

    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    try {
      setBusy(true);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              email: email || undefined,
            },
          },
        },
      );

      if (error) {
        onError(error.message || "Le paiement Stripe a échoué.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await apiFetch("/api/stripe/confirm-payment-intent", {
          method: "POST",
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        onSuccess();
        return;
      }

      if (paymentIntent?.status === "processing") {
        onSuccess();
        return;
      }

      onError("Le paiement n’a pas pu être confirmé.");
    } catch (e) {
      onError(e.message || "Erreur Stripe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              paiement sécurisé
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              Carte bancaire
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
            Stripe
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-[rgba(10,14,22,0.92)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  color: "#F5F0E6",
                  fontFamily:
                    '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: "16px",
                  fontWeight: "500",
                  fontSmoothing: "antialiased",
                  "::placeholder": {
                    color: "rgba(245,240,230,0.38)",
                  },
                  iconColor: "#d4b060",
                },
                invalid: {
                  color: "#f87171",
                  iconColor: "#f87171",
                },
              },
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
          <span>Paiement sécurisé par Stripe</span>
          <span>Visa · Mastercard · CB</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || busy}
        className="lux-btn lux-btn-gold w-full"
      >
        {busy ? "Paiement..." : "Payer par carte"}
      </button>
    </form>
  );
}
function SummaryRow({ label, value, muted = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>
      <span
        className={muted ? "text-right text-white/64" : "text-right text-white"}
      >
        {value}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const paypalRef = useRef(null);

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [loadingStripeForm, setLoadingStripeForm] = useState(false);

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

  const hasAccess = !!data?.hasAccess;
  const product = data?.product || null;
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const userEmail = data?.user?.email || "";

  useEffect(() => {
    async function createPaymentIntent() {
      if (!data || hasAccess || clientSecret) return;
      if (!stripeKey) return;

      try {
        setLoadingStripeForm(true);

        const r = await apiFetch("/api/stripe/payment-intent", {
          method: "POST",
          body: JSON.stringify({}),
        });

        setClientSecret(r.clientSecret);
      } catch (e) {
        setErr(e.message || "Impossible de charger le formulaire Stripe.");
      } finally {
        setLoadingStripeForm(false);
      }
    }

    createPaymentIntent();
  }, [data, hasAccess, clientSecret]);

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
        fundingSource: window.paypal.FUNDING.PAYPAL,
        style: {
          layout: "vertical",
          shape: "rect",
          label: "paypal",
          height: 48,
          color: "gold",
          tagline: false,
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

          router.push("/success");
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
  }, [paypalReady, paypalRendered, hasAccess, router]);

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;
    return { clientSecret };
  }, [clientSecret]);

  const priceLabel = product ? euro(product.priceCents) : "14,99 €";

  return (
    <>
      <Header />

      {paypalClientId ? (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture&disable-funding=card,credit,venmo,paylater`}
          strategy="afterInteractive"
          onLoad={() => setPaypalReady(true)}
        />
      ) : null}

      <main className="page">
        <div className="container">
          <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lux-hero relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8 lg:col-span-7 lg:px-10 lg:py-10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(212,176,96,0.10),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(68,196,224,0.08),transparent_28%)]" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="lux-chip">checkout</span>
                  <span className="lux-chip">paiement sécurisé</span>
                  <span className="lux-chip">accès immédiat</span>
                </div>

                <h1 className="mt-6 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.94] tracking-[-0.04em] text-white">
                  Finaliser l’achat
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                  Choisis ton moyen de paiement pour activer ton accès privé à
                  l’édition. Carte bancaire avec Stripe ou paiement PayPal, sans
                  quitter ton site.
                </p>

                {err ? (
                  <div className="mt-6 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {err}
                  </div>
                ) : null}

                {hasAccess ? (
                  <div className="mt-8 rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
                    Ton accès est déjà actif. Tu peux aller directement dans ta
                    bibliothèque.
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-white/4 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                            paiement par carte
                          </p>
                          <h2 className="mt-2 text-2xl text-white">
                            Carte bancaire
                          </h2>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                          Stripe
                        </div>
                      </div>

                      <p className="mb-5 max-w-xl leading-7 text-white/62">
                        Un formulaire simple, directement intégré à la page,
                        pour payer rapidement par carte.
                      </p>

                      {!stripeKey ? (
                        <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante dans
                          le frontend.
                        </div>
                      ) : loadingStripeForm ? (
                        <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-4 text-white/70">
                          Chargement du formulaire carte...
                        </div>
                      ) : stripeOptions ? (
                        <Elements
                          stripe={stripePromise}
                          options={stripeOptions}
                        >
                          <StripeCardForm
                            email={userEmail}
                            clientSecret={clientSecret}
                            onError={setErr}
                            onSuccess={() => router.push("/success")}
                          />
                        </Elements>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/4 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                            paiement paypal
                          </p>
                          <h2 className="mt-2 text-2xl text-white">PayPal</h2>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                          Wallet
                        </div>
                      </div>

                      <p className="mb-5 max-w-xl leading-7 text-white/62">
                        Paiement avec ton compte PayPal, affiché directement sur
                        cette page, sans le bloc carte PayPal.
                      </p>

                      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/3 p-3">
                        <div ref={paypalRef} className="min-h-[52px]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="lg:col-span-5"
            >
              <div className="lux-card sticky top-[112px] overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(212,176,96,0.10),transparent_24%),radial-gradient(circle_at_0%_100%,rgba(68,196,224,0.08),transparent_26%)]" />

                <div className="relative z-10">
                  <p className="lux-kicker">résumé</p>
                  <h2 className="mt-4 text-4xl leading-tight text-white">
                    Ton édition
                  </h2>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                      édition numérique
                    </p>

                    <p className="mt-3 text-xl text-white">
                      {product?.name || "Une béninoise en Martinique"}
                    </p>

                    <div className="mt-6 flex items-end gap-3">
                      <span className="text-5xl leading-none text-white">
                        {priceLabel.split(",")[0]}
                      </span>
                      <span className="pb-1 text-xl text-white/56">
                        ,{priceLabel.split(",")[1]}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-white/60">
                      Accès privé à la lecture en ligne, au dashboard et à la
                      bibliothèque personnelle.
                    </p>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/4 p-5">
                    <div className="space-y-4">
                      <SummaryRow
                        label="produit"
                        value={product?.name || "Une béninoise en Martinique"}
                      />
                      <SummaryRow label="prix" value={priceLabel} />
                      <SummaryRow label="livraison" value="numérique" muted />
                      <div className="h-px bg-white/10" />
                      <SummaryRow label="total" value={priceLabel} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[20px] border border-white/10 bg-white/4 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        accès
                      </p>
                      <p className="mt-2 text-sm text-white/80">immédiat</p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-white/4 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        lecture
                      </p>
                      <p className="mt-2 text-sm text-white/80">privée</p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-white/4 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        sécurité
                      </p>
                      <p className="mt-2 text-sm text-white/80">chiffrée</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,26,16,0.88),rgba(12,13,18,0.96))] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                      après paiement
                    </p>
                    <p className="mt-3 leading-8 text-white/72">
                      Ton accès est activé automatiquement. Tu retrouveras ton
                      édition dans ton dashboard et dans ta bibliothèque privée.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </section>
        </div>
      </main>
    </>
  );
}
