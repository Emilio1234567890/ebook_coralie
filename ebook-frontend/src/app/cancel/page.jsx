"use client";

import { Header } from "../../components/Header";
import Link from "next/link";

export default function CancelPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="text-3xl font-semibold">Paiement annulé</h1>
        <p className="mt-3 opacity-80">
          Aucun souci. Tu peux réessayer quand tu veux.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-5 py-3 rounded-full bg-white/10 hover:bg-white/15"
          >
            Retour à l’accueil
          </Link>
        </div>
      </main>
    </>
  );
}
