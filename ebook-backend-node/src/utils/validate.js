export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function passwordPolicy(pw) {
  const s = String(pw || "");

  const rules = [
    { ok: s.length >= 10, msg: "10+ caractères" },
    { ok: /[a-z]/.test(s), msg: "1 minuscule" },
    { ok: /[A-Z]/.test(s), msg: "1 majuscule" },
    { ok: /\d/.test(s), msg: "1 chiffre" },
    { ok: /[^A-Za-z0-9]/.test(s), msg: "1 symbole" },
  ];

  const ok = rules.every((r) => r.ok);

  return {
    ok,
    rules,
    message:
      "Mot de passe trop faible. Requis: 10+ chars, minuscule, majuscule, chiffre, symbole.",
  };
}
