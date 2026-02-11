import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları – TravelMind AI",
  description: "TravelMind AI platformunu kullanım şartları ve koşulları.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        title="Kullanım Şartları"
        description="TravelMind AI platformunu kullanarak aşağıdaki şartları kabul etmiş olursunuz."
      />

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Hizmet Kullanımı
          </h2>
          <p>
            TravelMind AI platformunu kullanarak, hizmetlerimizi yasal ve etik
            kurallara uygun şekilde kullanmayı kabul edersiniz. Platform
            üzerinde yapılacak her türlü işlem kullanıcının sorumluluğundadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Hesap Sorumluluğu
          </h2>
          <p>
            Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle
            paylaşmayın ve hesabınızda şüpheli bir aktivite fark ederseniz
            derhal bize bildirin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            İçerik ve Fikri Mülkiyet
          </h2>
          <p>
            Platform üzerindeki tüm içerik, tasarım ve yazılımlar TravelMind
            AI'ye aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım
            yasaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Sorumluluk Reddi
          </h2>
          <p>
            TravelMind AI, platformda sunulan önerilerin doğruluğunu garanti
            etmez. Seyahat kararlarınızı verirken lütfen kendi araştırmanızı
            yapın ve resmi kaynaklardan bilgi edinin.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-50 mb-3">
            Değişiklikler
          </h2>
          <p>
            Bu kullanım şartlarını zaman zaman güncelleyebiliriz. Değişiklikler
            bu sayfada yayınlanacak ve yürürlüğe girecektir.
          </p>
        </section>

        <p className="text-sm text-slate-500 pt-4">
          Son güncelleme: Aralık 2025
        </p>
      </div>
    </div>
  );
}
