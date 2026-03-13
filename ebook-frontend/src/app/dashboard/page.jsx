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
  const { user, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [busyDeleteId, setBusyDeleteId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  async function load() {
    setErr(null);

    try {
      setLoadingData(true);
      const r = await apiFetch("/api/dashboard");
      setData(r);
    } catch (e) {
      const msg = e?.message || "Impossible de charger le dashboard.";

      if (
        msg.toLowerCase().includes("401") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("non autorisé")
      ) {
        router.replace("/");
        return;
      }

      setErr(msg);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (!loading && user) {
      load();
    }
  }, [loading, user]);

  async function deletePending(orderId) {
    try {
      setBusyDeleteId(orderId);
      setErr(null);

      await apiFetch(`/api/orders/${orderId}/pending`, {
        method: "DELETE",
      });

      await load();
    } catch (e) {
      setErr(e.message || "Impossible de supprimer cette commande.");
    } finally {
      setBusyDeleteId(null);
    }
  }

  const hasAccess = !!data?.hasAccess;
  const product = data?.product || null;
  const orders = data?.orders || [];
  const pendingOrders = hasAccess ? [] : data?.pendingOrders || [];

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const total = paid.reduce((sum, o) => sum + (o.amountCents || 0), 0);

    return {
      ordersCount: orders.length,
      paidCount: paid.length,
      spent: euro(total),
    };
  }, [orders]);

  if (loading || !user) {
    return null;
  }

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
                <h1 className="lux-title">Dashboard</h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">
                  {user?.name ? `Bienvenue ${user.name}. ` : "Bienvenue. "}
                  Ici tu retrouves ton accès, tes commandes et ta lecture
                  privée.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={load}
                    className="lux-btn lux-btn-ghost"
                    type="button"
                  >
                    Rafraîchir
                  </button>

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Martinique
                  </Link>

                  {hasAccess ? (
                    <>
                      <Link
                        href="/bibliotheque"
                        className="lux-btn lux-btn-gold"
                      >
                        Lire l’ebook
                      </Link>

                      <span className="inline-flex min-h-[50px] items-center rounded-[14px] border border-emerald-400/20 bg-emerald-400/10 px-5 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                        Déjà acheté
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push("/checkout")}
                      className="lux-btn lux-btn-gold"
                      type="button"
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
                    {hasAccess ? "Achat confirmé" : "Accès verrouillé"}
                  </h2>
                  <p className="mt-4 leading-8 text-white/64">
                    {hasAccess
                      ? "Ton ebook est déjà débloqué. Aucun second achat n’est nécessaire."
                      : "Passe par le checkout pour payer par carte ou avec PayPal."}
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

                  {hasAccess ? (
                    <div className="mt-4 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                      Cet ebook est déjà associé à ton compte.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Commandes"
              value={stats.ordersCount}
              hint="Historique total"
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

          {loadingData ? (
            <section className="lux-card p-6 sm:p-8 text-white/60">
              Chargement du dashboard...
            </section>
          ) : null}

          {!loadingData && !hasAccess && pendingOrders.length > 0 ? (
            <section className="lux-card p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl text-white">Actions en attente</h2>
                  <p className="mt-3 text-white/58">
                    Tu peux reprendre ou supprimer un paiement interrompu.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {pendingOrders.map((o, idx) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    className="rounded-[22px] border border-white/10 bg-white/4 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg text-white">Commande #{o.id}</p>
                          <StatusPill status={o.status} />
                        </div>

                        <p className="mt-3 text-sm leading-7 text-white/58">
                          {euro(o.amountCents)} —{" "}
                          {String(o.currency || "eur").toUpperCase()} —{" "}
                          {o.paymentProvider || "payment"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => router.push("/checkout")}
                          className="lux-btn lux-btn-gold"
                          type="button"
                        >
                          Reprendre
                        </button>

                        <button
                          onClick={() => deletePending(o.id)}
                          disabled={busyDeleteId === o.id}
                          className="lux-btn lux-btn-ghost"
                          type="button"
                        >
                          {busyDeleteId === o.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : null}

          {!loadingData ? (
            <section className="lux-card p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl text-white">Commandes</h2>
                </div>

                <button
                  onClick={load}
                  className="lux-btn lux-btn-ghost"
                  type="button"
                >
                  Rafraîchir
                </button>
              </div>

              {!orders.length ? (
                <div className="mt-6 rounded-[20px] border border-white/10 bg-white/4 p-5 text-white/60">
                  Aucune commande pour le moment.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((o, idx) => (
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
                            <p className="text-lg text-white">
                              Commande #{o.id}
                            </p>
                            <StatusPill status={o.status} />
                          </div>

                          <p className="mt-3 text-sm leading-7 text-white/58">
                            {euro(o.amountCents)} —{" "}
                            {String(o.currency || "eur").toUpperCase()}
                            {o.paidAt ? " • paiement confirmé" : ""}
                            {o.paymentProvider ? ` • ${o.paymentProvider}` : ""}
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
                              type="button"
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
          ) : null}
        </div>
      </main>
    </>
  );
}
