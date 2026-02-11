// lib/trips.ts
import { supabase } from "./supabaseClient";

export type SaveTripInput = {
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences?: string;
  itinerary?: any;
  specialNotes?: string | null;
};

export async function getTrips(userId: string) {
  const { data, error } = await supabase
    .from("trips") // 🔹 sadece "trips"
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function saveTrip(input: SaveTripInput) {
  const { data, error } = await supabase
    .from("trips") // 🔹 yine sadece "trips"
    .insert({
      user_id: input.userId,
      destination: input.destination,
      start_date: input.startDate,
      end_date: input.endDate,
      budget: input.budget,
      travelers: input.travelers,
      preferences: input.preferences ?? "",
      itinerary: input.itinerary ?? null,
      special_notes: input.specialNotes ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}



