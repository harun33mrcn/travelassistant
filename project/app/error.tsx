"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            Bir şeyler ters gitti
          </h1>
          <p className="text-slate-400 mb-6">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              aria-label="Tekrar dene"
            >
              Tekrar Dene
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-slate-500 text-slate-100 hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              aria-label="Ana sayfaya dön"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
