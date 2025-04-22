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
      Bullet point format with bolded headings. Dont provide a heading that says "Packing List". Make sure to address places where the user can enjoy said activities.`;
    
    const travelTipsPrompt = `Give brief travel tips for ${destination} (max 100 words). Focus on navigation, transport, and food. Bullet point format with bolded headings. Dont provide a heading that says "Travel Tips".`;
    
    const localEssentialsPrompt = `List key local essentials for visiting ${destination}. Keep it under 100 words. Bullet point format with bolded headings. Dont provide a heading that says "Local Essentials". Don't say "Okay here are some".`;
    
    const clothingSuggestionsPrompt = `Suggest clothing for a ${duration}-day trip to ${destination} with activities: ${activities.join(", ")}. Bullet point format with bolded headings. Be concise (max 100 words). Dont provide a heading that says "Clothing Suggestions". Make sure to mention cultural norms and manners. Mention the average climate there.`;

    const thingsToDoPrompt = `List top local activities in ${destination} related to: ${activities.join(", ")}. Keep it under 100 words. Bullet format with bolded headings. Do not include a heading.
Keep the suggestions practical and tailored to the region. Use bullet points with **bolded category names** and don't include a heading that says "Things to Do".
Maximum 100 words.`;

    const thingsToDo = await generateSectionContent(thingsToDoPrompt);
    const packingList = await generateSectionContent(packingListPrompt);
    const travelTips = await generateSectionContent(travelTipsPrompt);
    const localEssentials = await generateSectionContent(localEssentialsPrompt);
    const clothingSuggestions = await generateSectionContent(clothingSuggestionsPrompt);
    
    return NextResponse.json({
      packingList,
      travelTips,
      localEssentials,
      clothingSuggestions,
      thingsToDo,
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: "Failed to generate packing list" }, { status: 500 });
  }
}
