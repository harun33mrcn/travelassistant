// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Sadece belli bir userId'ye ait seyahatleri getir
 * GET /api/trips?userId=xxxx
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("trips") // 🔹 Tablo adımız: public.trips
      .select(
        `
        id,
        destination,
        start_date,
        end_date,
        budget,
        travelers,
        preferences,
        user_id,
        special_notes,
        itinerary
      `
      )
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase GET trips error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const trips =
      data?.map((row) => ({
        id: row.id,
        destination: row.destination,
        startDate: row.start_date,
        endDate: row.end_date,
        budget: row.budget !== null ? String(row.budget) : "",
        travelers: row.travelers !== null ? String(row.travelers) : "",
        preferences: row.preferences ?? "",
        specialNotes: row.special_notes ?? "",
        itinerary: row.itinerary ?? null,
      })) ?? [];

    return NextResponse.json({ trips });
  } catch (err) {
    console.error("GET /api/trips error:", err);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

/**
 * Yeni bir seyahati Supabase'e kaydet
 * POST /api/trips
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      preferences,
      userId,
      itinerary,
      specialNotes,
    } = body;

    // En azından destination ve tarihleri kontrol edelim
    if (!destination) {
      return NextResponse.json(
        { error: "destination is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("trips")
      .insert({
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget ? Number(budget) : null,
        travelers: travelers ? Number(travelers) : null,
        preferences: preferences || "",
        user_id: userId || null,
        special_notes: specialNotes || "",
        itinerary: itinerary ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase INSERT trip error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ trip: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips error:", err);
    return NextResponse.json(
      { error: "Failed to save trip" },
      { status: 500 }
    );
  }
}
