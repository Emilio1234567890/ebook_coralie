"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import AdminMailEditor from "@/components/AdminMailEditor";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const MESSAGES_PER_PAGE = 5;

function euro(cents = 0) {
  return (Number(cents) / 100).toFixed(2).replace(".", ",") + " €";
}

function formatDate(value) {
  if (!value) return "Date inconnue";

  try {
    return new Date(value).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "Date inconnue";
  }
}

function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").trim();
}

function getVisiblePages(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];

  return [1, current - 1, current, current + 1, total];
}

function StatCard({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "gold"
      ? "from-[rgba(212,176,96,0.16)] to-[rgba(255,255,255,0.03)]"
      : tone === "sea"
        ? "from-[rgba(68,196,224,0.14)] to-[rgba(255,255,255,0.03)]"
        : tone === "emerald"
          ? "from-[rgba(16,185,129,0.14)] to-[rgba(255,255,255,0.03)]"
          : "from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.018)]";

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-white/14">
      <div
        className={`absolute inset-0 pointer-events-none opacity-80 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${toneClass}`}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative z-10">
        <p className="lux-kicker">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        {hint ? (
          <p className="mt-2 text-sm leading-6 text-white/55">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({
  kicker,
  title,
  description,
  children,
  className = "",
  rightSlot = null,
}) {
  return (
    <section className={`lux-card overflow-hidden ${className}`}>
      <div className="border-b border-white/8 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {kicker ? <p className="lux-kicker">{kicker}</p> : null}
            {title ? (
              <h2 className="mt-2 text-2xl text-white">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                {description}
              </p>
            ) : null}
          </div>

          {rightSlot ? <div>{rightSlot}</div> : null}
        </div>
      </div>

      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

function OrderStatusPill({ status }) {
  const cls =
    status === "paid"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : status === "pending"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : status === "refunded"
          ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
          : status === "canceled"
            ? "border-white/10 bg-white/5 text-white/55"
            : "border-white/10 bg-white/5 text-white/60";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]",
        cls,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function MessageStatusPill({ message }) {
  if (message.repliedAt) {
    return (
      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
        répondu
      </span>
    );
  }

  if (!message.isRead) {
    return (
      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">
        nouveau
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
      lu
    </span>
  );
}

function SupportFilterButton({ active, count, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left transition",
        active
          ? "border-[rgba(212,176,96,0.26)] bg-[rgba(212,176,96,0.10)] shadow-[0_10px_24px_rgba(212,176,96,0.08)]"
          : "border-white/10 bg-white/[0.035] hover:border-white/16 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <span
        className={[
          "text-[10px] uppercase tracking-[0.18em]",
          active ? "text-[rgba(245,224,175,1)]" : "text-white/70",
        ].join(" ")}
      >
        {children}
      </span>

      <span
        className={[
          "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-[9px]",
          active
            ? "bg-black/20 text-[rgba(245,224,175,1)]"
            : "bg-white/8 text-white/55",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function PagerButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] uppercase tracking-[0.16em] text-white/72 transition hover:border-white/16 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PageNumberButton({ active, page, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[11px] transition",
        active
          ? "border-[rgba(212,176,96,0.3)] bg-[rgba(212,176,96,0.12)] text-[rgba(245,224,175,1)]"
          : "border-white/10 bg-white/[0.04] text-white/68 hover:border-white/16 hover:bg-white/[0.07]",
      ].join(" ")}
    >
      {page}
    </button>
  );
}

function SmallInfoCard({ label, value, hint }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-2xl text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/50">{hint}</p> : null}
    </div>
  );
}

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyHtml, setReplyHtml] = useState("");
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [messagePage, setMessagePage] = useState(1);

  async function load() {
    setErr(null);

    try {
      const [a, p, o, m] = await Promise.all([
        apiFetch("/api/admin/overview"),
        apiFetch("/api/admin/products"),
        apiFetch("/api/admin/orders"),
        apiFetch("/api/admin/contact-messages"),
      ]);

      const next = {
        overview: a,
        product: p.product,
        orders: o.orders || [],
        messages: m.messages || [],
      };

      setOverview(next.overview);
      setProduct(next.product);
      setOrders(next.orders);
      setMessages(next.messages);

      return next;
    } catch (e) {
      setErr(e.message || "Impossible de charger l’espace admin.");
      return null;
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProduct() {
    setBusy(true);
    setErr(null);
    setNotice(null);

    try {
      await apiFetch("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify(product),
      });

      await load();
      setNotice("La configuration du livre a bien été sauvegardée.");
    } catch (e) {
      setErr(e.message || "Impossible de sauvegarder le produit.");
    } finally {
      setBusy(false);
    }
  }

  async function openMessage(message) {
    setNotice(null);

    const template = `<p>Bonjour ${message.name},</p><p>Merci pour votre message.</p><p></p><p>Bien à vous,</p><p>Une béninoise en Martinique</p>`;

    const nextSelected = { ...message, isRead: true };

    setSelectedMessage(nextSelected);
    setReplySubject(`Réponse à votre message : ${message.subject}`);
    setReplyHtml(template);

    if (!message.isRead) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id ? { ...item, isRead: true } : item,
        ),
      );

      try {
        await apiFetch(`/api/admin/contact-messages/${message.id}/read`, {
          method: "POST",
        });

        const refreshed = await load();
        const latest =
          refreshed?.messages?.find((m) => m.id === message.id) || nextSelected;
        setSelectedMessage(latest);
      } catch {}
    }
  }

  async function sendReply() {
    if (!selectedMessage) return;

    const cleanSubject = replySubject.trim();
    const cleanHtml = stripHtml(replyHtml);

    if (!cleanSubject) {
      setErr("Ajoute un objet avant d’envoyer la réponse.");
      return;
    }

    if (!cleanHtml) {
      setErr("Le contenu de la réponse est vide.");
      return;
    }

    setSendingReply(true);
    setErr(null);
    setNotice(null);

    try {
      await apiFetch(
        `/api/admin/contact-messages/${selectedMessage.id}/reply`,
        {
          method: "POST",
          body: JSON.stringify({
            subject: replySubject,
            html: replyHtml,
          }),
        },
      );

      const refreshed = await load();
      const latest = refreshed?.messages?.find(
        (m) => m.id === selectedMessage.id,
      );

      setSelectedMessage(latest || null);
      setReplySubject("");
      setReplyHtml("");
      setNotice("La réponse a bien été envoyée.");
    } catch (e) {
      setErr(e.message || "Impossible d’envoyer la réponse.");
    } finally {
      setSendingReply(false);
    }
  }

  const analytics = overview?.analytics || {};

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead).length,
    [messages],
  );

  const repliedCount = useMemo(
    () => messages.filter((m) => !!m.repliedAt).length,
    [messages],
  );

  const readCount = useMemo(
    () => messages.filter((m) => !!m.isRead && !m.repliedAt).length,
    [messages],
  );

  useEffect(() => {
    setMessagePage(1);
  }, [messageQuery, messageFilter]);

  const filteredMessages = useMemo(() => {
    const q = messageQuery.trim().toLowerCase();

    return messages.filter((m) => {
      const matchesQuery =
        !q ||
        [m.subject, m.name, m.email, m.message]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        messageFilter === "all"
          ? true
          : messageFilter === "unread"
            ? !m.isRead
            : messageFilter === "read"
              ? !!m.isRead && !m.repliedAt
              : messageFilter === "replied"
                ? !!m.repliedAt
                : true;

      return matchesQuery && matchesFilter;
    });
  }, [messages, messageQuery, messageFilter]);

  const totalMessagePages = Math.max(
    1,
    Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE),
  );

  useEffect(() => {
    if (messagePage > totalMessagePages) {
      setMessagePage(totalMessagePages);
    }
  }, [messagePage, totalMessagePages]);

  const paginatedMessages = useMemo(() => {
    const start = (messagePage - 1) * MESSAGES_PER_PAGE;
    return filteredMessages.slice(start, start + MESSAGES_PER_PAGE);
  }, [filteredMessages, messagePage]);

  const visiblePages = useMemo(
    () => getVisiblePages(messagePage, totalMessagePages),
    [messagePage, totalMessagePages],
  );

  const totalVisitors =
    overview?.analytics?.uniqueVisitors30d ??
    overview?.analytics?.totalVisitors ??
    overview?.analytics?.visitors ??
    0;

  const totalViews =
    overview?.analytics?.views30d ??
    overview?.analytics?.totalViews ??
    overview?.analytics?.pageViews ??
    0;

  const totalBuyers =
    overview?.buyersCount ??
    overview?.buyers ??
    overview?.ordersPaid ??
    orders.filter((o) => o.status === "paid").length;

  const conversionRate =
    totalVisitors > 0
      ? `${Math.round((Number(totalBuyers) / Number(totalVisitors)) * 100)}%`
      : "0%";

  const paidOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "paid").length,
    [orders],
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders],
  );

  const refundedOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "refunded").length,
    [orders],
  );

  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-8">
          <section className="lux-hero relative overflow-hidden p-8 sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(212,176,96,0.12),transparent_26%),radial-gradient(circle_at_100%_0%,rgba(68,196,224,0.08),transparent_28%)]" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="lux-kicker">administration</p>
                  <h1 className="lux-title mt-3">Pilotage</h1>
                  <p className="mt-4 max-w-2xl text-white/70">
                    Suivi des ventes, des visiteurs, des pays, des messages
                    contact et de la configuration du produit dans une interface
                    plus claire et plus agréable à utiliser.
                  </p>
                </div>

                <div className="grid min-w-[260px] gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">
                      Inbox
                    </p>
                    <p className="mt-2 text-xl text-white">{messages.length}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">
                      Réponses
                    </p>
                    <p className="mt-2 text-xl text-white">{repliedCount}</p>
                  </div>
                </div>
              </div>

              {err ? (
                <div className="mt-5 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {err}
                </div>
              ) : null}

              {notice ? (
                <div className="mt-5 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  {notice}
                </div>
              ) : null}
            </div>
          </section>

          {!overview ? (
            <div className="lux-card p-6 text-white/70">Chargement...</div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  label="Utilisateurs"
                  value={overview.users ?? 0}
                  hint="Comptes créés"
                />
                <StatCard
                  label="Acheteurs"
                  value={totalBuyers}
                  hint="Commandes payées"
                  tone="emerald"
                />
                <StatCard
                  label="Chiffre d’affaires"
                  value={euro(overview.revenueCents ?? 0)}
                  hint="Total encaissé"
                  tone="gold"
                />
                <StatCard
                  label="Visiteurs"
                  value={totalVisitors}
                  hint="30 derniers jours"
                  tone="sea"
                />
                <StatCard
                  label="Vues"
                  value={totalViews}
                  hint="Pages consultées"
                />
                <StatCard
                  label="Conversion"
                  value={conversionRate}
                  hint="Acheteurs / visiteurs"
                />
              </section>

              <section className="grid gap-6 lg:grid-cols-12">
                <SectionCard
                  kicker="traffic"
                  title="Top pays"
                  description="Répartition des visiteurs par pays pour identifier les zones qui performent le mieux."
                  className="lg:col-span-6"
                >
                  {analytics?.topCountries?.length ? (
                    <div className="space-y-3">
                      {analytics.topCountries.map((item, index) => (
                        <div
                          key={`${item.countryCode || item.country || "XX"}-${index}`}
                          className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/4 px-4 py-3 transition hover:bg-white/6"
                        >
                          <div>
                            <p className="text-white">
                              {item.country || item.countryCode || "Inconnu"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                              {item.countryCode || "—"}
                            </p>
                          </div>
                          <span className="text-lg text-white">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/55">Pas encore de données pays.</p>
                  )}
                </SectionCard>

                <SectionCard
                  kicker="traffic"
                  title="Pages les plus vues"
                  description="Aide à voir quels contenus attirent le plus l’attention et où concentrer l’optimisation."
                  className="lg:col-span-6"
                >
                  {analytics?.topPages?.length ? (
                    <div className="space-y-3">
                      {analytics.topPages.map((item, index) => (
                        <div
                          key={`${item.path}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/4 px-4 py-3 transition hover:bg-white/6"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-white">{item.path}</p>
                          </div>
                          <span className="shrink-0 text-lg text-white">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/55">
                      Pas encore de données pages.
                    </p>
                  )}
                </SectionCard>
              </section>

              <SectionCard
                kicker="produit"
                title="Configuration du livre"
                description="Modifie rapidement les informations principales du produit vendu sur le site."
                rightSlot={
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]",
                      product?.active
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white/55",
                    ].join(" ")}
                  >
                    {product?.active ? "actif" : "inactif"}
                  </span>
                }
              >
                {!product ? (
                  <p className="text-white/70">Chargement...</p>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-4 sm:grid-cols-2">
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
                          type="number"
                          className="lux-input mt-2"
                          value={product.priceCents ?? 0}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              priceCents: Number(e.target.value || 0),
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

                      <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                        <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/75">
                          <input
                            type="checkbox"
                            checked={!!product.active}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                active: e.target.checked,
                              })
                            }
                          />
                          Actif
                        </label>

                        <button
                          className="lux-btn lux-btn-gold"
                          disabled={busy}
                          onClick={saveProduct}
                          type="button"
                        >
                          {busy ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                        aperçu rapide
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                          <p className="text-sm text-white/48">Nom actuel</p>
                          <p className="mt-2 text-white">
                            {product.name || "—"}
                          </p>
                        </div>

                        <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                          <p className="text-sm text-white/48">Prix affiché</p>
                          <p className="mt-2 text-white">
                            {euro(product.priceCents ?? 0)}
                          </p>
                        </div>

                        <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                          <p className="text-sm text-white/48">Fichier</p>
                          <p className="mt-2 break-all text-sm text-white/72">
                            {product.filePath || "Aucun chemin défini"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                kicker="contact"
                title="Messages support"
                description="Une boîte de réception plus compacte, plus élégante et plus simple à parcourir."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SmallInfoCard
                    label="Messages"
                    value={messages.length}
                    hint="Total reçu"
                  />
                  <SmallInfoCard
                    label="Non lus"
                    value={unreadCount}
                    hint="À traiter"
                  />
                  <SmallInfoCard
                    label="Lus"
                    value={readCount}
                    hint="Déjà ouverts"
                  />
                  <SmallInfoCard
                    label="Réponses"
                    value={repliedCount}
                    hint="Suivi support"
                  />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                  <aside className="h-fit overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_22px_60px_rgba(0,0,0,0.22)] xl:sticky xl:top-[112px] xl:self-start">
                    <div className="border-b border-white/8 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="lux-kicker">inbox</p>
                          <h3 className="mt-2 text-xl text-white">
                            Boîte de réception
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/52">
                            Recherche, filtre et ouvre rapidement chaque
                            message.
                          </p>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                          {filteredMessages.length}
                        </div>
                      </div>

                      <div className="mt-5">
                        <input
                          type="text"
                          value={messageQuery}
                          onChange={(e) => setMessageQuery(e.target.value)}
                          placeholder="Rechercher par sujet, nom, email..."
                          className="w-full rounded-[16px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[rgba(212,176,96,0.28)] focus:bg-white/[0.07]"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <SupportFilterButton
                          active={messageFilter === "all"}
                          count={messages.length}
                          onClick={() => setMessageFilter("all")}
                        >
                          Tous
                        </SupportFilterButton>

                        <SupportFilterButton
                          active={messageFilter === "unread"}
                          count={unreadCount}
                          onClick={() => setMessageFilter("unread")}
                        >
                          Non lus
                        </SupportFilterButton>

                        <SupportFilterButton
                          active={messageFilter === "read"}
                          count={readCount}
                          onClick={() => setMessageFilter("read")}
                        >
                          Lus
                        </SupportFilterButton>

                        <SupportFilterButton
                          active={messageFilter === "replied"}
                          count={repliedCount}
                          onClick={() => setMessageFilter("replied")}
                        >
                          Répondus
                        </SupportFilterButton>
                      </div>
                    </div>

                    <div className="p-4">
                      {!paginatedMessages.length ? (
                        <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center text-white/55">
                          Aucun message ne correspond à ce filtre.
                        </div>
                      ) : (
                        <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                          {paginatedMessages.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => openMessage(m)}
                              className={[
                                "group w-full rounded-[22px] border p-4 text-left transition",
                                selectedMessage?.id === m.id
                                  ? "border-[rgba(212,176,96,0.28)] bg-[rgba(212,176,96,0.08)] shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                                  : "border-white/10 bg-[rgba(255,255,255,0.03)] hover:border-white/16 hover:bg-[rgba(255,255,255,0.05)]",
                              ].join(" ")}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/88">
                                  {initials(m.name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-white">
                                        {m.subject}
                                      </p>
                                      <p className="mt-1 truncate text-sm text-white/58">
                                        {m.name} — {m.email}
                                      </p>
                                    </div>

                                    <MessageStatusPill message={m} />
                                  </div>

                                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/32">
                                    {formatDate(m.createdAt || m.updatedAt)}
                                  </p>

                                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/46">
                                    {m.message}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/8 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                          Page {messagePage} sur {totalMessagePages}
                        </div>

                        <div className="flex items-center gap-2">
                          <PagerButton
                            disabled={messagePage <= 1}
                            onClick={() =>
                              setMessagePage((p) => Math.max(1, p - 1))
                            }
                          >
                            Préc.
                          </PagerButton>

                          <div className="flex items-center gap-2">
                            {visiblePages.map((page, index) => {
                              const prev = visiblePages[index - 1];
                              const showDots = prev && page - prev > 1;

                              return (
                                <div
                                  key={page}
                                  className="flex items-center gap-2"
                                >
                                  {showDots ? (
                                    <span className="px-1 text-white/28">
                                      …
                                    </span>
                                  ) : null}

                                  <PageNumberButton
                                    page={page}
                                    active={page === messagePage}
                                    onClick={setMessagePage}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <PagerButton
                            disabled={messagePage >= totalMessagePages}
                            onClick={() =>
                              setMessagePage((p) =>
                                Math.min(totalMessagePages, p + 1),
                              )
                            }
                          >
                            Suiv.
                          </PagerButton>
                        </div>
                      </div>
                    </div>
                  </aside>

                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
                      {!selectedMessage ? (
                        <div className="flex min-h-[260px] items-center justify-center p-8 text-center text-white/55">
                          Sélectionne un message dans la colonne de gauche pour
                          afficher son contenu et préparer une réponse.
                        </div>
                      ) : (
                        <>
                          <div className="border-b border-white/8 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base text-white">
                                  {initials(selectedMessage.name)}
                                </div>

                                <div>
                                  <p className="text-xl text-white">
                                    {selectedMessage.subject}
                                  </p>
                                  <p className="mt-2 text-sm text-white/58">
                                    {selectedMessage.name} —{" "}
                                    {selectedMessage.email}
                                  </p>
                                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/34">
                                    {formatDate(
                                      selectedMessage.createdAt ||
                                        selectedMessage.updatedAt,
                                    )}
                                  </p>
                                </div>
                              </div>

                              <MessageStatusPill message={selectedMessage} />
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="rounded-[22px] border border-white/10 bg-black/10 p-5">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-white/34">
                                message reçu
                              </p>

                              <div className="mt-4 whitespace-pre-wrap leading-8 text-white/72">
                                {selectedMessage.message}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedMessage ? (
                      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
                        <div className="border-b border-white/8 p-6">
                          <p className="lux-kicker">réponse</p>
                          <p className="mt-2 text-lg text-white">
                            Préparer la réponse
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/52">
                            Rédige une réponse claire puis envoie-la directement
                            depuis l’interface admin.
                          </p>
                        </div>

                        <div className="space-y-5 p-6">
                          <div>
                            <label className="lux-label">
                              Objet de la réponse
                            </label>
                            <input
                              className="lux-input mt-2"
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="lux-label">Réponse email</label>
                            <div className="mt-2">
                              <AdminMailEditor
                                value={replyHtml}
                                onChange={setReplyHtml}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              className="lux-btn lux-btn-gold"
                              disabled={sendingReply}
                              onClick={sendReply}
                              type="button"
                            >
                              {sendingReply ? "Envoi..." : "Envoyer la réponse"}
                            </button>

                            <button
                              className="lux-btn lux-btn-ghost"
                              type="button"
                              onClick={() => {
                                setSelectedMessage(null);
                                setReplySubject("");
                                setReplyHtml("");
                              }}
                            >
                              Fermer
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                kicker="commandes"
                title="Historique des commandes"
                description="Vue synthétique des achats, des statuts de paiement et des clients associés."
                rightSlot={
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                      payées {paidOrdersCount}
                    </span>
                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                      en attente {pendingOrdersCount}
                    </span>
                    <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose-200">
                      remboursées {refundedOrdersCount}
                    </span>
                  </div>
                }
              >
                {!orders.length ? (
                  <p className="text-white/55">Aucune commande.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o, index) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:border-white/14 hover:bg-white/6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-medium text-white">
                                Commande #{o.id}
                              </p>
                              <OrderStatusPill status={o.status} />
                            </div>

                            <p className="mt-2 text-sm text-white/60">
                              {o.user?.name || "Utilisateur"} — {o.user?.email}
                            </p>

                            <p className="mt-2 text-sm text-white/52">
                              {euro(o.amountCents)} —{" "}
                              {String(o.currency || "eur").toUpperCase()}
                              {o.paymentProvider
                                ? ` • ${o.paymentProvider}`
                                : ""}
                              {o.paidAt
                                ? ` • payé le ${formatDate(o.paidAt)}`
                                : ""}
                            </p>
                          </div>

                          <div className="rounded-[18px] border border-white/10 bg-white/4 px-4 py-3 text-right">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                              total
                            </p>
                            <p className="mt-1 text-lg text-white">
                              {euro(o.amountCents)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>
      </main>
    </>
  );
}
