"use client";

import { Header } from "@/components/Header";
import AuthShell from "@/components/AuthShell";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setDone(null);

    try {
      setBusy(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.fields?.email || data?.message || "Une erreur est survenue.",
        );
      }

      setDone(
        data?.message ||
          "Un lien de réinitialisation a été envoyé à votre adresse email.",
      );
      setEmail("");
    } catch (e2) {
      setErr(e2.message || "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <AuthShell
        title="Mot de passe oublié"
        subtitle="Entre ton adresse email pour recevoir un lien de réinitialisation sécurisé."
        footerText="Tu te souviens de ton mot de passe ?"
        footerLinkHref="/login"
        footerLinkText="Retour à la connexion"
        imageSrc="/media/martinique-horizon.jpg"
        imageAlt="Horizon de Martinique"
        badge="assistance sécurisée"
        eyebrow="réinitialisation"
      >
        <form onSubmit={submit} className="space-y-5">
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
          </div>

          {err ? (
            <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          {done ? (
            <div className="rounded-[18px] border border-[rgba(212,176,96,0.22)] bg-[rgba(212,176,96,0.10)] px-4 py-3 text-sm text-[rgba(245,224,175,0.96)]">
              <p>{done}</p>
              <p className="mt-2 text-xs text-[rgba(245,240,230,0.72)]">
                Vérifie aussi tes spams ou courriers indésirables.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[16px] border border-[rgba(212,176,96,0.42)] bg-[linear-gradient(180deg,rgba(245,224,175,1),rgba(212,176,96,0.96))] px-5 text-[11px] uppercase tracking-[0.18em] text-[#17130d] shadow-[0_16px_36px_rgba(212,176,96,0.22)] transition hover:-translate-y-[1px] hover:shadow-[0_20px_42px_rgba(212,176,96,0.28)] disabled:opacity-60"
          >
            {busy ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
