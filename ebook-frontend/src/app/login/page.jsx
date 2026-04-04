"use client";

import { Header } from "@/components/Header";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function FieldError({ children }) {
  if (!children) return null;

  return <p className="mt-2 text-sm text-rose-300">{children}</p>;
}

function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  required = false,
}) {
  return (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      className="mt-2 w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-4 py-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] outline-none transition placeholder:text-white/28 hover:border-white/16 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] focus:border-[rgba(212,176,96,0.42)] focus:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  required = false,
  visible,
  onToggle,
}) {
  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-4 py-4 pr-[118px] text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] outline-none transition placeholder:text-white/28 hover:border-white/16 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] focus:border-[rgba(212,176,96,0.42)] focus:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] focus:ring-4 focus:ring-[rgba(212,176,96,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/76 transition hover:border-white/16 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {visible ? "Cacher" : "Afficher"}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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
        subtitle="Retrouve ton espace personnel, ton accès à l’édition et ton espace de lecture dans une interface plus claire et plus élégante."
        footerText="Pas encore de compte ?"
        footerLinkHref="/register"
        footerLinkText="Créer un compte"
        imageSrc="/media/martinique-horizon.jpg"
        imageAlt="Horizon de Martinique"
        badge="connexion sécurisée"
        eyebrow="espace personnel"
      >
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-7">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-[11px] uppercase tracking-[0.28em] text-white/56"
                >
                  Email
                </label>

                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex : coralie@mail.com"
                  autoComplete="email"
                  disabled={busy}
                />

                <FieldError>{fields.email}</FieldError>
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
                    href="/forgot-password"
                    className="text-xs text-white/46 transition hover:text-[rgba(245,224,175,0.96)]"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ton mot de passe"
                  autoComplete="current-password"
                  disabled={busy}
                  visible={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />

                <FieldError>{fields.password}</FieldError>
              </div>
            </div>

            {err ? (
              <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {err}
              </div>
            ) : null}

            <div className="space-y-4 pt-1">
              <button
                type="submit"
                disabled={busy}
                style={{ color: "#17130d" }}
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-[18px] border border-[rgba(212,176,96,0.42)] bg-[linear-gradient(180deg,rgba(245,224,175,1),rgba(212,176,96,0.96))] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] !text-[#17130d] shadow-[0_18px_40px_rgba(212,176,96,0.24)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_46px_rgba(212,176,96,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Connexion..." : "Se connecter"}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    accès
                  </p>
                  <p className="mt-2 text-sm text-white/76">Immédiat</p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    espace
                  </p>
                  <p className="mt-2 text-sm text-white/76">Privé</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-5 text-sm text-white/56">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-[rgba(245,224,175,0.96)] transition hover:text-white "
          >
            Créer un compte
          </Link>
        </div>
      </AuthShell>
    </>
  );
}
