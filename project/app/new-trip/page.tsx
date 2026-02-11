"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  FileText,
  Loader2,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";
import { getSession } from "@/lib/authStorage";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";

interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

interface Itinerary {
  destination: string;
  days: DayPlan[];
  estimatedBudget: number;
}

interface SavedItinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelers: string;
  preferences: string;
  specialNotes?: string;
  itinerary: Itinerary;
}

export default function NewTripPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelers: "",
    preferences: "",
    aiNotes: "",
    specialNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [validationError, setValidationError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  const center = {
    lat: 41.0082, // İstanbul
    lng: 28.9784,
  };

  const libraries = ["places"] as (
    | "places"
    | "drawing"
    | "geometry"
    | "localContext"
    | "visualization"
  )[];

  useEffect(() => {
    const session = getSession();
    if (!session || !session.loggedIn) {
      router.push("/login");
      return;
    }

    setUserId(session?.userId ?? "");
  }, [router]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setError(null);
    setSaveSuccess(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(formData.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(formData.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setValidationError("Başlangıç tarihi bugünden eski olamaz.");
      return;
    }

    if (endDate < startDate) {
      setValidationError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
      return;
    }

    setLoading(true);
    setItinerary(null);

    try {
      const session = getSession();
      const currentUserId = session?.userId ?? userId ?? null;

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        setError(
          err?.error ||
            "Seyahat planı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      setItinerary(data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError(
        "Seyahat planı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itinerary) {
      setError("Önce bir plan oluşturmalısın.");
      return;
    }

    try {
      setError(null); // ✅ setError("") yerine
      setSaveSuccess(false);
      setSaving(true);

      const session = getSession();
      const currentUserId = session?.userId ?? null;

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          travelers: formData.travelers,
          preferences: formData.preferences,
          userId: currentUserId,
          itinerary,
          specialNotes: formData.specialNotes,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        console.error("Trip save failed:", err);
        setError("Seyahat kaydedilirken bir hata oluştu. Lütfen tekrar dene.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Trip save failed (catch):", err);
      setError("Seyahat kaydedilirken beklenmeyen bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearPlan = () => {
    setItinerary(null);
    setSaveSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      <div className="mb-8 rounded-xl overflow-hidden border">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
          libraries={["places"]}
          onLoad={() => setMapsReady(true)}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={10}
            onLoad={(m) => setMap(m)}
          />

          <div className="relative mt-4 z-50">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />

            {mapsReady ? (
              <Autocomplete
                onLoad={(ac) => {
                  autocompleteRef.current = ac;
                }}
                onPlaceChanged={() => {
                  const ac = autocompleteRef.current;
                  if (!ac) return;

                  const place = ac.getPlace();
                  const name = place?.name || "";
                  const loc = place?.geometry?.location;

                  if (name) {
                    setFormData((p) => ({ ...p, destination: name }));
                  }

                  if (loc && map) {
                    map.panTo({ lat: loc.lat(), lng: loc.lng() });
                    map.setZoom(12);
                  }
                }}
              >
                <input
                  id="destination"
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  placeholder="Örn: Paris, Roma, Barcelona"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </Autocomplete>
            ) : (
              <input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                placeholder="Harita yükleniyor..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                disabled
              />
            )}
          </div>
        </LoadScript>
      </div> {/* ✅ eksik kapanış eklendi */}

      <div className="mb-6 mt-2">
        <h1 className="text-slate-900 dark:text-slate-100 font-bold tracking-tight text-3xl md:text-4xl mb-2">
          Yeni Seyahat Planı
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
          Bilgilerini gir, yapay zekâ senin için mükemmel rotayı oluştursun
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Gidilecek Şehir
            </label>

            {/* ✅ sadece buranın aç/kapat ve dış div kapanışı düzeltildi */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              {mapsReady ? (
                <Autocomplete
                  onLoad={(ac) => {
                    autocompleteRef.current = ac;
                  }}
                  onPlaceChanged={() => {
                    const ac = autocompleteRef.current;
                    if (!ac) return;

                    const place = ac.getPlace();
                    const name = place?.name || "";
                    const loc = place?.geometry?.location;

                    if (name) setFormData((p) => ({ ...p, destination: name }));

                    if (loc && map) {
                      map.panTo({ lat: loc.lat(), lng: loc.lng() });
                      map.setZoom(12);
                    }
                  }}
                >
                  <input
                    id="destination"
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted =
                        value.charAt(0).toUpperCase() +
                        value.slice(1).toLowerCase();
                      setFormData({ ...formData, destination: formatted });
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                    placeholder="Örn: Paris, Roma, Barcelona"
                  />
                </Autocomplete>
              ) : (
                <input
                  id="destination"
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formatted =
                      value.charAt(0).toUpperCase() +
                      value.slice(1).toLowerCase();
                    setFormData({ ...formData, destination: formatted });
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                  placeholder="Harita yükleniyor..."
                  disabled
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Başlangıç Tarihi
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      setValidationError("");
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bitiş Tarihi
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="endDate"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      setValidationError("");
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bütçe (€)
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="budget"
                  type="number"
                  required
                  min="0"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="travelers"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kişi Sayısı
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="travelers"
                  type="number"
                  required
                  min="1"
                  value={formData.travelers}
                  onChange={(e) =>
                    setFormData({ ...formData, travelers: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                  placeholder="2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bu seyahatte özellikle görmek istediğin yerler
            </label>
            <textarea
              value={formData.specialNotes}
              onChange={(e) =>
                setFormData({ ...formData, specialNotes: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="Örn. Trevi Çeşmesi, Vatikan, Trastevere sokakları..."
            />
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
              Yapay zekâya not bırak (isteğe bağlı)
            </label>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
              Buraya seyahatle ilgili aklına gelen her şeyi yazabilirsin.{" "}
              <strong>“Burayı da gezmek istiyorum”</strong> dediğin yerleri
              mutlaka ekle.
              <br />
              <span className="italic">
                Örn: “Roma’da Colosseum, Trevi Çeşmesi ve yerel kahvecileri
                gezmek istiyorum.”
              </span>
            </p>

            <textarea
              rows={4}
              value={formData.aiNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, aiNotes: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Burayı da gezmek istiyorum... / Şu tarz yerleri seviyorum... / Kalabalık yerlerden kaçınırım..."
            />
          </div>

          <div>
            <label
              htmlFor="preferences"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tercihler (İsteğe bağlı)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) =>
                  setFormData({ ...formData, preferences: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                rows={4}
                placeholder="Örn: Müze seviyorum, gece hayatı istemiyorum, vegan restoran tercih ederim..."
              />
            </div>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">
                {validationError}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Plan Oluşturuluyor...
              </>
            ) : (
              "Plan Oluştur"
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-pulse">
          {/* skeleton içerik */}
          {/* ... burayı değiştirmedim ... */}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        itinerary &&
        itinerary.days &&
        itinerary.days.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {formData.destination.toUpperCase()}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {itinerary.days.length} Günlük Seyahat Planı
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tahmini Bütçe</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {itinerary.estimatedBudget.toLocaleString("tr-TR")} €
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <img
                  src={`https://source.unsplash.com/featured/?${encodeURIComponent(
                    formData.destination
                  )},travel`}
                  alt={formData.destination}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>

              <div className="space-y-4 mb-6">
                {itinerary.days.map((day) => (
                  <div key={day.day} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Gün {day.day}: {day.title}
                    </h3>
                    <ul className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm font-medium">
                    Seyahat planı kaydedildi. Dashboard'dan görüntüleyebilirsiniz.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  onClick={handleClearPlan}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Planı Temizle
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
