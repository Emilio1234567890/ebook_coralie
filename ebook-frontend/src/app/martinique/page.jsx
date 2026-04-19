"use client";

import { Header } from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/auth";
import { apiFetch } from "@/app/lib/api";
import { useEffect, useMemo, useState } from "react";

const JOURNEY = [
  {
    id: "depart",
    tag: "01 · départ",
    title: "Tout commence par une décision intérieure.",
    text: "Avant la beauté du décor, il y a ce moment suspendu où l’on quitte un rythme, une ville, des habitudes. La Martinique n’apparaît pas seulement comme une destination : elle commence comme un mouvement, une bascule, une promesse.",
    img: "/media/martinique-horizon.jpg",
  },
  {
    id: "arrivee",
    tag: "02 · arrivée",
    title: "Puis l’île se révèle par la chaleur, la lumière, l’accueil.",
    text: "Les premiers jours ne ressemblent pas à une brochure. Ils ont la texture du réel : une lumière différente, une énergie nouvelle, des visages, des rues, une sensation très nette d’entrer ailleurs sans totalement se perdre.",
    img: "/media/martinique-ville.jpg",
  },
  {
    id: "lifestyle",
    tag: "03 · quotidien",
    title: "Très vite, il faut apprendre un autre tempo.",
    text: "La Martinique se vit aussi dans les trajets, les habitudes, le coût des choses, les rencontres, les ajustements. C’est là que l’expérience devient plus profonde : elle oblige à observer, ralentir, comprendre autrement.",
    img: "/media/martinique-rue.jpg",
  },
  {
    id: "nature",
    tag: "04 · nature",
    title: "Et soudain, la nature reprend toute la place.",
    text: "Reliefs, anses, plages, forêt, souffle marin : l’île offre constamment plus que de jolies images. Elle impose une relation sensible au paysage, presque physique, comme si l’on apprenait à habiter le décor autant qu’à le regarder.",
    img: "/media/martinique-anse.jpg",
  },
];

const FACETS = [
  {
    title: "S’installer",
    text: "Le livre traverse aussi l’envers du départ : logement, repères, mobilité, premiers choix.",
    img: "/media/martinique-rocher.jpg",
  },
  {
    title: "Vivre l’île",
    text: "Le quotidien martiniquais apparaît dans sa chaleur, son rythme, ses contrastes et ses usages.",
    img: "/media/martinique-marche.jpg",
  },
  {
    title: "Se transformer",
    text: "Au fil du récit, l’île devient aussi un espace de croissance, d’autonomie et de repositionnement intérieur.",
    img: "/media/martinique-foret.jpg",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
  },
};

function JourneyBlock({ item, index }) {
  const reverse = index % 2 === 1;

  return (
    <motion.section
      id={item.id}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10"
    >
      <div
        className={[
          "lg:col-span-7",
          reverse ? "lg:order-2" : "lg:order-1",
        ].join(" ")}
      >
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
            <Image
              src={item.img}
              alt={item.title}
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.06),rgba(8,10,16,0.22))]" />
            <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[rgba(6,8,12,0.88)] via-[rgba(6,8,12,0.30)] to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/68">
                {item.tag}
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl leading-[1.02] text-white sm:text-5xl">
                {item.title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          "lg:col-span-5",
          reverse ? "lg:order-1" : "lg:order-2",
        ].join(" ")}
      >
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-start gap-5">
            <div className="text-[clamp(3.4rem,8vw,6rem)] leading-none tracking-[-0.08em] text-white/10">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="flex-1 pt-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                dans le livre
              </p>

              <p className="mt-6 text-[1.02rem] leading-9 text-white/72">
                {item.text}
              </p>

              <div className="mt-8 rounded-[22px] border border-white/10 bg-white/4 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                  tonalité
                </p>
                <p className="mt-3 leading-8 text-white/70">
                  Le récit avance par sensations, détails vécus, fragments de
                  quotidien et transformations intérieures, sans jamais se
                  réduire à une simple liste de conseils.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FacetCard({ item, i }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: i * 0.06 }}
      whileHover={{ y: -5 }}
      className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl"
    >
      <div className="relative h-[260px]">
        <Image
          src={item.img}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.04),rgba(8,10,16,0.36))]" />
      </div>

      <div className="p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
          fragment
        </p>
        <h3 className="mt-3 text-2xl text-white">{item.title}</h3>
        <p className="mt-3 leading-8 text-white/66">{item.text}</p>
      </div>
    </motion.article>
  );
}

export default function MartiniquePage() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

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

  const ctaLabel = useMemo(() => {
    if (checkingAccess) return "Vérification";
    return hasAccess ? "déjà débloquée" : "immersive";
  }, [checkingAccess, hasAccess]);

  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-10">
          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] shadow-[0_28px_100px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_8%_0%,rgba(212,176,96,0.10),transparent_58%),radial-gradient(900px_320px_at_100%_0%,rgba(68,196,224,0.08),transparent_60%)]" />

            <div className="grid items-center gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-12 lg:px-10 lg:py-12">
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 lg:col-span-5"
              >
                <div className="flex flex-wrap gap-3">
                  <span className="lux-chip">récit sensible</span>
                  <span className="lux-chip">martinique</span>
                  <span className="lux-chip">sans tout dévoiler</span>
                </div>

                <p className="lux-kicker mt-8">un avant-goût de l’édition</p>

                <h1 className="mt-4 text-[clamp(3rem,8vw,6.2rem)] leading-[0.92] tracking-[-0.05em] text-white">
                  Une île qui ne se laisse pas réduire à une carte postale.
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-9 text-white/68">
                  Cette page n’essaie pas de raconter tout le livre. Elle en
                  laisse seulement apparaître la matière : le départ, l’arrivée,
                  le rythme du quotidien, la puissance du paysage, et ce que
                  l’île change à l’intérieur.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a href="#parcours" className="lux-btn lux-btn-gold">
                    Explorer les fragments
                  </a>

                  {hasAccess ? (
                    <Link
                      href="/bibliotheque"
                      className="lux-btn lux-btn-ghost"
                    >
                      Aller à la bibliothèque
                    </Link>
                  ) : (
                    <Link href="/#acheter" className="lux-btn lux-btn-ghost">
                      Découvrir l’édition
                    </Link>
                  )}
                </div>

                {hasAccess ? (
                  <div className="mt-6 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    Ton ebook est déjà disponible dans ta bibliothèque.
                  </div>
                ) : null}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 lg:col-span-7"
              >
                <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                  <div className="space-y-4">
                    <div className="relative h-[240px] overflow-hidden rounded-[24px] border border-white/10">
                      <Image
                        src="/media/martinique-horizon.jpg"
                        alt="Horizon de Martinique"
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    </div>

                    <div className="relative h-[340px] overflow-hidden rounded-[24px] border border-white/10">
                      <Image
                        src="/media/martinique-rue.jpg"
                        alt="Rue vivante de Martinique"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 lg:pt-14">
                    <div className="relative h-[430px] overflow-hidden rounded-[24px] border border-white/10">
                      <Image
                        src="/media/martinique-anse.jpg"
                        alt="Anse en Martinique"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 36vw"
                      />
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                        intention
                      </p>
                      <p className="mt-4 leading-8 text-white/70">
                        Montrer l’île sans la réduire, donner envie d’ouvrir le
                        livre sans en livrer tous les repères, les lieux ni les
                        conseils qu’il contient.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section
            id="parcours"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {JOURNEY.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-[20px] border border-white/10 bg-white/4 p-5 transition hover:-translate-y-1 hover:bg-white/6"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                  {item.tag}
                </p>
                <p className="mt-3 text-lg leading-7 text-white">
                  {item.title}
                </p>
              </a>
            ))}
          </section>

          <div className="space-y-12">
            {JOURNEY.map((item, index) => (
              <JourneyBlock key={item.id} item={item} index={index} />
            ))}
          </div>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.24 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-4"
              >
                <p className="lux-kicker">ce que le livre laisse entrevoir</p>
                <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
                  Une expérience plus large que le décor.
                </h2>
                <p className="mt-6 leading-8 text-white/66">
                  Il y a la beauté, bien sûr. Mais aussi l’installation, les
                  habitudes à reconstruire, les contrastes de l’île, les
                  découvertes, et la façon dont un lieu peut peu à peu
                  transformer une personne.
                </p>
              </motion.div>

              <div className="grid gap-4 lg:col-span-8 lg:grid-cols-3">
                {FACETS.map((item, i) => (
                  <FacetCard key={item.title} item={item} i={i} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <motion.div
              className="mq-panel-sea mq-panel overflow-hidden lg:col-span-7"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative min-h-[380px] overflow-hidden rounded-[26px]">
                <Image
                  src="/media/martinique-foret.jpg"
                  alt="Relief tropical en Martinique"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                <div className="mq-bottom-shadow" />
                <div className="mq-bottom-accent" />

                <div className="absolute inset-x-0 bottom-0 z-[3] p-6 sm:p-8">
                  <p className="lux-kicker">dernière impression</p>
                  <p className="mt-3 max-w-2xl text-3xl leading-tight text-white sm:text-4xl">
                    Certaines îles se visitent. D’autres déplacent quelque chose
                    en nous.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.75 }}
              className="flex items-center lg:col-span-5"
            >
              <div className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(36,28,18,0.96),rgba(12,13,18,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8 lg:p-10">
                <p className="lux-kicker">prolonger l’expérience</p>
                <h2 className="mt-4 text-3xl text-white sm:text-4xl">
                  Entrer dans l’édition.
                </h2>
                <p className="mt-5 leading-8 text-white/66">
                  Cette page ouvre une porte. Le livre, lui, va plus loin :
                  installation, quotidien, nature, réalités, conseils et
                  transformation personnelle s’y déploient avec plus d’intimité.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  {hasAccess ? (
                    <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                      Lire l’ebook
                    </Link>
                  ) : (
                    <Link href="/#acheter" className="lux-btn lux-btn-gold">
                      Acheter l’édition
                    </Link>
                  )}

                  <Link href="/" className="lux-btn lux-btn-ghost">
                    Retour à l’accueil
                  </Link>
                </div>

                {hasAccess ? (
                  <div className="mt-6 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    L’édition est déjà disponible dans ton espace privé.
                  </div>
                ) : null}
              </div>
            </motion.div>
          </section>

          <footer className="pt-4">
            <div className="h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
            <div className="py-8 text-center text-[11px] uppercase tracking-[0.28em] text-white/34">
              © {new Date().getFullYear()} Une béninoise en Martinique
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
