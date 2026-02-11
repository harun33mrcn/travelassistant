"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Moon, Sun, Monitor, MessageSquare, Check,
  User, Settings as SettingsIcon, Bell, DollarSign, Calendar, Users
} from "lucide-react";
import {
  getTheme, setTheme,
  getFeedbackList, addFeedback,
  getPreferences, setPreferences,
  getNotifications, setNotifications,
  type Theme, type Preferences, type Notifications
} from "@/lib/theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type SessionState = "checking" | "guest" | "auth";

interface Session {
  email: string;
  loggedIn: boolean;
  lastLogin: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");
  const [preferences, setPreferencesState] = useState<Preferences>({
    currency: "EUR",
    dateFormat: "DD.MM.YYYY",
    defaultTravelers: 1,
  });
  const [notifications, setNotificationsState] = useState<Notifications>({
    promotions: true,
    reminders: true,
    newFeatures: true,
  });
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState<Array<{ id: string; createdAt: string; text: string }>>([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("travelmind_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSession(parsed);
        if (parsed?.loggedIn) {
          setSessionState("auth");
          setUserEmail(parsed.email || "");

          const theme = getTheme();
          setCurrentTheme(theme);

          const prefs = getPreferences();
          setPreferencesState(prefs);

          const notifs = getNotifications();
          setNotificationsState(notifs);

          const feedback = getFeedbackList();
          setFeedbackList(feedback);
        } else {
          setSessionState("guest");
        }
      } else {
        setSession(null);
        setSessionState("guest");
      }
    } catch {
      setSession(null);
      setSessionState("guest");
    }
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  const handlePreferenceChange = (key: keyof Preferences, value: string | number) => {
    const updated = { ...preferences, [key]: value };
    setPreferencesState(updated);
    setPreferences(updated);
  };

  const handleNotificationChange = (key: keyof Notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotificationsState(updated);
    setNotifications(updated);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    addFeedback(feedbackText);
    setFeedbackText("");
    setSuccessMessage("Geri bildiriminiz kaydedildi, teşekkürler!");

    const updatedFeedback = getFeedbackList();
    setFeedbackList(updatedFeedback);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (sessionState === "checking") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-950">
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          Ayarlar yükleniyor...
        </div>
      </div>
    );
  }

  if (sessionState === "guest") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-sm w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Ayarlar için giriş yap
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Hesap ayarlarını görüntülemek için önce giriş yapman gerekiyor.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Giriş Yap
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 transition"
            >
              Kayıt Ol
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 hover:border-slate-400 dark:hover:border-slate-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Ayarlar</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Hesabını ve uygulama tercihlerini yönet
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <User className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Hesap</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">E-posta</Label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="mt-2 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Şifre</Label>
                <button
                  disabled
                  className="mt-2 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                >
                  Şifre değiştir (Yakında)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tercihler</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Para Birimi
                </Label>
                <select
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tarih Formatı
                </Label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-500"
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Varsayılan Kişi Sayısı
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={preferences.defaultTravelers}
                  onChange={(e) => handlePreferenceChange("defaultTravelers", parseInt(e.target.value))}
                  className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-slate-900 dark:focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Bell className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Bildirimler</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-900 dark:text-slate-50 font-medium">
                    Kampanya ve İndirimler
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    E-posta ile özel fırsatları al
                  </p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(value) => handleNotificationChange("promotions", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-900 dark:text-slate-50 font-medium">
                    Seyahat Hatırlatmaları
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yaklaşan seyahatler için bildirim
                  </p>
                </div>
                <Switch
                  checked={notifications.reminders}
                  onCheckedChange={(value) => handleNotificationChange("reminders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-900 dark:text-slate-50 font-medium">
                    Yeni Özellikler
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yeni özellik duyuruları
                  </p>
                </div>
                <Switch
                  checked={notifications.newFeatures}
                  onCheckedChange={(value) => handleNotificationChange("newFeatures", value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {currentTheme === "dark" ? (
                  <Moon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                ) : currentTheme === "system" ? (
                  <Monitor className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Sun className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tema</h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Aydınlık, karanlık veya sistem temasını seç
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`py-3 px-4 rounded-lg border-2 transition-all ${
                  currentTheme === "light"
                    ? "border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Sun className="w-5 h-5" />
                  <span className="font-medium text-sm">Açık</span>
                  {currentTheme === "light" && <Check className="w-4 h-4" />}
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`py-3 px-4 rounded-lg border-2 transition-all ${
                  currentTheme === "dark"
                    ? "border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Moon className="w-5 h-5" />
                  <span className="font-medium text-sm">Koyu</span>
                  {currentTheme === "dark" && <Check className="w-4 h-4" />}
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`py-3 px-4 rounded-lg border-2 transition-all ${
                  currentTheme === "system"
                    ? "border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  <span className="font-medium text-sm">Sistem</span>
                  {currentTheme === "system" && <Check className="w-4 h-4" />}
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <MessageSquare className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Geri Bildirim</h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-4">
              TravelMind AI hakkında yorumunuzu, şikayetinizi veya önerinizi yazın
            </p>

            <form onSubmit={handleFeedbackSubmit} className="mb-8">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Deneyiminizi bizimle paylaşın..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                rows={5}
              />
              <button
                type="submit"
                disabled={!feedbackText.trim()}
                className="mt-4 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 px-6 py-3 rounded-lg hover:bg-black dark:hover:bg-sky-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gönder
              </button>
            </form>

            {successMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg p-3 flex items-center gap-2 border border-green-200 dark:border-green-800">
                <Check className="w-5 h-5" />
                {successMessage}
              </div>
            )}

            {feedbackList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  Önceki Geri Bildirimleriniz
                </h3>
                <div className="space-y-3">
                  {feedbackList.slice(-5).reverse().map((feedback) => (
                    <div
                      key={feedback.id}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {formatDate(feedback.createdAt)}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{feedback.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
