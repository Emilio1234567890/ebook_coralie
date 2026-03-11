"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthShell({
  title,
  subtitle,
  footerText,
  footerLinkHref,
  footerLinkText,
  imageSrc = "/media/martinique-anse.jpg",
  imageAlt = "Martinique",
  badge = "espace privé",
  eyebrow = "accès édition",
  children,
}) {
  return (
    <main className="page">
      <div className="container">
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015)),rgba(17,21,30,0.96)] shadow-[0_28px_100px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_0%_0%,rgba(212,176,96,0.12),transparent_60%),radial-gradient(700px_300px_at_100%_0%,rgba(68,196,224,0.10),transparent_60%),radial-gradient(700px_320px_at_50%_100%,rgba(88,172,118,0.08),transparent_60%)]" />

          <div className="grid min-h-[78svh] lg:grid-cols-12">
            <div className="relative z-10 flex items-center px-5 py-6 sm:px-8 sm:py-8 lg:col-span-7 lg:px-10 xl:px-14">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[640px]"
              >
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/70">
                  {badge}
                </div>

                <p className="mt-8 text-[11px] uppercase tracking-[0.34em] text-white/45">
                  {eyebrow}
                </p>

                <h1 className="mt-4 text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.94] tracking-[-0.05em] text-white">
                  {title}
                </h1>

                <p className="mt-6 max-w-2xl text-[1.02rem] leading-8 text-white/68 sm:text-[1.08rem]">
                  {subtitle}
                </p>

                <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  {children}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-white/56">
                  <span>{footerText}</span>
                  <Link
                    href={footerLinkHref}
                    className="font-medium text-[rgba(245,224,175,0.96)] transition hover:text-white"
                  >
                    {footerLinkText}
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="relative min-h-[320px] lg:col-span-5">
              <div className="absolute inset-0">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.10),rgba(6,8,12,0.55))]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,18,0.10),rgba(10,12,18,0.72))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,176,96,0.18),transparent_40%)]" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="max-w-md rounded-[24px] border border-white/10 bg-[rgba(8,12,18,0.46)] p-5 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/48">
                    collection
                  </p>
                  <p className="mt-3 text-2xl leading-tight text-white sm:text-3xl">
                    Une béninoise en Martinique
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Une édition numérique pensée comme une expérience intime,
                    élégante et immersive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
