"use client";

import { Header } from "@/components/Header";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState(null);
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setFields({});

    try {
      setBusy(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (e2) {
      setErr(e2.message);
      setFields(e2.fields || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <AuthShell
        title="Connexion"
        subtitle="Retrouve ton espace personnel, ton accès à l’édition et ton téléchargement dans une interface plus claire, plus douce et plus élégante."
        footerText="Pas encore de compte ?"
        footerLinkHref="/register"
        footerLinkText="Créer un compte"
        imageSrc="/media/martinique-horizon.jpg"
        imageAlt="Horizon de Martinique"
        badge="connexion sécurisée"
        eyebrow="espace personnel"
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="email"
                className="text-[11px] uppercase tracking-[0.28em] text-white/56"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                className="mt-2 w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
                placeholder="ex : coralie@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={busy}
              />

              {fields.email ? (
                <p className="mt-2 text-sm text-rose-300">{fields.email}</p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-[11px] uppercase tracking-[0.28em] text-white/56"
                >
                  Mot de passe
                </label>

                <Link
                  href="/login"
                  className="text-xs text-white/44 transition hover:text-[rgba(245,224,175,0.96)]"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                required
                className="mt-2 w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
                placeholder="Ton mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={busy}
              />

              {fields.password ? (
                <p className="mt-2 text-sm text-rose-300">{fields.password}</p>
              ) : null}
            </div>
          </div>

          {err ? (
            <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          <div className="grid gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[16px] border border-[rgba(212,176,96,0.42)] bg-[linear-gradient(180deg,rgba(245,224,175,1),rgba(212,176,96,0.96))] px-5 text-[11px] uppercase tracking-[0.18em] text-[#17130d] shadow-[0_16px_36px_rgba(212,176,96,0.22)] transition hover:-translate-y-[1px] hover:shadow-[0_20px_42px_rgba(212,176,96,0.28)] disabled:opacity-60"
            >
              {busy ? "Connexion..." : "Se connecter"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  accès
                </p>
                <p className="mt-2 text-sm text-white/76">Immédiat</p>
              </div>

              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  espace
                </p>
                <p className="mt-2 text-sm text-white/76">Privé</p>
              </div>
            </div>
          </div>
        </form>
      </AuthShell>
    </>
  );
}
