"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function Detail({ title, text }) {
  return (
    <motion.div
      variants={reveal}
      className="lux-card p-6"
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      <h3 className="mt-1 text-2xl text-white">{title}</h3>
      <p className="mt-3 leading-7 text-white/62">{text}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const price = useMemo(() => ({ euros: "14", cents: "99" }), []);

  useEffect(() => {
    async function loadAccess() {
      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        setCheckingAccess(true);
        const r = await apiFetch("/api/dashboard");
        setHasAccess(!!r.hasAccess);
      } catch {
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    }

    loadAccess();
  }, [user]);

  async function buy() {
    setMsg(null);

    if (!user) {
      router.push("/login");
      return;
    }

    if (hasAccess) {
      router.push("/bibliotheque");
      return;
    }

    try {
      setBusy(true);
      router.push("/checkout");
    } catch (e) {
      setMsg(e.message || "Impossible d’ouvrir la page de checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <section className="lux-hero relative min-h-[82svh] overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="lux-orb lux-float left-[-120px] top-[40px] h-[260px] w-[260px] bg-[rgba(212,176,96,0.10)]" />
            <div className="lux-orb right-[-100px] top-[90px] h-[240px] w-[240px] bg-[rgba(255,255,255,0.06)]" />
            <div className="lux-orb bottom-[-120px] left-[30%] h-[280px] w-[280px] bg-[rgba(212,176,96,0.08)]" />

            <div className="grid items-center gap-10 lg:grid-cols-12">
              <motion.div
                className="relative z-10 pt-6 lg:col-span-7 lg:pt-10"
                initial="hidden"
                animate="show"
              >
                <motion.div
                  custom={0}
                  variants={reveal}
                  className="flex flex-wrap gap-3"
                >
                  <span className="lux-chip">récit personnel</span>
                  <span className="lux-chip">accès privé</span>
                  <span className="lux-chip">édition numérique</span>
                </motion.div>

                <motion.p
                  custom={1}
                  variants={reveal}
                  className="lux-kicker mt-8"
                >
                  une béninoise en martinique
                </motion.p>

                <motion.h1
                  custom={2}
                  variants={reveal}
                  className="lux-title mt-4 max-w-4xl"
                >
                  Un récit d’installation, de lumière, de réalités vécues et de
                  transformation intérieure.
                </motion.h1>

                <motion.p
                  custom={3}
                  variants={reveal}
                  className="lux-subtitle mt-8 max-w-2xl"
                >
                  Plus qu’un simple ebook sur la Martinique, cette édition suit
                  un mouvement intime : partir, s’adapter, découvrir l’île,
                  affronter ses contrastes, puis se laisser transformer par ce
                  qu’elle révèle.
                </motion.p>

                <motion.div
                  custom={4}
                  variants={reveal}
                  className="mt-10 flex flex-wrap gap-4"
                >
                  {hasAccess ? (
                    <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                      Aller à la bibliothèque
                    </Link>
                  ) : (
                    <button
                      disabled={busy || loading || checkingAccess}
                      onClick={buy}
                      className="lux-btn lux-btn-gold"
                      type="button"
                    >
                      {busy ? "Ouverture..." : "Accéder à l’édition"}
                    </button>
                  )}

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Explorer l’univers
                  </Link>
                </motion.div>

                {msg ? (
                  <motion.p
                    custom={5}
                    variants={reveal}
                    className="mt-5 text-sm text-rose-400"
                  >
                    {msg}
                  </motion.p>
                ) : null}

                <motion.div
                  custom={6}
                  variants={reveal}
                  className="mt-12 flex flex-wrap items-end gap-6"
                >
                  <div>
                    <p className="lux-kicker">édition numérique</p>
                    <p className="mt-2 text-5xl text-white">
                      {price.euros}
                      <span className="text-2xl text-white/56">
                        .{price.cents} €
                      </span>
                    </p>
                  </div>

                  <div className="h-14 w-px bg-white/10" />

                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                      accès
                    </p>
                    <p className="mt-2 text-lg text-white/78">
                      {hasAccess
                        ? "Déjà disponible dans ta bibliothèque."
                        : "Privé, immédiat, personnel."}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="relative lg:col-span-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative mx-auto aspect-[4/5] max-w-[460px] overflow-hidden rounded-[34px] border border-white/10 bg-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
                  <Image
                    src="/media/hibiscus-sunset.jpg"
                    alt="Univers de l’ebook Une béninoise en Martinique"
                    fill
                    className="object-cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.06),rgba(10,10,12,0.58))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,176,96,0.22),transparent_45%)]" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="mt-3 text-3xl leading-tight text-white">
                      Une béninoise en Martinique
                    </p>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                      Une lecture intime et immersive, entre installation,
                      culture, nature, réalités du quotidien et nouvelles
                      perspectives.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <Detail
              title="Un départ"
              text="Le livre part d’un vrai basculement : quitter un cadre connu pour construire une vie ailleurs."
            />
            <Detail
              title="Une île réelle"
              text="La Martinique y apparaît belle, vivante, contrastée, sensible — jamais réduite à une simple image paradisiaque."
            />
            <Detail
              title="Une transformation"
              text="Au fil des pages, le récit parle aussi d’autonomie, d’adaptation, de rythme de vie et de croissance personnelle."
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-12">
            <motion.div
              className="lux-card p-8 lg:col-span-7"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7 }}
            >
              <p className="lux-kicker">à propos de l’ouvrage</p>
              <h2 className="mt-4 text-4xl text-white">
                Plus qu’un simple ebook sur la Martinique.
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-white/64">
                Cette édition mêle récit personnel, installation, vie
                quotidienne, nature, culture, réalités concrètes et bonnes
                adresses. Elle se lit comme une traversée vécue, avec sa
                douceur, ses contrastes et ses révélations.
              </p>

              <div className="mt-8 lux-divider" />

              <div className="mt-8 flex flex-wrap gap-4">
                {hasAccess ? (
                  <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                    Lire l’ebook
                  </Link>
                ) : (
                  <button
                    disabled={busy || loading || checkingAccess}
                    onClick={buy}
                    className="lux-btn lux-btn-gold"
                    type="button"
                  >
                    {busy ? "Ouverture..." : "Acheter l’édition"}
                  </button>
                )}

                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="lux-btn lux-btn-ghost"
                >
                  {user ? "Mon espace" : "Créer un compte"}
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="lux-card p-8 lg:col-span-5"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              <p className="lux-kicker">accès</p>
              <h2 className="mt-4 text-3xl text-white">
                Une acquisition simple, une lecture durable.
              </h2>
              <p className="mt-5 leading-8 text-white/64">
                Après achat, l’édition est débloquée dans ton espace personnel
                et reste accessible depuis ta bibliothèque privée.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Paiement sécurisé</p>
                  <p className="mt-2 text-sm text-white/55">Carte ou PayPal</p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Accès privé</p>
                  <p className="mt-2 text-sm text-white/55">Compte personnel</p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Lecture en ligne</p>
                  <p className="mt-2 text-sm text-white/55">
                    Disponible après achat
                  </p>
                </div>
              </div>

              {hasAccess ? (
                <div className="mt-6 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Tu possèdes déjà cet ebook dans ta bibliothèque.
                </div>
              ) : null}
            </motion.div>
          </section>

          <footer className="mt-12 pb-3 pt-6 text-center text-xs uppercase tracking-[0.24em] text-white/35">
            © {new Date().getFullYear()} Une béninoise en Martinique
          </footer>
        </div>
      </main>
    </>
  );
}
