"use client";
// ebook-frontend/src/app/lib/auth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setToken, clearToken, getToken } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = getToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const r = await apiFetch("/api/auth/me");
      setUser(r.user);
    } catch {
      clearToken();
      setUser(null);
    }
  }

  async function login(email, password) {
    const r = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(r.token);
    setUser(r.user);
  }

  async function register(name, email, password, password2) {
    const r = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, password2 }),
    });
    setToken(r.token);
    setUser(r.user);
  }

  async function logout() {
    clearToken();
    setUser(null);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, refresh, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
