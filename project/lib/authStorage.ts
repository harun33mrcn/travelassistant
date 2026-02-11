// lib/authStorage.ts

// LocalStorage'ta tutacağımız oturum tipi
export type SessionData = {
  loggedIn: boolean;
  userId: string | null;
  email: string | null;
};

const SESSION_KEY = "travelmind_session";

// Oturumu oku
export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch (err) {
    console.error("getSession parse error:", err);
    return null;
  }
}

// Oturumu kaydet
export function setSession(data: SessionData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("setSession error:", err);
  }
}

// Oturumu temizle
export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error("clearSession error:", err);
  }
}

// 🔐 ŞİFRE KONTROL FONKSİYONU
export function validatePassword(password: string): { valid: boolean; error: string } {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Şifre en az 8 karakter olmalı");
  }
  if (!/[A-ZÇĞİÖŞÜ]/.test(password)) {
    errors.push("En az bir büyük harf içermeli");
  }
  if (!/[a-zçğıöşü]/.test(password)) {
    errors.push("En az bir küçük harf içermeli");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("En az bir rakam içermeli");
  }
  // İstersen özel karakter zorunluluğu da ekleyebiliriz:
  // if (!/[^A-Za-z0-9]/.test(password)) {
  //   errors.push("En az bir özel karakter içermeli");
  // }

  return {
    valid: errors.length === 0,
    error: errors.join(" • "),
  };
}


