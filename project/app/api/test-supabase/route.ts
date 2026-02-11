import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("profiles").select("*");

  return NextResponse.json({
    success: !error,
    data,
    error,
  });
}
