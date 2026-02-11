"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Sparkles, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type DayPlan = {
  id: string;
  title: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// startDate..endDate aralığındaki her güne planı map'ler
function buildPlanIndex(plans: DayPlan[]) {
  const idx = new Map<string, DayPlan[]>();
  for (const p of plans) {
    const start = parseYMD(p.startDate);
    const end = parseYMD(p.endDate);
    const cur = new Date(start);
    while (cur <= end) {
      const key = toYMD(cur);
      const arr = idx.get(key) ?? [];
      arr.push(p);
      idx.set(key, arr);
      cur.setDate(cur.getDate() + 1);
    }
  }
  return idx;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Takvim grid'i (Pzt başlangıç)
function buildCalendarGrid(viewDate: Date) {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);

  // JS: 0=Pazar..6=Cumartesi. Biz Pzt=0 istiyoruz.
  const startDay = (start.getDay() + 6) % 7;
  const totalDays = end.getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];

  // Önceki ayın son günleri
  for (let i = 0; i < startDay; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (startDay - i));
    cells.push({ date: d, inMonth: false });
  }

  // Bu ay
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day), inMonth: true });
  }

  // Sonraki ay ile 6 satır (42 hücre) tamamla
  while (cells.length < 42) {
    const last = cells[cells.length - 1]!.date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }

  return cells;
}

export default function DashboardPage() {
  const router = useRouter();

  // ✅ burayı sonra Supabase'den gerçek trips ile dolduracağız
  const plans: DayPlan[] = [
    { id: "t1", title: "Roma 3 Gün", city: "Roma", startDate: "2026-02-10", endDate: "2026-02-12" },
    { id: "t2", title: "Paris Weekend", city: "Paris", startDate: "2026-02-15", endDate: "2026-02-16" },
  ];

  const todayKey = toYMD(new Date());
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  const planIndex = useMemo(() => buildPlanIndex(plans), [plans]);
  const selectedPlans = planIndex.get(selectedKey) ?? [];
  const hasPlan = selectedPlans.length > 0;

  const cells = useMemo(() => buildCalendarGrid(viewDate), [viewDate]);

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-300">
            Takviminden yönet, planın varsa büyüsün — yoksa keşif önerelim.
          </p>
        </div>

        <button
          onClick={() => router.push("/new-trip")}
          className="rounded-xl bg-white/10 px-4 py-2 text-slate-100 hover:bg-white/15 transition border border-white/10"
        >
          + Yeni Plan
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Calendar */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-100">
              <CalendarDays className="w-5 h-5" />
              <div className="font-semibold capitalize">{monthLabel(viewDate)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                className="rounded-lg p-2 hover:bg-white/10 transition"
                aria-label="Önceki ay"
              >
                <ChevronLeft className="w-4 h-4 text-slate-200" />
              </button>
              <button
                onClick={() =>
                  setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
                className="rounded-lg p-2 hover:bg-white/10 transition"
                aria-label="Sonraki ay"
              >
                <ChevronRight className="w-4 h-4 text-slate-200" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-400">
            {weekDays.map((w) => (
              <div key={w} className="px-2">{w}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map(({ date, inMonth }) => {
              const key = toYMD(date);
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const dayPlans = planIndex.get(key) ?? [];
              const hasDayPlan = dayPlans.length > 0;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={[
                    "relative rounded-xl px-2 py-3 text-left transition",
                    "border border-white/5 hover:border-white/15 hover:bg-white/5",
                    inMonth ? "text-slate-100" : "text-slate-500",
                    isSelected ? "bg-white/10 border-white/20" : "",
                  ].join(" ")}
                >
                  {/* gün numarası */}
                  <div className="flex items-center justify-between">
                    <div className={["text-sm font-semibold", isToday ? "text-emerald-300" : ""].join(" ")}>
                      {date.getDate()}
                    </div>

                    {/* plan rozet */}
                    {hasDayPlan && (
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                        <span className="text-[10px] text-amber-200">
                          {dayPlans.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* highlight şeridi */}
                  {hasDayPlan && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gradient-to-r from-amber-300/80 via-pink-300/70 to-sky-300/60" />
                  )}

                  {/* seçili halka */}
                  {isSelected && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-sky-400/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Day card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div
            className={[
              "rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur p-5 transition-all duration-300",
              hasPlan ? "min-h-[280px]" : "min-h-[160px]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-slate-300 text-sm">Seçili gün</div>
                <div className="text-slate-100 font-semibold mt-1">
                  {new Date(selectedKey).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {hasPlan ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-amber-300/10 border border-amber-300/20 px-3 py-1.5 text-amber-200">
                  <Sparkles className="w-4 h-4" />
                  Plan var
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-sky-300/10 border border-sky-300/20 px-3 py-1.5 text-sky-200">
                  <Sparkles className="w-4 h-4" />
                  Keşif modu
                </div>
              )}
            </div>

            <div className="mt-4">
              {hasPlan ? (
                <div className="space-y-3">
                  {selectedPlans.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-slate-100 font-semibold">{p.title}</div>
                        <div className="text-slate-300 text-xs">
                          {p.startDate} → {p.endDate}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-slate-300 text-sm">
                        <MapPin className="w-4 h-4" />
                        {p.city}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-slate-100 hover:bg-white/15 transition"
                          onClick={() => router.push("/dashboard")} // sonra: trip detay sayfası
                        >
                          Detay
                        </button>
                        <button
                          className="flex-1 rounded-xl bg-sky-400/15 border border-sky-400/20 px-3 py-2 text-sky-100 hover:bg-sky-400/20 transition"
                          onClick={() => router.push("/new-trip")}
                        >
                          Yeni plan ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-fuchsia-500/5 to-amber-400/10 p-4">
                  <div className="text-slate-100 font-semibold">
                    Plan yok — keşfetmek ister misin?
                  </div>
                  <p className="mt-2 text-slate-300 text-sm">
                    Bu gün için mini rota çıkaralım: “yakınlarda popüler yerler”, “az bilinen keşifler”,
                    “bütçe dostu öneriler” gibi.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 rounded-xl bg-sky-400/20 border border-sky-400/25 px-3 py-2 text-sky-100 hover:bg-sky-400/25 transition"
                      onClick={() => router.push("/new-trip")}
                    >
                      Keşif planı oluştur
                    </button>
                    <button
                      className="flex-1 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-slate-100 hover:bg-white/15 transition"
                      onClick={() => setSelectedKey(todayKey)}
                    >
                      Bugüne dön
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* küçük dikkat çekici alan */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-slate-100 font-semibold">Hızlı ipucu</div>
            <p className="mt-2 text-slate-300 text-sm">
              Takvimde bir günün “plan var” olması, o gün hücresinin altındaki renkli şeritle
              belirginleşiyor. Kullanıcı gözünde “takvim yaşayan bir şey” gibi duruyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
