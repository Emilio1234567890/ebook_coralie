"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function euro(cents = 0) {
  return (Number(cents) / 100).toFixed(2).replace(".", ",") + " €";
}

function StatCard({ label, value, hint }) {
  return (
    <div className="lux-card p-6">
      <p className="lux-kicker">{label}</p>
      <p className="mt-3 text-3xl text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/55">{hint}</p> : null}
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "paid"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : status === "pending"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : status === "refunded"
          ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
          : "border-white/10 bg-white/5 text-white/60";

  const label =
    status === "paid"
      ? "payée"
      : status === "pending"
        ? "en attente"
        : status === "refunded"
          ? "remboursée"
          : status;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em]",
        cls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

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
  const orders = data?.orders || [];

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const total = paid.reduce((sum, o) => sum + (o.amountCents || 0), 0);

    return {
      ordersCount: orders.length,
      paidCount: paid.length,
      spent: euro(total),
    };
  }, [orders]);

  const visibleOrders = orders.filter(
    (o) =>
      o.status === "paid" || o.status === "refunded" || o.status === "pending",
  );

  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lux-hero relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
          >
            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="lux-kicker">ton espace</p>
                <h1 className="lux-title mt-4">Dashboard</h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">
                  {user?.name ? `Bienvenue ${user.name}. ` : "Bienvenue. "}
                  Retrouve ton accès, ton historique d’achat et la lecture
                  privée de ton ebook.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button onClick={load} className="lux-btn lux-btn-ghost">
                    Rafraîchir
                  </button>

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Martinique
                  </Link>

                  {hasAccess ? (
                    <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                      Lire l’ebook
                    </Link>
                  ) : (
                    <button
                      onClick={() => router.push("/checkout")}
                      className="lux-btn lux-btn-gold"
                    >
                      Aller au checkout
                    </button>
                  )}
                </div>

                {err ? (
                  <div className="mt-5 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {err}
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-5">
                <div className="lux-card p-6 sm:p-8">
                  <p className="lux-kicker">statut</p>
                  <h2 className="mt-3 text-3xl text-white">
                    {hasAccess ? "Accès actif" : "Accès verrouillé"}
                  </h2>
                  <p className="mt-4 leading-8 text-white/64">
                    {hasAccess
                      ? "Ton ebook est disponible dans ta bibliothèque privée."
                      : "Passe par la page checkout pour payer par carte ou avec PayPal."}
                  </p>

                  <div className="mt-6 rounded-[20px] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                      produit
                    </p>
                    <p className="mt-2 text-white/85">
                      {product?.name || "ebook"}
                    </p>
                    <p className="mt-2 text-white/60">
                      {product ? euro(product.priceCents) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Commandes"
              value={stats.ordersCount}
              hint="Historique"
            />
            <StatCard
              label="Payées"
              value={stats.paidCount}
              hint="Confirmées"
            />
            <StatCard
              label="Total payé"
              value={stats.spent}
              hint="Montant validé"
            />
          </section>

          <section className="lux-card p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="lux-kicker">historique</p>
                <h2 className="mt-3 text-3xl text-white">Commandes</h2>
              </div>

              <button onClick={load} className="lux-btn lux-btn-ghost">
                Rafraîchir
              </button>
            </div>

            {!visibleOrders.length ? (
              <div className="mt-6 rounded-[20px] border border-white/10 bg-white/4 p-5 text-white/60">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {visibleOrders.map((o, idx) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    className="rounded-[22px] border border-white/10 bg-white/4 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg text-white">Commande #{o.id}</p>
                          <StatusPill status={o.status} />
                        </div>

                        <p className="mt-3 text-sm leading-7 text-white/58">
                          {euro(o.amountCents)} —{" "}
                          {String(o.currency || "eur").toUpperCase()}
                          {o.paidAt
                            ? " • paiement confirmé"
                            : " • paiement non finalisé"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {hasAccess ? (
                          <Link
                            href="/bibliotheque"
                            className="lux-btn lux-btn-gold"
                          >
                            Lire
                          </Link>
                        ) : (
                          <button
                            onClick={() => router.push("/checkout")}
                            className="lux-btn lux-btn-gold"
                          >
                            Checkout
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
