"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function StatCard({ label, value, hint }) {
  return (
    <div className="lux-card p-6">
      <p className="lux-kicker">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/55">{hint}</p> : null}
    </div>
  );
}

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    try {
      const [a, p, o] = await Promise.all([
        apiFetch("/api/admin/overview"),
        apiFetch("/api/admin/products"),
        apiFetch("/api/admin/orders"),
      ]);
      setOverview(a);
      setProduct(p.product);
      setOrders(o.orders);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProduct() {
    setBusy(true);
    setErr(null);
    try {
      await apiFetch("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify(product),
      });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function refund(orderId) {
    setBusy(true);
    setErr(null);
    try {
      await apiFetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const analytics = overview?.analytics;

  return (
    <>
      <Header />
      <main className="page">
        <div className="container space-y-8">
          <section className="lux-hero p-8 sm:p-12">
            <p className="lux-kicker">administration</p>
            <h1 className="lux-title mt-3">Pilotage</h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Suivi des ventes, des visiteurs, des pays d’origine et des pages
              les plus consultées.
            </p>

            {err ? <p className="mt-4 text-sm text-rose-400">{err}</p> : null}
          </section>

          {!overview ? (
            <div className="lux-card p-6 text-white/70">Chargement...</div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Utilisateurs" value={overview.users} />
                <StatCard
                  label="Commandes payées"
                  value={overview.ordersPaid}
                />
                <StatCard
                  label="Chiffre d’affaires"
                  value={`${(overview.revenueCents / 100).toFixed(2)} €`}
                />
                <StatCard
                  label="Visiteurs uniques / 30j"
                  value={analytics?.uniqueVisitors30d || 0}
                />
                <StatCard label="Vues / 7j" value={analytics?.views7d || 0} />
                <StatCard label="Vues / 30j" value={analytics?.views30d || 0} />
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="lux-card p-6">
                  <p className="lux-kicker">top pays</p>
                  <h2 className="mt-2 text-2xl text-white">
                    Origine du trafic
                  </h2>

                  <div className="mt-6 space-y-3">
                    {analytics?.topCountries?.length ? (
                      analytics.topCountries.map((item) => (
                        <div
                          key={item.countryCode}
                          className="flex items-center justify-between border-b border-white/10 pb-3"
                        >
                          <span className="text-white/78">
                            {item.countryCode}
                          </span>
                          <span className="text-white font-medium">
                            {item.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/55">Pas encore de données.</p>
                    )}
                  </div>
                </div>

                <div className="lux-card p-6">
                  <p className="lux-kicker">top pages</p>
                  <h2 className="mt-2 text-2xl text-white">Pages consultées</h2>

                  <div className="mt-6 space-y-3">
                    {analytics?.topPages?.length ? (
                      analytics.topPages.map((item) => (
                        <div
                          key={item.path}
                          className="flex items-center justify-between border-b border-white/10 pb-3"
                        >
                          <span className="text-white/78 truncate">
                            {item.path}
                          </span>
                          <span className="text-white font-medium">
                            {item.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/55">Pas encore de données.</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="lux-card p-6 sm:p-8">
                <p className="lux-kicker">produit</p>
                <h2 className="mt-2 text-2xl text-white">Configuration</h2>

                {!product ? (
                  <p className="mt-4 text-white/70">Chargement...</p>
                ) : (
                  <>
                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="lux-label">Nom</label>
                        <input
                          className="lux-input mt-2"
                          value={product.name || ""}
                          onChange={(e) =>
                            setProduct({ ...product, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="lux-label">Stripe Price ID</label>
                        <input
                          className="lux-input mt-2"
                          value={product.stripePriceId || ""}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              stripePriceId: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="lux-label">Prix (centimes)</label>
                        <input
                          className="lux-input mt-2"
                          value={product.priceCents ?? 0}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              priceCents: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="lux-label">Chemin PDF</label>
                        <input
                          className="lux-input mt-2"
                          value={product.filePath || ""}
                          onChange={(e) =>
                            setProduct({ ...product, filePath: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 flex-wrap">
                      <label className="flex items-center gap-2 text-white/75">
                        <input
                          type="checkbox"
                          checked={!!product.active}
                          onChange={(e) =>
                            setProduct({ ...product, active: e.target.checked })
                          }
                        />
                        Actif
                      </label>

                      <button
                        className="lux-btn lux-btn-gold"
                        disabled={busy}
                        onClick={saveProduct}
                      >
                        {busy ? "Sauvegarde..." : "Sauvegarder"}
                      </button>

                      <button className="lux-btn lux-btn-ghost" onClick={load}>
                        Rafraîchir
                      </button>
                    </div>
                  </>
                )}
              </section>

              <section className="lux-card p-6 sm:p-8">
                <p className="lux-kicker">commandes</p>
                <h2 className="mt-2 text-2xl text-white">Historique</h2>

                {!orders?.length ? (
                  <p className="mt-4 text-white/55">Aucune commande.</p>
                ) : (
                  <div className="mt-6 space-y-3">
                    {orders.map((o) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-medium text-white">
                              #{o.id} — {o.status} —{" "}
                              {(o.amountCents / 100).toFixed(2)}{" "}
                              {o.currency.toUpperCase()}
                            </p>
                            <p className="mt-1 text-sm text-white/55">
                              {o.user?.email} — session :{" "}
                              {o.stripeCheckoutSessionId || "n/a"}
                            </p>
                          </div>

                          <button
                            className="lux-btn lux-btn-ghost"
                            disabled={busy || o.status !== "paid"}
                            onClick={() => refund(o.id)}
                          >
                            Refund
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
