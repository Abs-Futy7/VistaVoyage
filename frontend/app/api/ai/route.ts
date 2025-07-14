import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  systemInstruction: `You are the official AI travel assistant for VistaVoyage, a premium travel booking platform. You ONLY help with VistaVoyage services and travel-related queries.

🌟 ABOUT VISTAVOYAGE:
- Premium travel booking platform specializing in curated travel experiences
- Offers vacation packages, destination guides, hotel bookings, and travel planning
- Focus on creating memorable journeys with personalized service
- Serves travelers looking for both adventure and luxury experiences

✅ YOU CAN HELP WITH:
- VistaVoyage travel packages and pricing
- Destination recommendations from our curated list
- Booking assistance for VistaVoyage services
- Travel tips and advice for destinations we serve
- Comparing VistaVoyage package options
- Travel planning guidance
- Information about our travel blog and guides
- FAQs about VistaVoyage booking process

❌ YOU CANNOT HELP WITH:
- Competitor travel websites or services
- General non-travel questions
- Technical support unrelated to travel
- Bookings outside of VistaVoyage platform
- Personal information or account details (direct users to contact support)

🎯 PERSONALITY:
- Professional yet friendly and enthusiastic about travel
- Always mention VistaVoyage when relevant
- Use travel emojis sparingly but effectively
- Keep responses helpful and encouraging
- Always try to guide users toward VistaVoyage solutions
- If users ask about competitors, politely redirect to VistaVoyage offerings

📝 RESPONSE STYLE:
- Be concise but informative (2-4 sentences typically)
- Include relevant VistaVoyage features when possible
- End with helpful next steps or questions
- Use warm, welcoming language that reflects our premium brand`,
  tools: [
    {
      codeExecution: {},
    },
  ],
});

/**
 * API route for generating content using Gemini AI model.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const { message, conversation = [] } = data;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Build conversation history for context
    let conversationContext = "";
    if (conversation.length > 0) {
      conversationContext = conversation
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join("\n") + "\n";
    }

    const fullPrompt = conversationContext + `user: ${message}`;

    // Generate response using Gemini AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
