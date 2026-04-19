"use client";

import { Header } from "@/components/Header";
import AuthShell from "@/components/AuthShell";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function passwordRules(pw) {
  const s = String(pw || "");
  return [
    { ok: s.length >= 10, label: "10 caractères minimum" },
    { ok: /[a-z]/.test(s), label: "Une minuscule" },
    { ok: /[A-Z]/.test(s), label: "Une majuscule" },
    { ok: /\d/.test(s), label: "Un chiffre" },
    { ok: /[^A-Za-z0-9]/.test(s), label: "Un symbole" },
  ];
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  visible,
  onToggle,
}) {
  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        className="w-full rounded-[16px] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 py-4 pr-[70px] text-white outline-none transition placeholder:text-white/28 focus:border-[rgba(212,176,96,0.42)] focus:bg-[rgba(255,255,255,0.06)] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)]"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="new-password"
      />

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        title={visible ? "Masquer" : "Afficher"}
        className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(212,176,96,0.35)] bg-[rgba(10,14,22,0.82)] text-[rgba(245,224,175,0.98)] shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition hover:scale-[1.03] hover:border-[rgba(245,224,175,0.55)] hover:bg-[rgba(16,22,34,0.95)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? (
          <EyeOff size={18} strokeWidth={2.2} />
        ) : (
          <Eye size={18} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);
  const [fields, setFields] = useState({});

  const rules = useMemo(() => passwordRules(password), [password]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setDone(null);
    setFields({});

    try {
      setBusy(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password,
            password2,
          }),
        },
      );

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const error = new Error(
          data?.message ||
            "Une erreur est survenue pendant la réinitialisation.",
        );
        error.fields = data?.fields || {};
        throw error;
      }

      setDone(data?.message || "Ton mot de passe a bien été réinitialisé.");
      setPassword("");
      setPassword2("");

      setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (e2) {
      setErr(
        e2.message || "Une erreur est survenue pendant la réinitialisation.",
      );
      setFields(e2.fields || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisis un nouveau mot de passe sécurisé pour ton compte."
      footerText="Retour"
      footerLinkHref="/login"
      footerLinkText="Connexion"
      imageSrc="/media/martinique-horizon.jpg"
      imageAlt="Horizon de Martinique"
      badge="lien sécurisé"
      eyebrow="réinitialisation"
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5">
          <div>
            <label
              htmlFor="password"
              className="text-[11px] uppercase tracking-[0.28em] text-white/56"
            >
              Nouveau mot de passe
            </label>

            <PasswordField
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              disabled={busy}
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />

            {fields.password ? (
              <p className="mt-2 text-sm text-rose-300">{fields.password}</p>
            ) : null}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {rules.map((r) => (
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
          </div>

          <div>
            <label
              htmlFor="password2"
              className="text-[11px] uppercase tracking-[0.28em] text-white/56"
            >
              Confirmer le mot de passe
            </label>

            <PasswordField
              id="password2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Confirme ton mot de passe"
              disabled={busy}
              visible={showPassword2}
              onToggle={() => setShowPassword2((v) => !v)}
            />

            {fields.password2 ? (
              <p className="mt-2 text-sm text-rose-300">{fields.password2}</p>
            ) : null}
          </div>
        </div>

        {!token ? (
          <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            Lien invalide : token manquant.
          </div>
        ) : null}

        {err ? (
          <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {err}
          </div>
        ) : null}

        {done ? (
          <div className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <p>{done}</p>
            <p className="mt-2 text-xs text-emerald-100/80">
              Redirection vers la page de connexion...
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy || !token}
          style={{ color: "#17130d" }}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[16px] border border-[rgba(212,176,96,0.42)] bg-[linear-gradient(180deg,rgba(245,224,175,1),rgba(212,176,96,0.96))] px-5 text-[11px] uppercase tracking-[0.18em] !text-[#17130d] shadow-[0_16px_36px_rgba(212,176,96,0.22)] transition hover:-translate-y-[1px] hover:shadow-[0_20px_42px_rgba(212,176,96,0.28)] disabled:opacity-60"
        >
          {busy ? "Validation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </AuthShell>
  );
}

function ResetPasswordFallback() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Chargement du lien sécurisé..."
      footerText="Retour"
      footerLinkHref="/login"
      footerLinkText="Connexion"
      imageSrc="/media/martinique-horizon.jpg"
      imageAlt="Horizon de Martinique"
      badge="lien sécurisé"
      eyebrow="réinitialisation"
    >
      <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
        Chargement...
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordContent />
      </Suspense>
    </>
  );
}
