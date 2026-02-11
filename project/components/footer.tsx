export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <a
            href="/about"
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Hakkında
          </a>
          <a
            href="/contact"
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            İletişim
          </a>
          <a
            href="/privacy"
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Gizlilik
          </a>
          <a
            href="/terms"
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Kullanım Şartları
          </a>
          <a
            href="/cookies"
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Çerezler
          </a>
        </div>
        <p className="text-center text-sm text-slate-500">
          © 2025 TravelMind AI. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
