import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çerez Politikası – TravelMind AI",
  description: "TravelMind AI çerez kullanımı ve politikası hakkında bilgi.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        title="Çerez Politikası"
        description="TravelMind AI platformunda çerez kullanımı hakkında bilgi edinin."
      />

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Çerez Nedir?
          </h2>
          <p>
            Çerezler, web sitelerinin tarayıcınızda sakladığı küçük metin
            dosyalarıdır. Bu dosyalar, siteyi ziyaret ettiğinizde deneyiminizi
            iyileştirmek ve belirli özelliklerin çalışmasını sağlamak için
            kullanılır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Hangi Çerezleri Kullanıyoruz?
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-slate-200">Zorunlu Çerezler:</strong> Platform'un
              temel işlevlerini yerine getirmesi için gereklidir.
            </li>
            <li>
              <strong className="text-slate-200">Performans Çerezleri:</strong> Site
              performansını analiz etmek ve iyileştirmek için kullanılır.
            </li>
            <li>
              <strong className="text-slate-200">Tercih Çerezleri:</strong> Tema
              seçiminiz ve dil tercihiniz gibi ayarlarınızı hatırlar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Çerezleri Yönetme
          </h2>
          <p>
            Tarayıcı ayarlarınızdan çerezleri yönetebilir, silebilir veya
            engelleyebilirsiniz. Ancak bazı çerezleri engellerseniz, platform
            özelliklerinin bazıları düzgün çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            İletişim
          </h2>
          <p>
            Çerez politikamız hakkında sorularınız varsa, lütfen{" "}
            <a href="/contact" className="text-sky-400 hover:text-sky-300 underline">
              iletişim sayfası
            </a>
            {" "}üzerinden bize ulaşın.
          </p>
        </section>

        <p className="text-sm text-slate-500 pt-4">
          Son güncelleme: Aralık 2025
        </p>
      </div>
    </div>
  );
}
