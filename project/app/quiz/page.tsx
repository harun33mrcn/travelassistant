"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PrimaryButton } from "@/components/primary-button";

type Step = 1 | 2 | 3 | 4;

type Answers = {
  travelWith: string;
  tripStyle: string;
  accommodation: string;
  transport: string;
  carRental: string;
  foodStyle: string;
  budgetLevel: string;
  pace: string;
};

export default function TravelQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    travelWith: "",
    tripStyle: "",
    accommodation: "",
    transport: "",
    carRental: "",
    foodStyle: "",
    budgetLevel: "",
    pace: "",
  });

  const fromSignup = searchParams.get("from") === "signup";

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // Kullanıcı yoksa login'e gönder
        router.replace("/login?from=quiz");
        return;
      }
      setUserId(data.user.id);
    };

    fetchUser();
  }, [router]);

  const updateAnswer = (field: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitAll = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("travel_profiles")
        .upsert(
          {
            user_id: userId,
            travel_with: answers.travelWith || null,
            trip_style: answers.tripStyle || null,
            accommodation: answers.accommodation || null,
            transport: answers.transport || null,
            car_rental: answers.carRental === "yes",
            food_style: answers.foodStyle || null,
            budget_level: answers.budgetLevel || null,
            pace: answers.pace || null,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("travel_profiles upsert error:", error);
        setError("Tercihlerin kaydedilirken bir hata oluştu, lütfen tekrar dene.");
        return;
      }

      // Başarılı → dashboard'a yönlendir
      router.push("/dashboard?from=quiz");
    } finally {
      setLoading(false);
    }
  };

  const canGoNextStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        return !!answers.travelWith && !!answers.tripStyle;
      case 2:
        return !!answers.accommodation && !!answers.transport && !!answers.carRental;
      case 3:
        return !!answers.foodStyle && !!answers.budgetLevel;
      case 4:
        return !!answers.pace;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!canGoNextStep(step)) return;
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  };

  const prevStep = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
              Seni Daha Yakından Tanıyalım
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Tatil tarzına göre sana en uygun rota ve önerileri hazırlayalım.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{step}/4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  className={`h-1.5 w-5 rounded-full transition-colors ${step >= s ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitAll}>
          <div className="px-6 py-6 space-y-6">
            {fromSignup && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
                Pathory&rsquo;e hoş geldin! Bu kısa test sadece birkaç dakikanı alacak ve sana daha isabetli öneriler yapmamıza yardımcı olacak.
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Genelde kimle seyahat edersin?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Rota önerilerini kiminle gideceğine göre şekillendireceğiz.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "solo", label: "Tek başıma" },
                      { value: "partner", label: "Eşim/Partnerimle" },
                      { value: "family", label: "Ailemle" },
                      { value: "friends", label: "Arkadaşlarımla" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("travelWith", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-center transition ${
                          answers.travelWith === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Hangi tarz tatil seni daha çok anlatıyor?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Rotaları seçtiğin tarza göre ağırlıklandıracağız.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "relax", label: "Rahat ve sakin (deniz, spa, yavaş tempo)" },
                      { value: "adventure", label: "Macera (doğa yürüyüşü, ekstrem aktiviteler)" },
                      { value: "culture", label: "Kültür & şehir (müze, sokaklar, tarih)" },
                      { value: "nightlife", label: "Gece hayatı (barlar, kulüpler, etkinlikler)" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("tripStyle", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-left transition ${
                          answers.tripStyle === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Genelde nerede kalmayı tercih edersin?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Konaklama önerilerini bu tercihe göre filtreleyeceğiz.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "hotel", label: "Otel" },
                      { value: "apartment", label: "Apart / daire" },
                      { value: "hostel", label: "Hostel" },
                      { value: "villa", label: "Villa / bungalow" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("accommodation", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-left transition ${
                          answers.accommodation === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Gittiğin yerde şehir içi ulaşımı nasıl yapmayı seversin?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Ulaşım kartları ve rota sürelerini buna göre hesaplayacağız.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "plane", label: "Uçak + yerel ulaşım" },
                      { value: "car", label: "Araç kiralama ağırlıklı" },
                      { value: "public", label: "Toplu taşıma (metro, otobüs, tramvay)" },
                      { value: "taxi", label: "Taksi / araç çağırma uygulamaları" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("transport", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-left transition ${
                          answers.transport === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Araba kiralama senin için ne kadar önemli?
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "yes", label: "Genelde kiralarım" },
                      { value: "sometimes", label: "Bazen, destinasyona göre" },
                      { value: "no", label: "Tercih etmem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("carRental", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-center transition ${
                          answers.carRental === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Yeme-içme konusunda daha çok hangisi sensin?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Restaurant ve mekan önerilerini bu tercihlere göre seçeceğiz.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "street_food", label: "Sokak lezzetleri keşfetmeyi severim" },
                      { value: "local", label: "Yerel, otantik restoranlar tercihim" },
                      { value: "fine_dining", label: "Fine dining / deneyim odaklı" },
                      { value: "fast_food", label: "Pratik ve hızlı yemek olsun yeter" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("foodStyle", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-left transition ${
                          answers.foodStyle === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Genel bütçe seviyen nasıl olsun?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Konaklama ve aktivite kombosunu bu aralığa göre dengeleyeceğiz.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "low", label: "Uygun bütçeli" },
                      { value: "medium", label: "Dengeli" },
                      { value: "high", label: "Konfor odaklı" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("budgetLevel", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-center transition ${
                          answers.budgetLevel === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    Bir seyahat günün nasıl akmalı?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Gün içi program yoğunluğunu buna göre ayarlayacağız.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "chill", label: "Rahat (günde 1–2 aktivite)" },
                      { value: "balanced", label: "Dengeli (boş zaman + keşif)" },
                      { value: "full_schedule", label: "Yoğun (mümkün olduğunca çok şey)" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("pace", opt.value)}
                        className={`text-xs rounded-lg border px-3 py-2 text-center transition ${
                          answers.pace === opt.value
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                  Tercihlerin; rota tipi, konaklama önerileri, ulaşım seçenekleri ve yemek mekanlarını önermemizde doğrudan kullanılacak.
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Adım {step} / 4</span>
              <span className="hidden sm:inline-block">Dilediğin zaman ayarlarını değiştirebilirsin.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex-1 sm:flex-none rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Geri
              </button>

              {step < 4 && (
                <PrimaryButton
                  type="button"
                  disabled={!canGoNextStep(step)}
                  onClick={nextStep}
                  className="flex-1 sm:flex-none"
                >
                  Devam et
                </PrimaryButton>
              )}

              {step === 4 && (
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  className="flex-1 sm:flex-none"
                >
                  Kaydet ve devam et
                </PrimaryButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
