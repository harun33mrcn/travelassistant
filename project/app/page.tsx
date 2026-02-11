"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Route, DollarSign, Clock, Plane } from "lucide-react";

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
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
            TravelMind AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-xl mx-auto">
            Saniyeler içinde kişiselleştirilmiş seyahat planları. Bütçeni, tarihlerini ve ilgi alanlarını gir, AI senin için günlük rota önerileri çıkarsın.
          </p>

          {!isLoading && !isLoggedIn && (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Yukarıdan hemen başlayarak hesabını oluşturabilirsin.
            </p>
          )}

          {!isLoading && isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                type="button"
                onClick={() => router.push("/new-trip")}
                className="rounded-lg px-6 py-2.5 text-sm font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition"
              >
                Yeni Seyahat Planla
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg px-6 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Geçmiş Rotalarım
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm transition-colors">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Route className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Akıllı Rotalar</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Günlük aktiviteler ve görülmesi gereken yerlerle optimize edilmiş rotalar
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm transition-colors">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Bütçe Optimizasyonu</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Bütçenize uygun uçuş, otel ve aktivite önerileri
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm transition-colors">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Gerçek Zamanlı Öneriler</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              İlgi alanlarınıza göre anlık kişiselleştirilmiş öneriler
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm transition-colors">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Kapsamlı Planlama</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uçuştan konaklamaya, aktivitelerden restoranlara tam paket
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
