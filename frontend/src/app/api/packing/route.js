import { NextResponse } from "next/server";

async function generateSectionContent(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "";
}

export async function POST(req) {
  try {
    const { destination, startDate, endDate, activities } = await req.json();

    const duration = Math.max(
      1,
      Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    );

    const packingListPrompt = `List essential items for a ${duration}-day trip to ${destination} with activities: ${activities.join(", ")}. Keep it concise (max 100 words). Format:
    - Packing List:
      - Toiletries: [items]
      - Gear: [items]
      - Misc: [items]
      Bullet point format with bolded headings. Dont provide a heading that says "Packing List".`;
    
    const travelTipsPrompt = `Give brief travel tips for ${destination} (max 100 words). Focus on navigation, transport, and food. Bullet point format with bolded headings. Dont provide a heading that says "Travel Tips".`;
    
    const localEssentialsPrompt = `List key local essentials for visiting ${destination}. Keep it under 100 words. Bullet point format with bolded headings. Dont provide a heading that says "Local Essentials".`;
    
    const clothingSuggestionsPrompt = `Suggest clothing for a ${duration}-day trip to ${destination} with activities: ${activities.join(", ")}. Bullet point format with bolded headings. Be concise (max 100 words). Dont provide a heading that says "Clothing Suggestions".`;

    const packingList = await generateSectionContent(packingListPrompt);
    const travelTips = await generateSectionContent(travelTipsPrompt);
    const localEssentials = await generateSectionContent(localEssentialsPrompt);
    const clothingSuggestions = await generateSectionContent(clothingSuggestionsPrompt);
    
    return NextResponse.json({
      packingList,
      travelTips,
      localEssentials,
      clothingSuggestions,
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: "Failed to generate packing list" }, { status: 500 });
  }
}
