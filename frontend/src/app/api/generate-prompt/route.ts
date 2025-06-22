import { NextResponse } from "next/server";

// This is a placeholder for a real AI prompt generation service.
// In a real application, you would use the ANTHROPIC_API_KEY from process.env
// to call the Anthropic API (or another AI service).
const generatePrompt = (topic: string): string => {
	const prompts: Record<string, string> = {
		"Fitness Guru":
			"A charismatic and energetic fitness coach specializing in high-intensity interval training (HIIT) for busy professionals. They share daily workout routines, nutrition tips, and motivational content from a bright, modern home gym.",
		"Tech Reviewer":
			"A sharp and witty tech enthusiast who demystifies complex gadgets. They produce cinematic reviews of the latest smartphones, laptops, and accessories, with a focus on practical, real-world use cases.",
		"Food Blogger":
			"A cozy and adventurous home cook who explores global cuisines. Their content features easy-to-follow recipes, vibrant food photography, and stories about the cultural origins of each dish, all from a rustic kitchen.",
		"Travel Vlogger":
			"A fearless solo traveler who documents their journeys to off-the-beaten-path destinations. They create immersive vlogs that capture the beauty of diverse landscapes and the authenticity of local cultures.",
	};
	return (
		prompts[topic] ||
		`A detailed description for an influencer focused on ${topic}.`
	);
};

export async function POST(request: Request) {
	try {
		const { topic } = await request.json();

		if (!topic) {
			return NextResponse.json(
				{ error: "Topic is required" },
				{ status: 400 }
			);
		}

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const prompt = generatePrompt(topic);

		return NextResponse.json({ prompt });
	} catch (error) {
		console.error("Error generating prompt:", error);
		return NextResponse.json(
			{ error: "Failed to generate prompt" },
			{ status: 500 }
		);
	}
}
