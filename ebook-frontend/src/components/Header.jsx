"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth";

export function Header() {
  const { user, loading, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [logoutBusy, setLogoutBusy] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      setScrolled(y > 12);

      if (open) {
        setShowBar(true);
        lastY = y;
        return;
      }

      if (y <= 20) {
        setShowBar(true);
        lastY = y;
        return;
      }

      if (y < lastY - 6) {
        setShowBar(true);
      } else if (y > lastY + 8) {
        setShowBar(false);
      }

      lastY = y;
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    onScroll();
    onResize();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  async function handleLogout() {
    try {
      setLogoutBusy(true);
      setOpen(false);
      await logout();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ y: showBar ? 0 : -110, opacity: showBar ? 1 : 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="site-header-fixed"
    >
      <header className={`site-header-band ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-header-inner">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="site-brand group flex min-w-0 items-center gap-3"
          >
            <div className="site-brand-mark">
              <Image
                src="/brand/unebeninoise_logo.png"
                alt="Logo Une béninoise en Martinique"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0">
              <p className="site-brand-kicker">maison digitale</p>
              <p className="site-brand-title">Une béninoise en Martinique</p>
            </div>
          </Link>

          <nav className="site-nav hidden lg:flex">
            <Link href="/" className="site-nav-link">
              Accueil
            </Link>
            <Link href="/martinique" className="site-nav-link">
              Martinique
            </Link>
            <Link href="/#acheter" className="site-nav-link">
              Acheter
            </Link>
            {user ? (
              <Link href="/bibliotheque" className="site-nav-link">
                Bibliothèque
              </Link>
            ) : null}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="site-action site-action-soft inline-flex items-center justify-center"
                >
                  Mon espace
                </Link>

                {user?.isAdmin ? (
                  <Link
                    href="/admin"
                    className="site-action site-action-soft inline-flex items-center justify-center"
                  >
                    Admin
                  </Link>
                ) : null}

                <button
                  onClick={handleLogout}
                  disabled={logoutBusy}
                  className="site-action site-action-gold inline-flex items-center justify-center disabled:opacity-60"
                  type="button"
                >
                  {logoutBusy ? "Déconnexion..." : "Déconnexion"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="site-action site-action-soft inline-flex items-center justify-center"
                >
                  Connexion
                </Link>

                <Link
                  href="/register"
                  className="site-action site-action-gold inline-flex items-center justify-center"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          <button
            className="site-mobile-toggle inline-flex items-center justify-center lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            type="button"
          >
            <span className="site-mobile-toggle-label">
              {open ? "Fermer" : "Menu"}
            </span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="site-mobile-wrap lg:hidden"
            >
              <div className="site-mobile-panel">
                <div className="grid gap-2">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="site-mobile-link flex items-center"
                  >
                    Accueil
                  </Link>

                  <Link
                    href="/martinique"
                    onClick={() => setOpen(false)}
                    className="site-mobile-link flex items-center"
                  >
                    Martinique
                  </Link>

                  <Link
                    href="/#acheter"
                    onClick={() => setOpen(false)}
                    className="site-mobile-link flex items-center"
                  >
                    Acheter
                  </Link>

                  {user ? (
                    <Link
                      href="/bibliotheque"
                      onClick={() => setOpen(false)}
                      className="site-mobile-link flex items-center"
                    >
                      Bibliothèque
                    </Link>
                  ) : null}
                </div>

                <div className="site-mobile-divider" />

                <div className="grid gap-2">
                  {loading ? null : user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="site-mobile-cta site-mobile-cta-soft inline-flex items-center justify-center"
                      >
                        Mon espace
                      </Link>

                      {user?.isAdmin ? (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="site-mobile-cta site-mobile-cta-soft inline-flex items-center justify-center"
                        >
                          Admin
                        </Link>
                      ) : null}

                      <button
                        onClick={handleLogout}
                        disabled={logoutBusy}
                        className="site-mobile-cta site-mobile-cta-gold inline-flex items-center justify-center disabled:opacity-60"
                        type="button"
                      >
                        {logoutBusy ? "Déconnexion..." : "Déconnexion"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="site-mobile-cta site-mobile-cta-soft inline-flex items-center justify-center"
                      >
                        Connexion
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                        className="site-mobile-cta site-mobile-cta-gold inline-flex items-center justify-center"
                      >
                        Créer un compte
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </motion.div>
  );
}
