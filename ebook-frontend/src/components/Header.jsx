"use client";

import Image from "next/image";
import Link from "next/link";
import Headroom from "react-headroom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth";

export function Header() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    window.addEventListener("resize", onResize);
    onResize();

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Headroom
      disableInlineStyles
      upTolerance={10}
      downTolerance={12}
      className="site-headroom"
    >
      <header className="site-header-wrap">
        <div className="site-header-shell">
          <div className="site-header-glow" />

          <div className="site-header">
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
                <p className="site-brand-kicker">édition signature</p>
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
              <Link href="/#edition" className="site-nav-link">
                L’édition
              </Link>
              <Link href="/#acheter" className="site-nav-link">
                Acheter
              </Link>
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
                    onClick={logout}
                    className="site-action site-action-gold inline-flex items-center justify-center"
                  >
                    Déconnexion
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
              aria-label="Menu"
              type="button"
            >
              {open ? "Fermer" : "Menu"}
            </button>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden"
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
                      href="/#edition"
                      onClick={() => setOpen(false)}
                      className="site-mobile-link flex items-center"
                    >
                      L’édition
                    </Link>
                    <Link
                      href="/#acheter"
                      onClick={() => setOpen(false)}
                      className="site-mobile-link flex items-center"
                    >
                      Acheter
                    </Link>
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
                          onClick={() => {
                            setOpen(false);
                            logout();
                          }}
                          className="site-mobile-cta site-mobile-cta-gold inline-flex items-center justify-center"
                          type="button"
                        >
                          Déconnexion
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
        </div>
      </header>
    </Headroom>
  );
}
