"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { getToken, apiFetch } from "@/app/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

const PdfBookReader = dynamic(() => import("@/components/PdfBookReader"), {
  ssr: false,
  loading: () => <div className="reader-loading">Chargement du lecteur…</div>,
});

const FREE_EBOOK_ACCESS =
  String(process.env.NEXT_PUBLIC_FREE_EBOOK_ACCESS || "").toLowerCase() ===
  "true";

export default function BibliothequePage() {
  const [ready, setReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(FREE_EBOOK_ACCESS);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [err, setErr] = useState(null);
  const [entered, setEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function updateViewport() {
      setIsMobile(window.innerWidth < 768);
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    let objectUrl = null;

    async function load() {
      try {
        setErr(null);

        let access = FREE_EBOOK_ACCESS;

        if (!FREE_EBOOK_ACCESS) {
          const d = await apiFetch("/api/dashboard");
          access = !!d.hasAccess;
        }

        setHasAccess(access);

        if (!access) {
          setReady(true);
          return;
        }

        const token = getToken();

        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reader/ebook`,
          {
            headers,
          },
        );

        if (!res.ok) {
          throw new Error("Impossible de charger l’ebook.");
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setReady(true);
      } catch (e) {
        setErr(e.message || "Impossible de charger l’ebook.");
        setReady(true);
      }
    }

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const immersiveMode = entered && isMobile;

  return (
    <>
      {!immersiveMode ? <Header /> : null}

      <main
        className={
          immersiveMode ? "reader-page reader-page--immersive" : "page"
        }
      >
        <div className={immersiveMode ? "reader-immersive-wrap" : "container"}>
          <section
            className={
              immersiveMode
                ? "reader-shell reader-shell--immersive"
                : "reader-shell"
            }
          >
            {!entered ? (
              <div className="reader-topbar">
                <div>
                  <p className="lux-kicker">bibliothèque</p>
                  <h1 className="reader-title">Lecture gratuite</h1>
                  <p className="reader-subtitle">
                    L’ebook est maintenant disponible gratuitement. Tu peux
                    l’ouvrir directement depuis cette page.
                  </p>
                </div>
              </div>
            ) : null}

            {err ? <div className="reader-alert">{err}</div> : null}

            {!ready ? (
              <div className="reader-loading">Chargement du livre…</div>
            ) : !hasAccess ? (
              <div className="reader-locked">
                <p className="text-white/75">
                  Ton accès n’est pas encore actif.
                </p>

                <div className="mt-5">
                  <Link href="/checkout" className="lux-btn lux-btn-gold">
                    Aller au checkout
                  </Link>
                </div>
              </div>
            ) : !pdfUrl ? null : !entered ? (
              <div className="reader-stage">
                <div className="book-entry">
                  <div className="book-entry__left">
                    <p className="lux-kicker">ebook offert</p>

                    <h2 className="book-entry__title">
                      Une béninoise en Martinique
                    </h2>

                    <p className="book-entry__text">
                      Le livre est accessible gratuitement. Ouvre-le directement
                      pour commencer ta lecture.
                    </p>

                    <div className="book-entry__actions">
                      <button
                        type="button"
                        className="lux-btn lux-btn-gold"
                        onClick={() => setEntered(true)}
                      >
                        Lire gratuitement
                      </button>

                      <Link href="/" className="lux-btn lux-btn-ghost">
                        Retour à l’accueil
                      </Link>
                    </div>
                  </div>

                  <div className="book-entry__right">
                    <button
                      type="button"
                      className="book-cover-frame book-cover-button"
                      onClick={() => setEntered(true)}
                      aria-label="Ouvrir le livre"
                    >
                      <div className="book-cover-image">
                        <Image
                          src="/brand/couverture_livrecoco.jpg"
                          alt="Couverture du livre Une béninoise en Martinique"
                          fill
                          priority
                          className="object-cover"
                        />
                      </div>

                      <div className="book-cover-overlay" />
                      <div className="book-cover-label">
                        <span>Lire gratuitement</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <PdfBookReader
                pdfUrl={pdfUrl}
                setErr={setErr}
                onExit={() => setEntered(false)}
              />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
