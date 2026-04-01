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

export default function BibliothequePage() {
  const [ready, setReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
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

        const d = await apiFetch("/api/dashboard");
        setHasAccess(!!d.hasAccess);

        if (!d.hasAccess) {
          setReady(true);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reader/ebook`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
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
                  <h1 className="reader-title">Lecture privée</h1>
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
                    <h2 className="book-entry__title">
                      Une béninoise en Martinique
                    </h2>

                    <div className="book-entry__actions">
                      <button
                        type="button"
                        className="lux-btn lux-btn-gold"
                        onClick={() => setEntered(true)}
                      >
                        Ouvrir le livre
                      </button>

                      <Link href="/dashboard" className="lux-btn lux-btn-ghost">
                        Retour au dashboard
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
                        <span>Ouvrir le livre</span>
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
