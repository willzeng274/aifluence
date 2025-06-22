import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
	const { name, tone, background_info } = await req.json();

	if (!name || !tone || !background_info) {
		return NextResponse.json(
			{ error: "Missing required fields: name, tone, background_info" },
			{ status: 400 }
		);
	}

	const prompt = `
    Given the following AI influencer profile:
    - Name: ${name}
    - Tone: ${tone}
    - Background/Mission: ${background_info}

    Generate a detailed target audience and a set of primary goals for this influencer.
    Return the data in a valid JSON object with the following structure. Do not include any text other than the JSON object.
    {
      "goals": ["string", "string", "string"],
      "audience_age_range": [number, number],
      "audience_gender": "all" | "male" | "female" | "other",
      "audience_interests": ["string", "string", "string"],
      "audience_region": "North America" | "Europe" | "Asia" | "South America" | "Africa" | "Australia" | "Other"
    }
  `;

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			response_format: { type: "json_object" },
		});

		const suggestions = JSON.parse(
			response.choices[0]?.message?.content || "{}"
		);

		return NextResponse.json(suggestions);
	} catch (error) {
		console.error("OpenAI API call failed:", error);
		return NextResponse.json(
			{ error: "Failed to generate suggestions from AI." },
			{ status: 500 }
		);
	}
}
