"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Feather,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FREE_EBOOK_ACCESS =
  String(process.env.NEXT_PUBLIC_FREE_EBOOK_ACCESS || "").toLowerCase() ===
  "true";

const HERO_SLIDES = [
  {
    id: "anse",
    kicker: "martinique",
    title: "Une traversée intime entre départ, lumière et renaissance.",
    text: "Un ebook sensible qui raconte l’expérience d’une Béninoise en Martinique, entre paysages, quotidien, adaptation et transformation personnelle.",
    image: "/media/martinique-anse.jpg",
    badge: "lecture immersive",
  },
  {
    id: "horizon",
    kicker: "récit personnel",
    title: "Un récit qui ne vend pas du rêve. Il raconte une vraie expérience.",
    text: "La beauté de l’île, mais aussi les repères à reconstruire, les découvertes, les contrastes et les émotions d’un nouveau départ.",
    image: "/media/martinique-horizon.jpg",
    badge: "vécu & sincère",
  },
  {
    id: "ville",
    kicker: "vie locale",
    title: "Derrière les paysages, il y a le quotidien, les rues, les choix.",
    text: "Le livre ouvre une fenêtre sur l’installation, les habitudes, le rythme martiniquais et ce que l’île change dans la manière de voir les choses.",
    image: "/media/martinique-ville.jpg",
    badge: "accès gratuit",
  },
  {
    id: "foret",
    kicker: "évasion",
    title: "Une île qui se ressent autant qu’elle se regarde.",
    text: "Reliefs, mer, chaleur, rencontres et émotions : une lecture courte, belle et accessible, pensée comme une porte d’entrée vers la Martinique.",
    image: "/media/martinique-foret.jpg",
    badge: "ebook offert",
  },
];

const DETAILS = [
  {
    icon: Feather,
    title: "Une voix sincère",
    text: "Un récit simple, humain et personnel, loin d’un texte froid ou trop commercial.",
  },
  {
    icon: Compass,
    title: "Une vraie immersion",
    text: "On découvre l’île par ses sensations, son rythme, ses contrastes et son quotidien.",
  },
  {
    icon: BookOpen,
    title: "Lecture gratuite",
    text: "L’ebook est accessible gratuitement depuis la bibliothèque, sans achat obligatoire.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Découvrir l’univers",
    text: "Entre dans l’ambiance du livre avec une page immersive dédiée à la Martinique.",
  },
  {
    number: "02",
    title: "Créer ton espace",
    text: "Un compte permet de retrouver facilement la bibliothèque et l’accès au livre.",
  },
  {
    number: "03",
    title: "Lire gratuitement",
    text: "Ouvre l’ebook dans une interface de lecture privée, fluide et pensée pour le confort.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function DetailCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.article
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.28 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(212,176,96,0.10)] blur-3xl transition group-hover:bg-[rgba(212,176,96,0.16)]" />

      <div className="relative z-10">
        <div className="flex h-13 w-13 items-center justify-center rounded-[20px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.95)]">
          <Icon size={22} />
        </div>

        <h3 className="mt-6 text-2xl text-white">{item.title}</h3>
        <p className="mt-4 leading-8 text-white/62">{item.text}</p>
      </div>
    </motion.article>
  );
}

function StepCard({ item, index }) {
  return (
    <motion.article
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.26 }}
      className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.06]"
    >
      <p className="text-5xl leading-none tracking-[-0.08em] text-white/10">
        {item.number}
      </p>

      <h3 className="mt-5 text-2xl text-white">{item.title}</h3>
      <p className="mt-4 leading-8 text-white/62">{item.text}</p>
    </motion.article>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [hasAccess, setHasAccess] = useState(FREE_EBOOK_ACCESS);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const currentSlide = HERO_SLIDES[activeSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((index) => (index + 1) % HERO_SLIDES.length);
    }, 5200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadAccess() {
      if (FREE_EBOOK_ACCESS) {
        setHasAccess(true);
        return;
      }

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

  const price = useMemo(() => ({ euros: "14", cents: "99" }), []);

  async function mainAction() {
    setMsg(null);

    if (FREE_EBOOK_ACCESS) {
      if (user) {
        router.push("/bibliotheque");
      } else {
        router.push("/register");
      }
      return;
    }

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
      setMsg(e.message || "Impossible d’ouvrir la page demandée.");
    } finally {
      setBusy(false);
    }
  }

  const mainButtonLabel = useMemo(() => {
    if (busy) return "Ouverture...";
    if (FREE_EBOOK_ACCESS)
      return user ? "Lire gratuitement" : "Créer mon accès gratuit";
    if (checkingAccess || loading) return "Vérification...";
    if (hasAccess) return "Aller à la bibliothèque";
    return "Accéder à l’édition";
  }, [busy, checkingAccess, loading, hasAccess, user]);

  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-9">
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] shadow-[0_34px_110px_rgba(0,0,0,0.42)]">
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(900px_360px_at_8%_0%,rgba(212,176,96,0.16),transparent_60%),radial-gradient(800px_360px_at_100%_5%,rgba(68,196,224,0.12),transparent_62%),linear-gradient(180deg,rgba(7,10,16,0.15),rgba(7,10,16,0.74))]" />

            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:82px_82px] opacity-40 [mask-image:linear-gradient(180deg,black,transparent_72%)]" />

            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,12,0.92),rgba(6,8,12,0.52)_42%,rgba(6,8,12,0.18)_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.15),rgba(6,8,12,0.82))]" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative z-20 grid min-h-[86svh] items-center gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-12 lg:px-12 lg:py-14">
              <motion.div
                initial="hidden"
                animate="show"
                className="max-w-4xl lg:col-span-7"
              >
                <motion.div
                  custom={0}
                  variants={reveal}
                  className="flex flex-wrap gap-3"
                >
                  <span className="lux-chip">ebook gratuit</span>
                  <span className="lux-chip">martinique</span>
                  <span className="lux-chip">récit vécu</span>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="lux-kicker mt-8">{currentSlide.kicker}</p>

                    <h1 className="mt-5 max-w-5xl text-[clamp(3.4rem,8vw,7.1rem)] leading-[0.9] tracking-[-0.065em] text-white">
                      {currentSlide.title}
                    </h1>

                    <p className="mt-8 max-w-2xl text-lg leading-9 text-white/72">
                      {currentSlide.text}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  custom={4}
                  variants={reveal}
                  className="mt-10 flex flex-wrap gap-4"
                >
                  <button
                    type="button"
                    disabled={busy || loading || checkingAccess}
                    onClick={mainAction}
                    className="lux-btn lux-btn-gold"
                  >
                    {mainButtonLabel}
                    <ArrowRight size={16} />
                  </button>

                  <Link href="/martinique" className="lux-btn lux-btn-ghost">
                    Découvrir l’univers
                  </Link>
                </motion.div>

                {msg ? (
                  <motion.p
                    custom={5}
                    variants={reveal}
                    className="mt-5 text-sm text-rose-300"
                  >
                    {msg}
                  </motion.p>
                ) : null}

                <motion.div
                  custom={6}
                  variants={reveal}
                  className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3"
                >
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                      accès
                    </p>
                    <p className="mt-2 text-white">
                      {FREE_EBOOK_ACCESS ? "Gratuit" : "Privé"}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                      lecture
                    </p>
                    <p className="mt-2 text-white">En ligne</p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                      univers
                    </p>
                    <p className="mt-2 text-white">Martinique</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 26, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5"
              >
                <div className="relative mx-auto max-w-[500px]">
                  <div className="pointer-events-none absolute -inset-8 rounded-[44px] bg-[radial-gradient(circle_at_30%_20%,rgba(212,176,96,0.24),transparent_48%),radial-gradient(circle_at_80%_70%,rgba(68,196,224,0.18),transparent_48%)] blur-2xl" />

                  <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.06] p-4 shadow-[0_36px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-white/10 bg-black">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`card-${currentSlide.id}`}
                          initial={{ opacity: 0, scale: 1.08, rotate: 1.2 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.98, rotate: -1.2 }}
                          transition={{
                            duration: 0.72,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={currentSlide.image}
                            alt={currentSlide.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                          />
                        </motion.div>
                      </AnimatePresence>

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.02),rgba(6,8,12,0.78))]" />

                      <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/76 backdrop-blur-md">
                        {currentSlide.badge}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p className="text-3xl leading-tight text-white">
                          Une béninoise en Martinique
                        </p>
                        <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                          Une expérience de lecture douce, personnelle et
                          accessible gratuitement.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {HERO_SLIDES.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveSlide(index)}
                          className={[
                            "relative h-16 overflow-hidden rounded-[16px] border transition",
                            activeSlide === index
                              ? "border-[rgba(245,224,175,0.8)] opacity-100"
                              : "border-white/10 opacity-60 hover:opacity-100",
                          ].join(" ")}
                          aria-label={`Afficher l’image ${index + 1}`}
                        >
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                          <div className="absolute inset-0 bg-black/10" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={`dot-${slide.id}`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={[
                    "h-2 rounded-full transition-all",
                    activeSlide === index
                      ? "w-9 bg-[rgba(245,224,175,0.95)]"
                      : "w-2 bg-white/35 hover:bg-white/60",
                  ].join(" ")}
                  aria-label={`Aller au slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {DETAILS.map((item, index) => (
              <DetailCard key={item.title} item={item} index={index} />
            ))}
          </section>

          <section
            id="acheter"
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,26,16,0.96),rgba(9,14,22,0.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.36)] sm:p-8 lg:p-10"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(212,176,96,0.13)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-[rgba(68,196,224,0.10)] blur-3xl" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.26 }}
                transition={{ duration: 0.75 }}
                className="lg:col-span-7"
              >
                <p className="lux-kicker">
                  {FREE_EBOOK_ACCESS ? "lecture gratuite" : "accès édition"}
                </p>

                <h2 className="mt-4 text-4xl leading-tight text-white sm:text-6xl">
                  {FREE_EBOOK_ACCESS
                    ? "Le livre est maintenant disponible gratuitement."
                    : "Une lecture privée, simple et immédiate."}
                </h2>

                <p className="mt-6 max-w-2xl text-lg leading-9 text-white/68">
                  {FREE_EBOOK_ACCESS
                    ? "Crée ton espace ou connecte-toi pour ouvrir la bibliothèque et commencer la lecture en ligne."
                    : "Après achat, l’ebook est débloqué dans ton espace personnel pour être lu depuis la bibliothèque privée."}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    disabled={busy || loading || checkingAccess}
                    onClick={mainAction}
                    className="lux-btn lux-btn-gold"
                  >
                    {mainButtonLabel}
                    <ArrowRight size={16} />
                  </button>

                  <Link href="/contact" className="lux-btn lux-btn-ghost">
                    Une question ?
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.26 }}
                transition={{ duration: 0.75, delay: 0.08 }}
                className="lg:col-span-5"
              >
                <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                        tarif
                      </p>

                      {FREE_EBOOK_ACCESS ? (
                        <p className="mt-3 text-5xl text-white">0 €</p>
                      ) : (
                        <p className="mt-3 text-5xl text-white">
                          {price.euros}
                          <span className="text-2xl text-white/56">
                            .{price.cents} €
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                      {FREE_EBOOK_ACCESS ? "offert" : "sécurisé"}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      "Accès à la bibliothèque",
                      "Lecture en ligne",
                      "Compte personnel",
                      FREE_EBOOK_ACCESS
                        ? "Aucun paiement requis"
                        : "Paiement sécurisé",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/10 px-4 py-3 text-white/72"
                      >
                        <CheckCircle2 size={17} className="text-emerald-200" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.26 }}
              transition={{ duration: 0.75 }}
              className="lux-card p-7 sm:p-8 lg:col-span-5"
            >
              <p className="lux-kicker">comment ça marche</p>
              <h2 className="mt-4 text-4xl leading-tight text-white">
                Une expérience simple, sans friction.
              </h2>
              <p className="mt-5 leading-8 text-white/64">
                L’objectif est clair : arriver sur le site, comprendre
                l’univers, ouvrir son espace et commencer la lecture sans se
                perdre dans un tunnel compliqué.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-[rgba(245,224,175,0.95)]">
                  <LockKeyhole size={20} />
                </div>

                <div>
                  <p className="text-white">Espace privé</p>
                  <p className="mt-1 text-sm text-white/52">
                    Tes accès restent liés à ton compte.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4 lg:col-span-7">
              {STEPS.map((item, index) => (
                <StepCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black shadow-[0_28px_100px_rgba(0,0,0,0.34)]">
            <div className="relative min-h-[420px]">
              <Image
                src="/media/martinique-rue.jpg"
                alt="Rue vivante en Martinique"
                fill
                className="object-cover"
                sizes="100vw"
              />

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,12,0.88),rgba(6,8,12,0.34)),linear-gradient(180deg,rgba(6,8,12,0.12),rgba(6,8,12,0.82))]" />

              <div className="relative z-10 flex min-h-[420px] items-end p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl">
                  <p className="lux-kicker">avant-goût</p>
                  <h2 className="mt-4 text-4xl leading-tight text-white sm:text-6xl">
                    La Martinique n’est pas seulement le décor du livre. Elle en
                    devient une présence.
                  </h2>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/martinique" className="lux-btn lux-btn-gold">
                      Voir la page Martinique
                    </Link>

                    <Link
                      href="/bibliotheque"
                      className="lux-btn lux-btn-ghost"
                    >
                      Ouvrir la bibliothèque
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="pb-3 pt-4 text-center">
            <div className="h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
            <div className="py-8 text-xs uppercase tracking-[0.24em] text-white/35">
              © {new Date().getFullYear()} Une béninoise en Martinique
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
