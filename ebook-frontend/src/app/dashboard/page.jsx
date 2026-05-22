"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Crown,
  Compass,
  Mail,
  RefreshCw,
  Sparkles,
  UserRound,
  LibraryBig,
  ShieldCheck,
  ArrowRight,
  Settings,
} from "lucide-react";

function formatDate(value) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function StatCard({ icon: Icon, label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "gold"
      ? "bg-[radial-gradient(circle_at_20%_0%,rgba(212,176,96,0.20),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))]"
      : tone === "emerald"
        ? "bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))]"
        : tone === "sea"
          ? "bg-[radial-gradient(circle_at_20%_0%,rgba(68,196,224,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))]"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "relative min-w-0 overflow-hidden rounded-[28px] border border-white/10 p-6",
        "shadow-[0_22px_70px_rgba(0,0,0,0.28)]",
        toneClass,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10 flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.96)]">
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">
            {label}
          </p>

          <p className="mt-3 truncate text-2xl text-white">{value}</p>

          {hint ? (
            <p className="mt-2 break-all text-sm leading-6 text-white/52">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function ActionCard({
  icon: Icon,
  kicker,
  title,
  text,
  href,
  button,
  primary = false,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.96)]">
        <Icon size={23} />
      </div>

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-white/42">
        {kicker}
      </p>

      <h2 className="mt-4 text-3xl leading-tight text-white">{title}</h2>

      <p className="mt-5 min-h-[96px] text-[1rem] leading-8 text-white/66">
        {text}
      </p>

      <div className="mt-7">
        <Link
          href={href}
          className={[
            "inline-flex min-h-[50px] items-center justify-center gap-3 rounded-[16px] px-5 text-[11px] uppercase tracking-[0.18em] transition hover:-translate-y-1",
            primary
              ? "border border-[rgba(212,176,96,0.42)] bg-[linear-gradient(180deg,rgba(245,224,175,1),rgba(212,176,96,0.96))] text-[#17130d] shadow-[0_18px_40px_rgba(212,176,96,0.24)]"
              : "border border-white/10 bg-white/5 text-white hover:bg-white/8",
          ].join(" ")}
        >
          {button}
          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.article>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
        {label}
      </p>
      <p className="mt-3 break-words text-white/82">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [ready, setReady] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [err, setErr] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    setErr(null);

    try {
      setRefreshing(true);
      const data = await apiFetch("/api/dashboard");
      setDashboard(data);
      setReady(true);
    } catch (e) {
      setErr(e.message || "Impossible de charger le dashboard.");
      setReady(true);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const displayName = user?.name || "Bienvenue";
  const userEmail = user?.email || "Email indisponible";
  const createdAt = formatDate(user?.createdAt);

  const productName =
    dashboard?.product?.name || "Une béninoise en Martinique";

  const productDescription =
    dashboard?.product?.description ||
    "Le livre est disponible gratuitement dans ta bibliothèque privée.";

  const adminHint = user?.isAdmin ? "Accès administrateur" : "Compte lecteur";

  const accessLabel = useMemo(() => {
    if (!ready || loading) return "Chargement";
    return "Ouvert";
  }, [ready, loading]);

  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-8">
          <section className="lux-hero relative overflow-hidden p-7 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(212,176,96,0.13),transparent_28%),radial-gradient(circle_at_100%_0%,rgba(68,196,224,0.10),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_34%)]" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="lux-kicker">espace personnel</p>

                <h1 className="mt-4 text-[clamp(3.6rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.06em] text-white">
                  Dashboard
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-9 text-white/70">
                  Bienvenue {displayName}. Ton espace est maintenant simplifié :
                  tu peux lire le livre gratuitement, retrouver la bibliothèque
                  et accéder aux pages importantes du site.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                    Lire gratuitement
                  </Link>

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Martinique
                  </Link>

                  {user?.isAdmin ? (
                    <Link href="/admin" className="lux-btn lux-btn-ghost">
                      Admin
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={refreshing}
                    className="lux-btn lux-btn-ghost"
                  >
                    <RefreshCw size={15} />
                    {refreshing ? "Actualisation..." : "Rafraîchir"}
                  </button>
                </div>

                {err ? (
                  <div className="mt-6 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {err}
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-8">
                  <p className="lux-kicker">statut</p>

                  <h2 className="mt-4 text-3xl text-white">
                    Lecture gratuite
                  </h2>

                  <p className="mt-5 leading-8 text-white/68">
                    Le livre est actuellement disponible gratuitement. Aucun
                    paiement n’est nécessaire pour accéder à la lecture.
                  </p>

                  <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                      produit
                    </p>
                    <p className="mt-3 text-white">{productName}</p>
                    <p className="mt-2 text-sm leading-7 text-white/58">
                      {productDescription}
                    </p>
                  </div>

                  <div className="mt-5 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    Accès gratuit activé.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={BookOpen}
              label="Accès"
              value={accessLabel}
              hint="Lecture gratuite activée"
              tone="emerald"
            />

            <StatCard
              icon={LibraryBig}
              label="Bibliothèque"
              value="Prête"
              hint="Ton espace de lecture"
              tone="gold"
            />

            <StatCard
              icon={UserRound}
              label="Compte"
              value="Connecté"
              hint={userEmail}
              tone="sea"
            />

            <StatCard
              icon={Crown}
              label="Rôle"
              value={user?.isAdmin ? "Admin" : "Utilisateur"}
              hint={adminHint}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <ActionCard
              icon={BookOpen}
              kicker="lecture"
              title="Lire le livre"
              text="Ouvre directement l’ebook dans la bibliothèque privée, avec une interface de lecture simple et confortable."
              href="/bibliotheque"
              button="Lire maintenant"
              primary
            />

            <ActionCard
              icon={Compass}
              kicker="univers"
              title="Explorer la Martinique"
              text="Découvre la page immersive qui présente l’ambiance du livre sans dévoiler tout son contenu."
              href="/martinique"
              button="Découvrir"
            />

            <ActionCard
              icon={Mail}
              kicker="support"
              title="Contacter le support"
              text="Une question, un souci d’accès ou une demande particulière ? Passe par le formulaire de contact."
              href="/contact"
              button="Contacter"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="lux-card overflow-hidden p-6 sm:p-8 lg:col-span-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.96)]">
                  <Sparkles size={24} />
                </div>

                <div>
                  <p className="lux-kicker">résumé</p>
                  <h2 className="mt-3 text-3xl text-white">
                    Ton espace est simplifié.
                  </h2>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-lg leading-9 text-white/66">
                Comme le livre est gratuit, les blocs commandes, paiements et
                historique d’achat ne sont plus affichés ici. L’objectif du
                dashboard est maintenant clair : accéder au livre, retrouver les
                informations du compte et naviguer facilement.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoLine label="Nom" value={user?.name || "Non renseigné"} />
                <InfoLine label="Email" value={userEmail} />
                <InfoLine
                  label="Compte créé"
                  value={createdAt || "Date non disponible"}
                />
                <InfoLine
                  label="Statut"
                  value={user?.isAdmin ? "Administrateur" : "Lecteur"}
                />
              </div>
            </div>

            <div className="lux-card p-6 sm:p-8 lg:col-span-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.96)]">
                <ShieldCheck size={24} />
              </div>

              <p className="lux-kicker mt-8">accès</p>
              <h2 className="mt-3 text-3xl text-white">Aucun paiement requis.</h2>

              <p className="mt-5 leading-8 text-white/66">
                Le paiement peut rester présent dans le code pour plus tard,
                mais côté utilisateur, l’accès gratuit est maintenant mis en
                avant.
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-emerald-200">
                  Lecture gratuite active
                </div>

                {user?.isAdmin ? (
                  <Link
                    href="/admin"
                    className="flex min-h-[52px] items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-white/8"
                  >
                    <Settings size={16} />
                    Ouvrir l’administration
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}