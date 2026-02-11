"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Route, DollarSign, Clock } from "lucide-react";

type Session = {
  email?: string;
  loggedIn?: boolean;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("travelmind_session");
      if (raw) {
        setSession(JSON.parse(raw));
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isLoggedIn = !!session?.loggedIn;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-100 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left side – hero text */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1 shadow-sm border border-amber-200/60 dark:border-slate-700 text-xs font-medium text-amber-700 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Patika patika kişiselleştirilmiş seyahat önerileri
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            <span className="block">Seyahatini planla,</span>
            <span className="block text-amber-600 dark:text-amber-400">
              Pathory seninle yapsın.
            </span>
          </h1>

          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-xl">
            Nereye gitmek istediğini, bütçeni ve kimle seyahat ettiğini söyle.
            Pathory, Mindtrip benzeri akıllı bir asistan gibi sana özel günlük rota,
            konaklama ve aktivite önerileri hazırlasın.
          </p>

          {!isLoading && !isLoggedIn && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Yukarıdan hesabını oluşturarak başlayabilir veya hemen aşağıdan ilk adımı atabilirsin.
            </p>
          )}

          {!isLoading && isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/new-trip")}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-md"
              >
                Yeni Seyahat Planla
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold border border-slate-300/70 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 hover:bg-slate-50/90 dark:hover:bg-slate-800 transition"
              >
                Dashboard&rsquo;a Git
              </button>
            </div>
          )}

          {isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Oturum kontrol ediliyor...
            </p>
          )}

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-white/80 dark:bg-slate-900/70 border border-amber-100/70 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                <Route className="w-5 h-5 text-amber-600 dark:text-amber-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Akıllı rotalar
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                İlgi alanlarına göre saniyeler içinde günlük rota önerileri.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/70 border border-amber-100/70 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Bütçene göre
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Konaklama ve aktiviteler bütçe aralığına göre otomatik dengelenir.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/70 border border-amber-100/70 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-sky-500/10 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-sky-600 dark:text-sky-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Zaman kazandırır
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Saatler süren araştırmayı dakikalara indirir; her şey tek ekranda.
              </p>
            </div>
          </div>
        </div>

        {/* Right side – visual / mock phone */}
        <div className="relative">
          <div className="absolute -top-10 -left-6 w-40 h-40 bg-amber-300/40 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-sky-300/40 blur-3xl rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-sm">
            <div className="aspect-[9/16] rounded-3xl bg-white/90 dark:bg-slate-900/80 shadow-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-sm font-bold">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                      Pathory Asistan
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Seyahatin için hazır.
                    </p>
                  </div>
                </div>
                <Plane className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                <div className="max-w-[85%] rounded-2xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-[11px] text-slate-800 dark:text-slate-100">
                  Nereye gitmek istiyorsun? Bütçeni ve tarihlerini yaz, senin için 3 farklı rota hazırlayayım.
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl bg-sky-600 text-white px-3 py-2 text-[11px]">
                    Haziran sonunda, 5 günlüğüne İtalya’da hem deniz hem kültür ağırlıklı bir rota istiyorum.
                  </div>
                </div>
                <div className="max-w-[90%] rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-[11px] text-slate-800 dark:text-slate-100">
                  Harika! Sana uygun üç öneri buldum: Amalfi kıyıları, Sicilya ve Puglia. Dilersen detaylı plana geçebilirim.
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canlı olarak kişiselleştirilmiş öneriler
                </div>
                <button
                  type="button"
                  onClick={() => router.push(isLoggedIn ? "/new-trip" : "/signup")}
                  className="w-full rounded-full bg-slate-900 text-slate-50 text-xs font-semibold py-2 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 transition"
                >
                  {isLoggedIn ? "Yeni rota oluştur" : "Hemen başla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
