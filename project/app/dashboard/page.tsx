"use client";

import TravelCalendar from "../../components/calendar/TravelCalendar";
import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Wallet,
  Plus,
  Trash2,
  X,
  Plane,
  ArrowLeft,
} from "lucide-react";
import { getSession, clearSession } from "@/lib/authStorage";
import { PageHeader } from "@/components/page-header";
import { getUserProfile } from "@/lib/supabaseAuth";

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
  itinerary: Itinerary | null;
  specialNotes?: string | null; // ✅ doğru alan
}


type SortBy = "date" | "budget" | "destination";
type SortDirection = "asc" | "desc";

type Profile = {
  id: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [savedTrips, setSavedTrips] = useState<SavedItinerary[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<SavedItinerary | null>(null);

  // 🔹 Kullanıcı profili
  const [profile, setProfile] = useState<Profile | null>(null);

  // 🔹 Sıralama + arama
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState<string>("");

  // 🔹 Yükleniyor durumu – tripler için
  const [loading, setLoading] = useState<boolean>(true);

  const [userId, setUserId] = useState<string | null>(null);

  // 🔹 Login kontrolü + profil çek
  useEffect(() => {
    const session = getSession();
    if (!session || !session.loggedIn) {
      router.push("/login");
      return;
    }

    // userId state'ini doldur
    setUserId(session.userId);

    const fetchProfile = async () => {
      try {
        const uid = session?.userId;

        if (!uid) {
          return;
        }

        const data = await getUserProfile(uid);
        setProfile(data as Profile);
      } catch (err) {
        console.error("Profil yüklenirken hata:", err);
      }
    };

    fetchProfile();
  }, [router]);

  // 🔹 Supabase'ten sadece bu kullanıcıya ait trips çek
  useEffect(() => {
    async function loadTrips() {
      try {
        const session = getSession();
        if (!session || !session.userId) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `/api/trips?userId=${encodeURIComponent(session.userId)}`
        );
        const json = await res.json();

        if (json.error) {
          console.error("Trips API error:", json.error);
          setSavedTrips([]);
          return;
        }

        const trips: SavedItinerary[] = (json.trips || []).map((t: any) => ({
          id: t.id,
          destination: t.destination,
          startDate: t.startDate ?? t.start_date,
          endDate: t.endDate ?? t.end_date,
          budget:
            t.budget !== undefined && t.budget !== null
              ? String(t.budget)
              : "",
          travelers:
            t.travelers !== undefined && t.travelers !== null
              ? String(t.travelers)
              : "",
          preferences: t.preferences ?? "",
          specialNotes: t.special_notes ?? "",
          itinerary: t.itinerary,
        }));

        setSavedTrips(trips);
      } catch (err) {
        console.error("Failed to load trips:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [router]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  // Şimdilik sadece frontend'den siliyoruz (istersen Supabase DELETE de ekleriz)
  const handleDelete = (e: MouseEvent<HTMLButtonElement>, tripId: string) => {
    e.stopPropagation();
    const updatedTrips = savedTrips.filter((trip) => trip.id !== tripId);
    setSavedTrips(updatedTrips);

    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
    }
  };

  // 🔹 Arama filtresi
  const filteredTrips = savedTrips.filter((trip) =>
    trip.destination.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Sıralama (tarih, bütçe, destinasyon)
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    let aVal: number | string = "";
    let bVal: number | string = "";

    if (sortBy === "date") {
      aVal = new Date(a.startDate).getTime();
      bVal = new Date(b.startDate).getTime();
    } else if (sortBy === "budget") {
      aVal = Number(a.budget || 0);
      bVal = Number(b.budget || 0);
    } else if (sortBy === "destination") {
      aVal = a.destination.toLowerCase();
      bVal = b.destination.toLowerCase();
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      const cmp = aVal.localeCompare(bVal, "tr");
      return sortDirection === "asc" ? cmp : -cmp;
    } else {
      const numA = Number(aVal);
      const numB = Number(bVal);
      if (numA < numB) return sortDirection === "asc" ? -1 : 1;
      if (numA > numB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  const sortLabel = (() => {
    if (sortBy === "date") {
      return sortDirection === "desc" ? "En yeni önce ↓" : "En eski önce ↑";
    }
    if (sortBy === "budget") {
      return sortDirection === "asc"
        ? "Bütçe: azdan çoğa ↑"
        : "Bütçe: çoktan aza ↓";
    }
    return sortDirection === "asc" ? "A → Z" : "Z → A";
  })();

  const fullName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || profile?.email || "gezgin";

  // 🔹 Küçük istatistikler (Mindtrip vari kartlar için)
  const today = new Date();
  const upcomingCount = savedTrips.filter((trip) => {
    if (!trip.startDate) return false;
    const start = new Date(trip.startDate);
    return start.getTime() >= today.setHours(0, 0, 0, 0);
  }).length;

  const totalNights = savedTrips.reduce((sum, trip) => {
    if (!trip.startDate || !trip.endDate) return sum;
    const s = new Date(trip.startDate);
    const e = new Date(trip.endDate);
    const days = Math.ceil(
      (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (isNaN(days) ? 0 : days);
  }, 0);

  const totalBudget = savedTrips.reduce((sum, trip) => {
    const val = Number(trip.budget || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const averageBudget =
    savedTrips.length > 0 ? Math.round(totalBudget / savedTrips.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 space-y-8">
        {/* HERO / HEADER CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-r from-sky-600/15 via-purple-600/10 to-amber-400/10 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
          {/* arkaplan glow'lar */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative px-6 py-7 md:px-10 md:py-9">
            <PageHeader
              title={
                profile ? `Hoş geldin, ${fullName}` : "Pathory Seyahat Alanın"
              }
              description="Tüm seyahatlerini tek ekranda gör, yeni rotalar planla ve Pathory’nin yapay zekâ asistanı ile detayları bize bırak."
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Geri */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/60 px-4 py-2 text-xs md:text-sm text-slate-100 hover:bg-slate-900 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </button>

                {/* Yeni seyahat */}
                <Link
                  href="/new-trip"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-xs md:text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition-all focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label="Yeni seyahat planla"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Yeni Seyahat Planla
                </Link>

                {/* Çıkış */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/50 px-4 py-2 text-xs md:text-sm text-slate-100 hover:bg-slate-900 transition-all"
                >
                  Çıkış yap
                </button>
              </div>
            </PageHeader>

            {/* Küçük istatistikler */}
            <div className="mt-6 grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Toplam rota
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {savedTrips.length}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Şimdiye kadar planladığın seyahat sayısı
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Yaklaşan seyahatler
                </p>
                <p className="mt-1 text-2xl font-semibold">{upcomingCount}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Bugünden sonraki başlangıç tarihine sahip rotalar
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Ortalama bütçe
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {averageBudget
                    ? `${averageBudget.toLocaleString("tr-TR")} €`
                    : "-"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Kayıtlı seyahatlerinin ortalama bütçesi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TAKVİM */}
        <TravelCalendar />

        {/* ANA İÇERİK KARTI */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 md:p-6 shadow-[0_12px_40px_rgba(15,23,42,0.85)]">
          {loading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <p className="text-slate-100 text-sm md:text-base">
                Geçmiş rotalar yükleniyor...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Supabase’ten seyahat verilerini çekiyoruz. İnternet bağlantına
                göre bu işlem birkaç saniye sürebilir.
              </p>
            </div>
          ) : savedTrips.length === 0 ? (
            // Hiç trip yoksa
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <Plane className="w-16 h-16 text-slate-600" />
              <h3 className="text-2xl font-semibold text-slate-50">
                Henüz bir seyahat planın yok
              </h3>
              <p className="text-slate-400 text-sm max-w-md">
                Pathory’ye hoş geldin! İlk rotanı planlayarak seyahat tarzına
                göre oteller, aktiviteler ve bütçe önerileri alabilirsin.
              </p>
              <Link
                href="/new-trip"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                İlk Seyahatimi Planla
              </Link>
            </div>
          ) : (
            <>
              {/* Arama + Sıralama barı */}
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                    Geçmiş Seyahatlerin
                  </h2>
                  <p className="text-xs text-slate-400">
                    Toplam{" "}
                    <span className="font-medium text-sky-300">
                      {savedTrips.length}
                    </span>{" "}
                    kayıt • {totalNights} gece yolculuk
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {/* Arama */}
                  <div className="relative md:w-64">
                    <input
                      type="text"
                      placeholder="Destinasyon ara (ör. Roma)..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Sıralama */}
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] md:text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="date">Tarihe göre</option>
                      <option value="budget">Bütçeye göre</option>
                      <option value="destination">İsme göre</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setSortDirection((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        )
                      }
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] md:text-xs text-slate-100 hover:bg-slate-800"
                    >
                      {sortLabel}
                    </button>
                  </div>
                </div>
              </div>

              {/* Aramada sonuç yoksa */}
              {sortedTrips.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 py-10 text-center">
                  <p className="text-slate-200 mb-1">
                    Aramana uygun seyahat bulunamadı.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Arama terimini sadeleştir veya sıralama seçeneklerini
                    sıfırlayarak tekrar dene.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-500/60 hover:shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-32 h-32 shrink-0">
                          <img
                            src={`https://source.unsplash.com/featured/?${encodeURIComponent(
                              trip.destination
                            )},travel`}
                            alt={trip.destination}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                        </div>

                        <div className="flex-1 p-4 md:p-5">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg md:text-xl font-semibold text-slate-50 tracking-tight">
                                {trip.destination}
                              </h3>
                              <p className="mt-0.5 text-xs text-sky-300/90">
                                {getDuration(trip.startDate, trip.endDate)}{" "}
                                günlük yolculuk
                              </p>
                            </div>

                            <button
                              onClick={(e) => handleDelete(e, trip.id)}
                              className="rounded-full p-1.5 text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                              aria-label="Seyahati sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3 md:text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4" />
                              <div>
                                <p className="font-medium">
                                  {formatDate(trip.startDate)}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  → {formatDate(trip.endDate)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-300">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">
                                {trip.travelers || "-"}{" "}
                                {Number(trip.travelers || "0") === 1
                                  ? "kişi"
                                  : "kişi"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-300">
                              <Wallet className="w-4 h-4" />
                              <span className="font-medium">
                                {trip.budget
                                  ? `${Number(
                                      trip.budget
                                    ).toLocaleString("tr-TR")} €`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detay modalı aynı mantıkla korunuyor */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  {selectedTrip.destination}
                </h2>
                <p className="mt-1 text-xs md:text-sm text-slate-400">
                  {selectedTrip.itinerary &&
                  Array.isArray(selectedTrip.itinerary.days)
                    ? `${selectedTrip.itinerary.days.length} Günlük Seyahat Planı`
                    : "Seyahat Detayları"}
                </p>
              </div>

              {/* Kullanıcının özellikle görmek istediği yerler */}
              {selectedTrip.specialNotes && (
                <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-100 mb-2">
                    Bu seyahatte özellikle görmek istediği yerler
                  </h4>
                  <p className="text-sm text-slate-300 whitespace-pre-line">
                    {selectedTrip.specialNotes}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedTrip(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={`https://source.unsplash.com/featured/?${encodeURIComponent(
                    selectedTrip.destination
                  )},travel`}
                  alt={selectedTrip.destination}
                  className="h-64 w-full object-cover"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="font-medium">
                        {formatDate(selectedTrip.startDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        → {formatDate(selectedTrip.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedTrip.travelers || "-"} kişi
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedTrip.budget
                        ? `${Number(
                            selectedTrip.budget
                          ).toLocaleString("tr-TR")} €`
                        : "-"}
                      {selectedTrip.itinerary?.estimatedBudget && (
                        <>
                          {" "}
                          (Tahmini:{" "}
                          {selectedTrip.itinerary.estimatedBudget.toLocaleString(
                            "tr-TR"
                          )}{" "}
                          €)
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTrip.itinerary &&
              Array.isArray(selectedTrip.itinerary.days) &&
              selectedTrip.itinerary.days.length > 0 ? (
                <div className="space-y-4">
                  {selectedTrip.itinerary.days.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      <h3 className="mb-3 text-lg font-semibold text-slate-50">
                        Gün {day.day}: {day.title}
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-200">
                        {Array.isArray(day.activities) &&
                          day.activities.map((activity, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-slate-300"
                            >
                              <span className="mt-1 text-slate-500">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-center text-sm text-slate-400">
                  Bu seyahat kaydında detaylı gün gün plan bilgisi bulunmuyor.
                </div>
              )}

              <button
                onClick={() => setSelectedTrip(null)}
                className="mt-4 w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-all focus:outline-none focus:ring-2 focus:ring-sky-300"
                aria-label="Detayları kapat"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


