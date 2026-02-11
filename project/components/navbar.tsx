"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";

type Session = {
  email?: string;
  loggedIn?: boolean;
};

type SessionState = "checking" | "guest" | "auth";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("travelmind_session");
      if (!raw) {
        setSession(null);
        setSessionState("guest");
        return;
      }

      const parsed = JSON.parse(raw) as Session;
      setSession(parsed);
      if (parsed?.loggedIn) {
        setSessionState("auth");
      } else {
        setSessionState("guest");
      }
    } catch {
      setSession(null);
      setSessionState("guest");
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("travelmind_session");
      } catch {}
    }
    setSession(null);
    setSessionState("guest");
    router.push("/");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Sol taraf: logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-50 hover:text-sky-400 transition"
          >
            Pathory
          </Link>
        </div>

        {/* Sağ taraf */}
        <div className="flex items-center gap-3">
          {sessionState === "checking" && (
            <div className="h-9 w-40 rounded-full bg-slate-800/70 animate-pulse" />
          )}

          {sessionState === "guest" && (
            <>
              <a
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium border border-slate-500 text-slate-100 hover:bg-slate-800 transition"
              >
                Giriş Yap
              </a>
              <a
                href="/signup"
                className="rounded-lg px-4 py-2 text-sm font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition"
              >
                Hemen Başla
              </a>
            </>
          )}

          {sessionState === "auth" && (
            <>
              <a
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium border border-slate-500 text-slate-100 hover:bg-slate-800 transition"
              >
                Seyahatlerim
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium border border-slate-500 text-slate-100 hover:bg-slate-800 transition"
              >
                Çıkış Yap
              </button>
            </>
          )}

          <a
            href="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-50 transition"
            aria-label="Ayarlar"
          >
            <Settings className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}
