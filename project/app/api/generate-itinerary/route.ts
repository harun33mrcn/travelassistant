import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, startDate, endDate, budget,specialNotes, travelers, preferences } = body;

    const userText = preferences || "";

    const prompt = `
      Kullanıcı ${destination} için bir seyahat planı istiyor.
      Tarihler: ${startDate} - ${endDate}
      Bütçe: ${budget}
      Kişi sayısı: ${travelers}

      Kullanıcı ekstra şunları görmek/gezmek istiyor:
      "${userText}"

      Bana JSON formatında bir seyahat planı oluştur:
      {
        "days": [
          { "day": 1, "title": "...", "activities": ["...", "..."] }
        ],
        "estimatedBudget": 0
      }
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    return new Response(JSON.stringify(result), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "AI failed" }), { status: 500 });
  }
}
