"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, User, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/authStorage";
import { signUpWithEmail, upsertUserProfile } from "@/lib/supabaseAuth";
import { PrimaryButton } from "@/components/primary-button";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  passwordConfirm: string;
  verificationMethod: "email" | "phone";
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  password?: string;
  passwordConfirm?: string;
  verificationMethod?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    passwordConfirm: "",
    verificationMethod: "email",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session && session.loggedIn) {
      router.push("/dashboard");
    }
  }, [router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = "İsim zorunludur";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Soyisim zorunludur";
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi girin";
      isValid = false;
    }

    if (!validatePhone(formData.phone)) {
      errors.phone = "Geçerli bir telefon numarası girin (en az 10 hane)";
      isValid = false;
    }

    if (!formData.gender) {
      errors.gender = "Cinsiyet seçimi zorunludur";
      isValid = false;
    }

    // Şifre kontrolleri
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalı.";
      isValid = false;
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Şifreler eşleşmiyor";
      isValid = false;
    }

    if (!formData.verificationMethod) {
      errors.verificationMethod = "Doğrulama yöntemi seçin";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    if (!validateForm()) {
      setGeneralError("Lütfen tüm alanları doğru şekilde doldurun");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setLoading(false);
    setStep(2);
  };

  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    setCodeError("");
    setGeneralError("");

    if (enteredCode !== verificationCode) {
      setCodeError("Doğrulama kodu hatalı, lütfen kontrol edin");
      return;
    }

    setLoading(true);
    try {
      // 1) Supabase Auth ile kullanıcı oluştur
      const { user } = await signUpWithEmail(
        formData.email,
        formData.password
      );

      // 2) Kullanıcı oluştuysa profiles tablosuna da kaydet
      if (user) {
        await upsertUserProfile({
          id: user.id,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }

      // 3) Giriş sayfasına yönlendir
      router.push("/quiz?from=signup");
    } catch (err: any) {
      console.error("Supabase signup error:", err);
      setGeneralError(
        err?.message ?? "Kayıt olurken bir hata oluştu. Lütfen tekrar dene."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setEnteredCode("");
    setCodeError("");
  };

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50 mb-2">
            Doğrulama Kodu Gönderildi
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            {formData.verificationMethod === "email" ? "E-posta" : "Telefon"}{" "}
            üzerinden gönderilen 6 haneli kodu girin
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Geliştirici notu:</strong> Kodunuz:{" "}
              <span className="font-mono text-lg">{verificationCode}</span>
              <br />
              <span className="text-xs">
                (Gerçekte SMS/e-posta ile gönderilecektir)
              </span>
            </p>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >
                Doğrulama Kodu
              </label>
              <input
                id="code"
                type="text"
                maxLength={6}
                required
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value.replace(/\D/g, ""));
                  setCodeError("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
              {codeError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {codeError}
                </p>
              )}
            </div>

            <PrimaryButton
              type="submit"
              disabled={enteredCode.length !== 6}
              loading={loading}
              className="w-full"
            >
              Onayla
            </PrimaryButton>
          </form>

          <button
            onClick={handleBackToStep1}
            className="mt-4 w-full text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50 mb-2">
          Hesap Oluştur
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mb-8">
          Seyahat planlamaya başlamak için kayıt olun
        </p>

        <form onSubmit={handleStep1Submit} className="space-y-5">
          {/* İSİM */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              İsim
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  setFieldErrors({ ...fieldErrors, firstName: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="İsminiz"
              />
            </div>
            {fieldErrors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.firstName}
              </p>
            )}
          </div>

          {/* SOYİSİM */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Soyisim
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  setFieldErrors({ ...fieldErrors, lastName: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="Soyisminiz"
              />
            </div>
            {fieldErrors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.lastName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="ornek@email.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Telefon Numarası
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setFieldErrors({ ...fieldErrors, phone: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="+90 555 123 4567"
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Cinsiyet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                id="gender"
                required
                value={formData.gender}
                onChange={(e) => {
                  setFormData({ ...formData, gender: e.target.value });
                  setFieldErrors({ ...fieldErrors, gender: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 appearance-none"
              >
                <option value="">Seçiniz</option>
                <option value="female">Kadın</option>
                <option value="male">Erkek</option>
                <option value="other">Belirtmek istemiyorum</option>
              </select>
            </div>
            {fieldErrors.gender && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.gender}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
              En az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermeli
            </p>
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
            >
              Şifreyi Doğrula
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="passwordConfirm"
                type="password"
                required
                value={formData.passwordConfirm}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    passwordConfirm: e.target.value,
                  });
                  setFieldErrors({
                    ...fieldErrors,
                    passwordConfirm: undefined,
                  });
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.passwordConfirm}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Doğrulama Yöntemi
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={formData.verificationMethod === "email"}
                  onChange={() =>
                    setFormData({ ...formData, verificationMethod: "email" })
                  }
                  className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                />
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  E-posta ile doğrula
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="phone"
                  checked={formData.verificationMethod === "phone"}
                  onChange={() =>
                    setFormData({ ...formData, verificationMethod: "phone" })
                  }
                  className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                />
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  Telefon ile doğrula
                </span>
              </label>
            </div>
          </div>

          {generalError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-md p-3">
              {generalError}
            </div>
          )}

          <PrimaryButton type="submit" loading={loading} className="w-full">
            Devam Et
          </PrimaryButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-slate-400">
            Zaten hesabın var mı?{" "}
            <Link
              href="/login"
              className="text-gray-900 dark:text-sky-400 font-medium hover:underline"
            >
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
