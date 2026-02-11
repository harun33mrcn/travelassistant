import { MapPin } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <MapPin className="h-20 w-20 text-slate-600 mb-6" />
      <h1 className="text-4xl font-bold text-slate-50 mb-3">
        Kaybolmuş bir rota...
      </h1>
      <p className="text-slate-400 text-lg mb-8 max-w-md">
        Aradığınız sayfa bulunamadı. Belki de yeni bir seyahat planlamanın
        zamanı geldi?
      </p>
      <Link
        href="/"
        className="rounded-lg px-6 py-3 text-sm font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
