"use client";

import { Header } from "@/components/Header";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function policy(pw) {
  const s = String(pw || "");
  const rules = [
    { ok: s.length >= 10, label: "10 caractères minimum" },
    { ok: /[a-z]/.test(s), label: "Une minuscule" },
    { ok: /[A-Z]/.test(s), label: "Une majuscule" },
    { ok: /\d/.test(s), label: "Un chiffre" },
    { ok: /[^A-Za-z0-9]/.test(s), label: "Un symbole" },
  ];

  return { ok: rules.every((r) => r.ok), rules };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [err, setErr] = useState(null);
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  const pol = useMemo(() => policy(password), [password]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setFields({});

    try {
      setBusy(true);
      await register(name, email, password, password2);
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
        title="Créer un compte"
        subtitle="Crée un espace privé plus élégant et mieux structuré pour accéder à l’édition, retrouver tes achats et télécharger à tout moment."
        footerText="Tu as déjà un compte ?"
        footerLinkHref="/login"
        footerLinkText="Connexion"
        imageSrc="/media/martinique-ville.jpg"
        imageAlt="Ville créole en Martinique"
        badge="création de compte"
        eyebrow="accès édition"
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="name"
                className="text-[11px] uppercase tracking-[0.28em] text-white/56"
              >
                Nom
              </label>

              <input
                id="name"
                type="text"
                required
                className="mt-2 w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
                placeholder="Ton prénom ou ton nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={busy}
              />

              {fields.name ? (
                <p className="mt-2 text-sm text-rose-300">{fields.name}</p>
              ) : null}
            </div>

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
              <label
                htmlFor="password"
                className="text-[11px] uppercase tracking-[0.28em] text-white/56"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                required
                className="mt-2 w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
                placeholder="Choisis un mot de passe solide"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {pol.rules.map((r) => (
                  <div
                    key={r.label}
                    className={[
                      "rounded-[16px] border px-3 py-3 text-sm transition",
                      r.ok
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-white/62",
                    ].join(" ")}
                  >
                    <span className="mr-2">{r.ok ? "✓" : "•"}</span>
                    {r.label}
                  </div>
                ))}
              </div>

              {fields.password ? (
                <p className="mt-2 text-sm text-rose-300">{fields.password}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password2"
                className="text-[11px] uppercase tracking-[0.28em] text-white/56"
              >
                Confirmation
              </label>

              <input
                id="password2"
                type="password"
                required
                className="mt-2 w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
                placeholder="Répète le mot de passe"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />

              {fields.password2 ? (
                <p className="mt-2 text-sm text-rose-300">{fields.password2}</p>
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
              {busy ? "Création..." : "Créer mon compte"}
            </button>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                sécurité
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Ton mot de passe est vérifié visuellement avant création pour
                rendre l’inscription plus simple et plus rassurante.
              </p>
            </div>
          </div>
        </form>
      </AuthShell>
    </>
  );
}
