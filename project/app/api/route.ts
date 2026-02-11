import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";


type ItineraryRequest = {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences: string;
  userId?: string | null;
};

const SYSTEM_PROMPT = `
You are an expert travel planner. Based on the destination, travel dates, budget, number of travelers and preferences, you will generate a realistic, detailed and varied day-by-day itinerary.

Return ONLY valid JSON. No explanation text.
JSON format MUST be:
{
  "destination": string,
  "days": [
    { "day": number, "title": string, "activities": string[] }
  ],
  "estimatedBudget": number
}
`;

function buildMockItinerary(body: Partial<ItineraryRequest>) {
  const {
    destination = "Bilinmeyen Şehir",
    startDate,
    endDate,
    budget = 1000,
    travelers = 1,
    preferences = "",
  } = body;

  let dayCount = 3;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diff > 0 && diff < 15) {
      dayCount = diff;
    }
  }

  const days = Array.from({ length: dayCount }).map((_, index) => {
    const dayNumber = index + 1;
    return {
      day: dayNumber,
      title: `${destination} - Gün ${dayNumber}`,
      activities: [
        `${destination} şehir merkezini keşfet`,
        `${destination}'de yerel lezzetleri dene`,
        `${destination}'de keyifli bir yürüyüş yap`,
      ],
    };
  });

  return {
    destination,
    days,
    estimatedBudget: budget || dayCount * 150 * travelers,
  };
}

export async function POST(req: Request) {
  let body: Partial<ItineraryRequest> = {};

  try {
    body = (await req.json()) as ItineraryRequest;
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
    const {
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    preferences,
    userId,
  } = body;

  // Supabase'e kayıt ekle
  const { error } = await supabase.from("trips").insert([
    {
      user_id: userId ?? null,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget,
      travelers,
      preferences,
    }
  ]);

  if (error) {
    console.error("Supabase Insert Error:", error);
  }


  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OpenAI API key, using fallback");
      const fallback = buildMockItinerary(body);
      return NextResponse.json(fallback);
    }

    const {
      destination = "Unknown city",
      startDate = "",
      endDate = "",
      budget = 0,
      travelers = 1,
      preferences = "",
    } = body;

    const userPrompt = `
Destination: ${destination}
Start Date: ${startDate}
End Date: ${endDate}
Budget: ${budget}
Travelers: ${travelers}
Preferences: ${preferences}

Please generate a detailed JSON itinerary following the required format.
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      let message = "Failed to generate itinerary";
      try {
        const errJson = await response.json();
        message = errJson?.error?.message || message;
      } catch {
        const errorText = await response.text();
        if (errorText) message = errorText;
      }
      console.error("OpenAI API error:", message);
      console.log("Using fallback mock itinerary due to API error");
      const fallback = buildMockItinerary(body);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content returned from OpenAI");
      console.log("Using fallback mock itinerary due to empty response");
      const fallback = buildMockItinerary(body);
      return NextResponse.json(fallback);
    }

    let itinerary;
    try {
      itinerary = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, content);
      console.log("Using fallback mock itinerary due to JSON parse error");
      const fallback = buildMockItinerary(body);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Unexpected error in mock-itinerary route:", error);
    console.log("Using fallback mock itinerary due to unexpected error");
    const fallback = buildMockItinerary(body);
    return NextResponse.json(fallback);
  }
}
