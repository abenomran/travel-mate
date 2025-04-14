import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { destination, startDate, endDate, activities } = await req.json();

    const duration = Math.max(
      1,
      Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    );

    const prompt = `Generate a practical packing list for a ${duration}-day trip to ${destination}, including activities: ${activities.join(", ")}. 
Organize it into sections like:
- Clothing
- Toiletries
- Gear
- Miscellaneous
Keep it clear and useful.`;

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command-r-plus",
        message: prompt,
        chat_history: [],
        temperature: 0.7,
      }),
    });

    const result = await response.json();
    const text = result?.text;

    return NextResponse.json({ list: text || "Sorry, couldn't generate list." });
  } catch (err) {
    console.error("Cohere API error:", err);
    return NextResponse.json({ error: "Failed to generate packing list" }, { status: 500 });
  }
}
