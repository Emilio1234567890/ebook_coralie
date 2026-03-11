"use client";

import { Header } from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const SCENES = [
  {
    id: "rocher",
    tag: "01 · présence",
    title: "Le rocher impose d’abord le silence.",
    text: "Avant les détails, il y a cette force immédiate : une masse vive, sculptée par la lumière, posée entre ciel et mer. La Martinique peut commencer comme ça, par une sensation de présence brute, presque souveraine.",
    img: "/media/martinique-rocher.jpg",
    tone: "from-[rgba(64,45,18,0.78)] to-[rgba(11,12,18,0.88)]",
  },
  {
    id: "horizon",
    tag: "02 · horizon",
    title: "L’horizon ouvre l’espace intérieur.",
    text: "Le bleu ne sert pas ici de décor. Il élargit le rythme, calme la pensée, donne au regard une profondeur plus lente. On ne contemple pas seulement la mer : on entre dans un autre tempo.",
    img: "/media/martinique-horizon.jpg",
    tone: "from-[rgba(8,44,58,0.78)] to-[rgba(10,12,18,0.9)]",
  },
  {
    id: "relief",
    tag: "03 · relief",
    title: "La forêt garde la densité du lieu.",
    text: "Montagnes, franges tropicales, eau dense, ciel lourd : tout devient plus charnel. La Martinique ne se réduit jamais à une carte postale. Elle possède une texture, une épaisseur, une respiration propre.",
    img: "/media/martinique-foret.jpg",
    tone: "from-[rgba(17,55,37,0.74)] to-[rgba(10,12,18,0.9)]",
  },
  {
    id: "anse",
    tag: "04 · anse",
    title: "Puis vient la part plus intime.",
    text: "Une anse cachée, l’ombre des branches, un bateau immobile, la transparence de l’eau. À ce moment-là, le paysage cesse d’être spectaculaire ; il devient presque confidentiel, personnel, retenu.",
    img: "/media/martinique-anse.jpg",
    tone: "from-[rgba(8,52,72,0.72)] to-[rgba(10,12,18,0.9)]",
  },
];

const ESSENCES = [
  {
    title: "Ville créole",
    text: "Des façades colorées, du relief derrière, une lumière qui donne à la ville une vibration immédiate.",
    img: "/media/martinique-ville.jpg",
  },
  {
    title: "Rue vivante",
    text: "Une circulation dense, une architecture chaude, une sensation de présence humaine qui ancre l’expérience.",
    img: "/media/martinique-rue.jpg",
  },
  {
    title: "Marché",
    text: "Fruits, épices, couleurs, textures : le lieu devient matière, odeur, geste et proximité.",
    img: "/media/martinique-marche.jpg",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

function SceneBlock({ item, index }) {
  const reverse = index % 2 === 1;

  return (
    <motion.section
      id={item.id}
      variants={fadeUp}
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
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
            <Image
              src={item.img}
              alt={item.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />

            {/* seulement un léger dégradé en bas pour le texte */}
            <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[rgba(6,8,12,0.82)] via-[rgba(6,8,12,0.28)] to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
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
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">
                fragment
              </p>

              <p className="mt-6 text-[1.02rem] leading-9 text-white/72">
                {item.text}
              </p>

              <div className="mt-8 rounded-[22px] border border-white/10 bg-white/4 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                  dans l’édition
                </p>
                <p className="mt-3 leading-8 text-white/70">
                  Ce passage prolonge l’univers du livre comme une matière
                  sensible : pas un guide, mais une présence, une atmosphère,
                  une manière de ressentir le lieu.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-white/4 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                    registre
                  </p>
                  <p className="mt-2 text-white/88">sensoriel</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/4 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                    impression
                  </p>
                  <p className="mt-2 text-white/88">
                    {index === 0
                      ? "puissance"
                      : index === 1
                        ? "respiration"
                        : index === 2
                          ? "densité"
                          : "intimité"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
function EssenceCard({ item, i }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.04),rgba(8,10,16,0.34))]" />
      </div>

      <div className="p-6">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/38">
          matière
        </p>
        <h3 className="mt-3 text-2xl text-white">{item.title}</h3>
        <p className="mt-3 leading-8 text-white/66">{item.text}</p>
      </div>
    </motion.article>
  );
}

export default function MartiniquePage() {
  return (
    <>
      <Header />

      <main className="page">
        <div className="container space-y-10">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] shadow-[0_28px_100px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_8%_0%,rgba(212,176,96,0.10),transparent_58%),radial-gradient(900px_320px_at_100%_0%,rgba(68,196,224,0.08),transparent_60%)]" />

            <div className="grid items-center gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-12 lg:px-10 lg:py-12">
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 lg:col-span-5"
              >
                <div className="flex flex-wrap gap-3">
                  <span className="lux-chip">parcours immersif</span>
                  <span className="lux-chip">regard éditorial</span>
                  <span className="lux-chip">martinique</span>
                </div>

                <p className="lux-kicker mt-8">une traversée sensible</p>

                <h1 className="mt-4 text-[clamp(3rem,8vw,6.4rem)] leading-[0.92] tracking-[-0.05em] text-white">
                  Une île qui change de visage à chaque pas.
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-9 text-white/68">
                  Ici, la Martinique ne se résume pas à une vue. Elle apparaît
                  par masses, par lumières, par respirations successives :
                  minérale, marine, tropicale, urbaine, vivante.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a href="#parcours" className="lux-btn lux-btn-gold">
                    Commencer le parcours
                  </a>
                  <Link href="/#acheter" className="lux-btn lux-btn-ghost">
                    Découvrir l’édition
                  </Link>
                </div>

                <div className="mt-12 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/4 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                      sensation
                    </p>
                    <p className="mt-2 text-white/88">ampleur</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/4 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                      regard
                    </p>
                    <p className="mt-2 text-white/88">cinématographique</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/4 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                      lecture
                    </p>
                    <p className="mt-2 text-white/88">immersive</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 lg:col-span-7"
              >
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
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
                        src="/media/martinique-ville.jpg"
                        alt="Ville créole de Martinique"
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
                        alt="Anse turquoise en Martinique"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 36vw"
                      />
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-[11px] uppercase tracking-[0.26em] text-white/40">
                        note d’intention
                      </p>
                      <p className="mt-4 leading-8 text-white/70">
                        Cette page ne montre pas la Martinique comme une
                        brochure. Elle la laisse apparaître peu à peu, comme une
                        suite de présences.
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
            {SCENES.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-[20px] border border-white/10 bg-white/4 p-5 transition hover:-translate-y-1 hover:bg-white/6"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
                  {item.tag}
                </p>
                <p className="mt-3 text-lg text-white">
                  {item.title.replace("Le ", "").replace("L’", "")}
                </p>
              </a>
            ))}
          </section>

          <div className="space-y-12">
            {SCENES.map((item, index) => (
              <SceneBlock key={item.id} item={item} index={index} />
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
                <p className="lux-kicker">vie créole</p>
                <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
                  La Martinique existe aussi dans le mouvement.
                </h2>
                <p className="mt-6 leading-8 text-white/66">
                  Après les paysages, il fallait montrer la présence humaine :
                  les façades, la rue, le rythme, les produits, les gestes. Le
                  lieu devient alors pleinement habité.
                </p>
              </motion.div>

              <div className="grid gap-4 lg:col-span-8 lg:grid-cols-3">
                {ESSENCES.map((item, i) => (
                  <EssenceCard key={item.title} item={item} i={i} />
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
    <div className="relative min-h-[360px] overflow-hidden rounded-[26px]">
      <Image
        src="/media/martinique-rue.jpg"
        alt="Rue vivante en Martinique"
        fill
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 60vw"
      />

      <div className="mq-bottom-shadow" />
      <div className="mq-bottom-accent" />

      <div className="absolute inset-x-0 bottom-0 z-[3] p-6 sm:p-8">
        <p className="lux-kicker">finale</p>
        <p className="mt-3 max-w-2xl text-3xl leading-tight text-white sm:text-4xl">
          Un lieu devient inoubliable quand il mêle paysage, matière et vie
          humaine.
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
        Cette page ouvre une atmosphère. Le livre lui donne ensuite une
        continuité plus intime, plus littéraire, plus personnelle.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/#acheter" className="lux-btn lux-btn-gold">
          Acheter l’édition
        </Link>
        <Link href="/" className="lux-btn lux-btn-ghost">
          Retour à l’accueil
        </Link>
      </div>
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
