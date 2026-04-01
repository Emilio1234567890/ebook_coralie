"use client";

import { Header } from "@/components/Header";
import { apiFetch } from "@/app/lib/api";
import { useState } from "react";
import {
  Mail,
  MessageSquareText,
  ShieldCheck,
  Clock3,
  Send,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);
  const [fields, setFields] = useState({});

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setDone(null);
    setFields({});

    try {
      const res = await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setDone(res.message || "Message envoyé.");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (e2) {
      setErr(e2.message || "Erreur.");
      setFields(e2.fields || {});
    } finally {
      setBusy(false);
    }
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.18]" />
            <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 sm:p-6 lg:sticky lg:top-6">
                <p className="lux-kicker">contact</p>

                <h1 className="lux-title mt-4 text-4xl sm:text-5xl">
                  Nous écrire
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
                  Une question, un retour, une demande liée à la plateforme ? Tu
                  peux nous écrire directement ici et nous reviendrons vers toi
                  dès que possible.
                </p>

                <div className="mt-7 grid gap-3">
                  <InfoCard
                    icon={<Mail className="h-4 w-4" />}
                    title="Réponse claire"
                    text="Utilise ce formulaire pour toute question générale ou demande de support."
                  />
                  <InfoCard
                    icon={<Clock3 className="h-4 w-4" />}
                    title="Traitement rapide"
                    text="Ton message arrive directement dans notre flux de contact."
                  />
                  <InfoCard
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="Échange propre"
                    text="Décris ton problème ou ta demande avec le plus de contexte utile possible."
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#0d1320]/88 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                    <MessageSquareText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Formulaire de contact
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/60 sm:text-sm">
                      Plus ton message est précis, plus la réponse sera utile.
                    </p>
                  </div>
                </div>

                <form onSubmit={submit} className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Nom"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      error={fields.name}
                      placeholder="Ton nom"
                      autoComplete="name"
                    />

                    <Field
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      error={fields.email}
                      placeholder="ton@email.com"
                      autoComplete="email"
                    />
                  </div>

                  <Field
                    label="Sujet"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    error={fields.subject}
                    placeholder="Objet du message"
                  />

                  <div>
                    <label className="lux-label">Message</label>
                    <textarea
                      className="lux-input mt-2 min-h-[180px] resize-y px-4 py-3 text-sm sm:min-h-[220px]"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Explique ta demande, ton problème ou ton retour..."
                    />
                    {fields.message ? (
                      <p className="mt-2 text-sm text-rose-300">
                        {fields.message}
                      </p>
                    ) : null}
                  </div>

                  {err ? (
                    <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                      {err}
                    </div>
                  ) : null}

                  {done ? (
                    <div className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                      {done}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-6 text-white/45">
                      Vérifie bien ton email pour que nous puissions te
                      répondre.
                    </p>

                    <button
                      type="submit"
                      disabled={busy}
                      className="lux-btn lux-btn-gold inline-flex w-full items-center justify-center gap-2 sm:w-fit"
                    >
                      <Send className="h-4 w-4" />
                      {busy ? "Envoi..." : "Envoyer le message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="lux-label">{label}</label>
      <input
        type={type}
        className="lux-input mt-2 px-4 py-3 text-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-amber-200">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-6 text-white/62 sm:text-sm sm:leading-7">
        {text}
      </p>
    </div>
  );
}
