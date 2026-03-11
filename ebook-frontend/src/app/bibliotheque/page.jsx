"use client";

import { Header } from "@/components/Header";
import { apiFetch, getToken } from "@/app/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BibliothequePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    async function load() {
      setErr(null);
      setLoading(true);

      try {
        const dashboard = await apiFetch("/api/dashboard");
        if (!dashboard?.hasAccess) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setHasAccess(true);

        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/download`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Impossible de charger l’ebook.");
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (e) {
        setErr(e.message || "Erreur.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="lux-card p-8 text-white/70">
          Chargement de ta bibliothèque...
        </div>
      );
    }

    if (err) {
      return (
        <div className="rounded-[20px] border border-rose-400/20 bg-rose-400/10 p-5 text-rose-200">
          {err}
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="lux-card p-8">
          <p className="lux-kicker">accès requis</p>
          <h2 className="mt-3 text-3xl text-white">Ebook non débloqué</h2>
          <p className="mt-4 max-w-2xl leading-8 text-white/62">
            Ton accès n’est pas encore actif. Une fois le paiement validé, tu
            pourras lire l’édition ici.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="lux-btn lux-btn-gold"
            >
              Aller au dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="lux-card p-6 sm:p-8">
          <p className="lux-kicker">bibliothèque</p>
          <h2 className="mt-3 text-3xl text-white">
            Une béninoise en Martinique
          </h2>
          <p className="mt-4 leading-8 text-white/64">
            Lecture privée activée. Tu peux consulter l’ebook directement dans
            ton espace.
          </p>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black/30 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Lecteur ebook"
              className="h-[78svh] w-full"
            />
          ) : (
            <div className="p-8 text-white/70">Chargement du lecteur...</div>
          )}
        </div>
      </div>
    );
  }, [loading, err, hasAccess, pdfUrl, router]);

  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {content}
          </motion.section>
        </div>
      </main>
    </>
  );
}
