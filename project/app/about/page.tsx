import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkında – TravelMind AI",
  description: "TravelMind AI nedir, nasıl çalışır ve seyahat planlamanızı nasıl kolaylaştırır?",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        title="TravelMind AI Hakkında"
        description="Yapay zekâ destekli seyahat planlama asistanınız"
      />

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            TravelMind AI Nedir?
          </h2>
          <p>
            TravelMind AI, seyahat planlamanızı kolaylaştıran yapay zekâ destekli bir platformdur.
            Bütçenize, seyahat tarihlerinize ve ilgi alanlarınıza göre kişiselleştirilmiş
            seyahat rotaları oluşturur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Hangi Sorunu Çözüyor?
          </h2>
          <p>
            Seyahat planlamak zaman alıcı ve karmaşık olabilir. TravelMind AI,
            bu süreci otomatikleştirerek sizin için en uygun rotaları,
            konaklama önerilerini ve gezilecek yerleri saniyeler içinde belirler.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
            <li>Bütçe dostu öneriler</li>
            <li>Kişiselleştirilmiş rotalar</li>
            <li>Günlük itineraryler</li>
            <li>Yerel ipuçları ve öneriler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Nasıl Çalışır?
          </h2>
          <p>
            Basitçe seyahat etmek istediğiniz şehri, tarihlerinizi, bütçenizi ve
            ilgi alanlarınızı girin. Yapay zekâmız, binlerce seyahat verisini
            analiz ederek size özel bir plan oluşturur.
          </p>
        </section>

        <section className="pt-4">
          <a
            href="/signup"
            className="inline-block rounded-lg px-6 py-3 text-sm font-medium bg-sky-500 text-slate-950 hover:bg-sky-400 transition"
          >
            Hemen Başla
          </a>
        </section>
      </div>
    </div>
  );
}
