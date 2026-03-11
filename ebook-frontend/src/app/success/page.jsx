"use client";

import { Header } from "@/components/Header";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SuccessPage() {
  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lux-hero px-6 py-10 text-center sm:px-8 sm:py-12"
          >
            <p className="lux-kicker">paiement validé</p>

            <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.04em] text-white">
              Ton accès est maintenant actif.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/66">
              Tu peux retrouver ton ebook dans ta bibliothèque privée ou
              consulter les informations de paiement depuis ton dashboard.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/bibliotheque" className="lux-btn lux-btn-gold">
                Lire l’ebook
              </Link>

              <Link href="/dashboard" className="lux-btn lux-btn-ghost">
                Aller au dashboard
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
