// lib/supabaseAuth.ts
import { supabase } from "./supabaseClient";
import { setSession, clearSession } from "./authStorage";

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  if (user) {
    setSession({
      loggedIn: true,
      userId: user.id,
      email: user.email ?? null,
    });
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  clearSession();
  if (error) throw error;
}

/**
 * Profil bilgilerini güvenli şekilde kaydet:
 * - Profil zaten varsa UPDATE (upsert)
 * - Yoksa INSERT
 * Not: id, auth.users id ile aynı olmalı
 */
export async function upsertUserProfile(params: {
  id: string;
  email?: string;
  phone?: string;
  gender?: string;
  firstName?: string;
  lastName?: string;
}) {
  const { id, email, phone, gender, firstName, lastName } = params;

  const payload: any = {
    id,
    email: email ?? null,
    phone: phone ?? null,
    gender: gender ?? null,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, phone, gender, first_name, last_name, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, phone, gender, first_name, last_name, created_at")
    .eq("id", id)
    .maybeSingle();

  // maybeSingle: kayıt yoksa error fırlatmaz, data null döner
  if (error) throw error;

  return data; // data | null
}
