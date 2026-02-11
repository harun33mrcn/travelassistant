"use client";

import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    console.log("Form submitted:", formData);

    setTimeout(() => {
      setLoading(false);
      toast.success("Mesajınız alındı! En kısa sürede size dönüş yapacağız.");
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title="İletişim"
        description="Sorularınız, önerileriniz veya geri bildirimleriniz için bize ulaşın."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            İsim
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            E-posta
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Mesaj
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition resize-none"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>

        <PrimaryButton type="submit" loading={loading}>
          Gönder
        </PrimaryButton>
      </form>
    </div>
  );
}
