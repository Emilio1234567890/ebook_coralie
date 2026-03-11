"use client";
// ebook-frontend/src/app/lib/api.js
const API = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "ebook_token";

export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

function makeError(message, status, fields) {
  const e = new Error(message || "Erreur.");
  e.status = status;
  e.fields = fields || null;
  return e;
}

export async function apiFetch(path, options = {}) {
  if (!API) throw makeError("NEXT_PUBLIC_API_URL is missing");

  const method = (options.method || "GET").toUpperCase();
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${path}`, { ...options, method, headers });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw makeError(
      data?.message || data?.error || `Erreur API ${res.status}`,
      res.status,
      data?.fields,
    );
  }

  // si jamais tu renvoies success:false avec 200 (normalement non)
  if (data && data.success === false) {
    throw makeError(data.message || "Erreur.", res.status, data.fields);
  }

  return data;
}
