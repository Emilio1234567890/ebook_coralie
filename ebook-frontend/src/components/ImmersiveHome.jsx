"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAuth } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";

function Chip({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5">
      <span className="text-sm opacity-90">{children}</span>
    </span>
  );
}

function Postcard({ src, alt, className, rotate = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -4, rotate: rotate * 0.2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={[
        "glass rounded-3xl overflow-hidden border border-white/10",
        "shadow-[0_20px_90px_rgba(0,0,0,0.55)]",
        className,
      ].join(" ")}
      style={{ rotate }}
    >
      <div className="relative w-full h-full">
        <Image src={src} alt={alt} fill className="object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
      </div>
    </motion.div>
  );
}

export default function ImmersiveHome() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const tags = useMemo(
    () => ["Récit", "Immersion", "Voyage", "Identité", "Martinique"],
    [],
  );

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
    <main className="min-h-[100svh] pt-24 pb-16 px-4 relative noise caustics">
      <div className="mx-auto max-w-6xl">
        {/* HERO */}
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass rounded-[28px] p-6 sm:p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,201,195,0.20),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(220,38,127,0.14),transparent_55%)]" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.28em] opacity-80">
                eBook • accès dashboard • téléchargement
              </p>

              <h1 className="mt-3 text-4xl sm:text-6xl font-semibold leading-[1.05]">
                Une béninoise
                <span className="block">
                  en <span className="text-emerald-200">Martinique</span>
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg opacity-90 leading-relaxed">
                Une page claire, puis une immersion totale sur{" "}
                <span className="text-emerald-200/90">La Martinique</span>.
                Achète, débloque, télécharge dans ton espace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  disabled={busy || loading}
                  onClick={buy}
                  className={"btn btn-primary " + (busy ? "opacity-80" : "")}
                >
                  {busy ? "Redirection..." : "Acheter l’eBook"}
                </button>

                <Link href="/martinique" className="btn">
                  Explorer La Martinique
                </Link>

                <Link href="/#acheter" className="btn">
                  Voir le prix
                </Link>
              </div>

              {msg ? (
                <p className="mt-4 text-sm text-pink-200/90">{msg}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-2 opacity-90">
                {tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Collage */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="relative h-[420px] sm:h-[520px]"
          >
            <div className="absolute -top-2 left-0 w-[64%] h-[55%] float-slow">
              <Postcard
                src="/media/lagon.jpg"
                alt="Lagon"
                rotate={-7}
                className="w-full h-full"
              />
            </div>

            <div className="absolute top-[18%] right-0 w-[56%] h-[54%] float-slow">
              <Postcard
                src="/media/hibiscus-pool.jpg"
                alt="Hibiscus"
                rotate={10}
                className="w-full h-full"
              />
            </div>

            <div className="absolute bottom-0 left-[18%] w-[58%] h-[42%] float-slow">
              <Postcard
                src="/media/hibiscus-sunset.jpg"
                alt="Sunset"
                rotate={-2}
                className="w-full h-full"
              />
            </div>

            <div className="absolute top-4 right-4 glass rounded-2xl px-4 py-3 border border-white/10">
              <p className="text-xs uppercase tracking-[0.28em] opacity-70">
                Nouveau
              </p>
              <p className="mt-1 text-sm opacity-90">
                Page Martinique immersive
              </p>
            </div>
          </motion.section>
        </div>

        {/* SECTION “mini pitch” */}
        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          {[
            {
              k: "Accès",
              t: "Dashboard + historique",
              d: "Ton espace perso : achat, reçus, téléchargements.",
            },
            {
              k: "Contenu",
              t: "PDF propre + immédiat",
              d: "Téléchargement sécurisé après paiement.",
            },
            {
              k: "Immersion",
              t: "La Martinique (page dédiée)",
              d: "Une vraie expérience interactive, pas juste un bloc texte.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
              className="glass rounded-3xl p-6 border border-white/10"
            >
              <p className="text-xs uppercase tracking-[0.28em] opacity-70">
                {c.k}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{c.t}</h3>
              <p className="mt-2 opacity-85 leading-relaxed">{c.d}</p>
            </motion.div>
          ))}
        </div>

        {/* ACHETER */}
        <section id="acheter" className="mt-10 grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="glass rounded-3xl p-6 sm:p-10 border border-white/10"
          >
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">
              Débloquer
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold">
              Accès immédiat au PDF
            </h2>
            <p className="mt-3 opacity-85 leading-relaxed">
              Paiement Stripe. Accès au dashboard. Téléchargement sécurisé.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border border-white/10">
                <p className="text-xs uppercase tracking-[0.28em] opacity-70">
                  inclus
                </p>
                <ul className="mt-2 space-y-1 opacity-90">
                  <li>• eBook PDF</li>
                  <li>• Dashboard</li>
                  <li>• Historique</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-5 border border-white/10">
                <p className="text-xs uppercase tracking-[0.28em] opacity-70">
                  après
                </p>
                <ul className="mt-2 space-y-1 opacity-90">
                  <li>• Téléchargement</li>
                  <li>• Reçu</li>
                  <li>• Mises à jour</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="glass rounded-3xl p-6 sm:p-10 border border-emerald-200/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(24,201,195,0.18),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(220,38,127,0.10),transparent_55%)]" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.28em] opacity-70">
                Prix
              </p>

              <div className="mt-3 flex items-end gap-3">
                <span className="text-4xl font-semibold">€</span>
                <span className="text-6xl font-semibold leading-none">9</span>
                <span className="text-lg opacity-80 mb-1">.99</span>
              </div>

              <p className="mt-4 opacity-85">
                Paiement Stripe • reçu automatique
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  disabled={busy || loading}
                  onClick={buy}
                  className={
                    "btn btn-primary w-full " + (busy ? "opacity-80" : "")
                  }
                >
                  {busy
                    ? "Redirection..."
                    : user
                      ? "Payer & débloquer"
                      : "Se connecter pour acheter"}
                </button>

                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="btn w-full text-center"
                >
                  {user ? "Aller au dashboard" : "Créer un compte"}
                </Link>
              </div>

              {msg ? (
                <p className="mt-4 text-sm text-pink-200/90">{msg}</p>
              ) : null}

              <p className="mt-6 text-xs opacity-70">
                Apple Pay/CB selon appareil • Accès immédiat après paiement
              </p>
            </div>
          </motion.div>
        </section>

        <footer className="mt-12 py-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Une béninoise en Martinique
        </footer>
      </div>
    </main>
  );
}
