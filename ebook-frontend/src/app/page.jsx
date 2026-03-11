"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
      <p className="lux-kicker">édition</p>
      <h3 className="mt-3 text-2xl text-white">{title}</h3>
      <p className="mt-3 leading-7 text-white/62">{text}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const price = useMemo(() => ({ euros: "9", cents: "99" }), []);

  async function buy() {
    setMsg(null);
    if (!user) return router.push("/login");

    try {
      setBusy(true);
      const r = await apiFetch("/api/checkout-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      window.location.href = r.url;
    } catch (e) {
      setMsg(e.message);
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
                  <span className="lux-chip">ebook signature</span>
                  <span className="lux-chip">récit sensible</span>
                  <span className="lux-chip">accès privé</span>
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
                  Un récit de lumière, d’exil intime et d’élégance tropicale.
                </motion.h1>

                <motion.p
                  custom={3}
                  variants={reveal}
                  className="lux-subtitle mt-8 max-w-2xl"
                >
                  Une traversée délicate entre identité, sensations et mémoire,
                  portée par l’atmosphère singulière de la Martinique.
                </motion.p>

                <motion.div
                  custom={4}
                  variants={reveal}
                  className="mt-10 flex flex-wrap gap-4"
                >
                  <button
                    disabled={busy || loading}
                    onClick={buy}
                    className="lux-btn lux-btn-gold"
                  >
                    {busy ? "Redirection..." : "Accéder à l’édition"}
                  </button>

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Entrer dans l’univers
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
                      Privé, immédiat, personnel.
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
                    alt="Couverture de l’ebook"
                    fill
                    className="object-cover"
                    priority
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.06),rgba(10,10,12,0.55))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,176,96,0.22),transparent_45%)]" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="lux-kicker">collection</p>
                    <p className="mt-3 text-3xl leading-tight text-white">
                      Une béninoise en Martinique
                    </p>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                      Une pièce éditoriale pensée comme une expérience de
                      lecture précieuse, intime et mémorable.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <Detail
              title="Une voix"
              text="Une écriture incarnée, délicate et personnelle, loin des promesses marketing génériques."
            />
            <Detail
              title="Une atmosphère"
              text="La chaleur, la lumière, les textures et les contrastes deviennent une matière narrative."
            />
            <Detail
              title="Une pièce à garder"
              text="Un format numérique pensé comme une édition à posséder, relire et offrir à son propre rythme."
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
                Plus qu’un simple ebook.
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-white/64">
                Cette édition ne se présente pas comme un guide, ni comme une
                fiche pratique. Elle s’approche davantage d’un objet littéraire
                court : un espace de sensations, de déplacements intérieurs et
                de présence.
              </p>

              <div className="mt-8 lux-divider" />

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  disabled={busy || loading}
                  onClick={buy}
                  className="lux-btn lux-btn-gold"
                >
                  {busy ? "Redirection..." : "Acheter l’édition"}
                </button>

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
                Une acquisition simple, une présence durable.
              </h2>
              <p className="mt-5 leading-8 text-white/64">
                Après achat, l’accès est débloqué dans ton espace personnel pour
                retrouver ton édition et la télécharger à tout moment.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Paiement sécurisé</p>
                  <p className="mt-2 text-sm text-white/55">Stripe</p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Accès privé</p>
                  <p className="mt-2 text-sm text-white/55">Compte personnel</p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-white">Téléchargement</p>
                  <p className="mt-2 text-sm text-white/55">
                    Disponible après achat
                  </p>
                </div>
              </div>
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
