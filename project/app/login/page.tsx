"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { getSession } from "@/lib/authStorage";
import { signInWithEmail } from "@/lib/supabaseAuth";
import { PrimaryButton } from "@/components/primary-button";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session && session.loggedIn) {
      router.push("/dashboard");
    }
  }, [router]);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Supabase ile giriş yap
    await signInWithEmail(email, password);

    // Giriş başarılıysa dashboard'a yönlendir
    router.push("/dashboard");
  } catch (err: any) {
    console.error("Login error:", err);
    const msg =
      err?.message || "Giriş yaparken bir hata oluştu. Lütfen tekrar dene.";
    setError(msg);
  } finally {
    setLoading(false);
  }
};


  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockEmail = `${provider}@mock.pathory.app`;
    const session = {
      email: mockEmail,
      loggedIn: true,
      provider: provider,
      loggedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem("travelmind_session", JSON.stringify(session));
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Giriş Yap</h1>
        <p className="text-slate-400 mb-8">
          Hesabınıza giriş yaparak devam edin
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-700 bg-slate-900 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-slate-50 placeholder-slate-500"
                placeholder="ornek@email.com"
                aria-label="E-posta adresi"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-700 bg-slate-900 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-slate-50 placeholder-slate-500"
                placeholder="••••••••"
                aria-label="Şifre"
              />
            </div>
          </div>

          <PrimaryButton type="submit" loading={loading} className="w-full">
            Giriş Yap
          </PrimaryButton>
        </form>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs uppercase tracking-wide text-slate-400">
            veya
          </span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Google ile giriş yap"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google ile giriş yap</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("apple")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Apple ile giriş yap"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Apple ile giriş yap</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Hesabın yok mu?{" "}
            <Link href="/signup" className="text-sky-400 font-medium hover:text-sky-300 transition">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
