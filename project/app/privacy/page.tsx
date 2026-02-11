import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası – TravelMind AI",
  description: "TravelMind AI gizlilik politikası ve veri koruma uygulamaları.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        title="Gizlilik Politikası"
        description="Verileriniz bizim için önemli. Gizlilik politikamızı buradan inceleyebilirsiniz."
      />

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Veri Toplama
          </h2>
          <p>
            TravelMind AI, size daha iyi hizmet verebilmek için bazı kişisel
            bilgilerinizi toplar. Bu bilgiler arasında e-posta adresiniz,
            seyahat tercihleri ve platform kullanım verileri bulunur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Veri Kullanımı
          </h2>
          <p>
            Topladığımız veriler, seyahat önerilerinizi kişiselleştirmek,
            platform performansını iyileştirmek ve size daha iyi bir kullanıcı
            deneyimi sunmak için kullanılır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Veri Güvenliği
          </h2>
          <p>
            Verilerinizi korumak için endüstri standartlarında güvenlik
            önlemleri kullanıyoruz. Bilgileriniz şifrelenir ve güvenli
            sunucularda saklanır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            İletişim
          </h2>
          <p>
            Gizlilik politikamız hakkında sorularınız varsa, lütfen{" "}
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
