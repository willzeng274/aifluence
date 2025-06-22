import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface Step2AvatarGenerationProps {
	onBack: () => void;
	onSubmit: (data: { description: string; avatarUrl: string }) => void;
	formData: any; // A more specific type is recommended
}

/**
 * Generates a descriptive prompt for an image generation model.
 */
function generateInstagramInfluencerPrompt({
	mode,
	name,
	physicalDescription,
	backgroundInfo,
	goals,
	tone,
	audienceAgeRange,
	audienceGender,
	audienceInterests,
	audienceRegion,
}: any): string {
	const goalsStr = goals?.join(", ") || "build a community";
	const interestsStr = audienceInterests?.join(", ") || "popular culture";

	return `Generate a realistic, high-quality Instagram influencer portrait of a ${
		mode || "lifestyle"
	} creator named ${name}.
They are described as: ${physicalDescription}.
Context/Background: ${backgroundInfo}.
Their main goals are to ${goalsStr}.
Render in a ${tone} tone and aesthetic.
Target audience: ages ${audienceAgeRange?.[0] || 18}–${
		audienceAgeRange?.[1] || 35
	}, gender "${
		audienceGender || "all"
	}", interests in ${interestsStr}, based in ${
		audienceRegion || "North America"
	}.
The image should be a close-up or medium shot, well-lit, and suitable for a social media profile picture.`;
}

const Step2AvatarGeneration: React.FC<Step2AvatarGenerationProps> = ({
	onBack,
	onSubmit,
	formData,
}) => {
	const [physicalDescription, setPhysicalDescription] = useState("");
	const [avatarUrl, setAvatarUrl] = useState(
		"https://api.dicebear.com/7.x/bottts/svg?seed=placeholder"
	);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerate = async () => {
		if (!physicalDescription) {
			alert("Please provide a physical description.");
			return;
		}
		setIsGenerating(true);

		const prompt = generateInstagramInfluencerPrompt({
			...formData,
			physicalDescription,
		});

		console.log("Generated Prompt:", prompt);

		try {
			const response = await fetch(
				"http://localhost:8000/generate-image",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						accept: "application/json",
					},
					body: JSON.stringify({ prompt }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Image generation failed:", errorData);
				alert(
					`Failed to generate image: ${
						errorData.detail || "An unknown error occurred."
					}`
				);
				setIsGenerating(false);
				return;
			}

			const result = await response.json();
			// Prepend the backend server URL to the image path
			const fullAvatarUrl = `http://localhost:8000${result.path}`;
			setAvatarUrl(fullAvatarUrl);
		} catch (error) {
			console.error("Error calling image generation API:", error);
			alert(
				"An error occurred while generating the image. Please try again."
			);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmit = () => {
		onSubmit({ description: physicalDescription, avatarUrl });
	};

	return (
		<div className='relative h-screen max-h-screen overflow-x-hidden flex flex-col'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />

			<div className='relative z-10 flex-1 flex flex-col p-8'>
				<div className='mb-8'>
					<div className='flex items-baseline gap-4 mb-4'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Visual Identity</span>
					</div>

					<h1 className='text-5xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-white/90'>CRAFT YOUR</span>
						<br />
						<span className='text-white/60'>DIGITAL FACE</span>
					</h1>

					<div className='flex items-center gap-6 mt-4'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-xs uppercase tracking-wider'>
							Define your virtual appearance
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1 min-h-0'>
					<div className='relative group h-full'>
						<div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500 h-full flex flex-col'>
							<div className='flex-1 flex flex-col'>
								<div className='mb-4'>
									<div className='flex items-center gap-3'>
										<div className='w-12 h-px bg-white/20' />
										<label
											htmlFor='description'
											className='text-xs font-medium text-white/50 uppercase tracking-wider'
										>
											Physical Appearance
										</label>
									</div>
								</div>
								<textarea
									id='description'
									value={physicalDescription}
									onChange={(e) =>
										setPhysicalDescription(e.target.value)
									}
									placeholder='e.g., "A young woman with long, silver hair, wearing futuristic cyberpunk attire..."'
									className='flex-1 w-full bg-black/50 backdrop-blur-sm p-4 border border-white/10 focus:border-white/30 focus:outline-none transition-all duration-300 placeholder:text-white/30 resize-none'
								/>
								<button
									onClick={handleGenerate}
									disabled={isGenerating || !physicalDescription}
									className='mt-4 relative overflow-hidden w-full group/btn'
								>
									<div className='absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500' />
									<div className='relative flex items-center justify-center gap-3 px-6 py-3 border border-white/20 bg-black/50 backdrop-blur-sm group-hover/btn:border-white/40 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'>
										{isGenerating ? (
											<>
												<Sparkles className='w-5 h-5 animate-pulse' />
												<span className='font-semibold uppercase tracking-wider text-sm'>Generating...</span>
											</>
										) : (
											<>
												<Sparkles className='w-5 h-5' />
												<span className='font-semibold uppercase tracking-wider text-sm'>Generate Avatar</span>
											</>
										)}
									</div>
								</button>
							</div>
						</div>
					</div>

					<div className='relative group h-full'>
						<div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500 h-full'>
							<div className='flex items-center justify-center h-full'>
								{isGenerating ? (
									<div className='flex flex-col items-center justify-center text-white/60'>
										<div className='relative'>
											<div className='absolute inset-0 bg-white/5 blur-xl scale-150' />
											<Sparkles className='relative w-16 h-16 animate-pulse' />
										</div>
										<p className='mt-6 text-sm uppercase tracking-wider'>Crafting your persona...</p>
									</div>
								) : (
									<div className='relative w-full h-full flex items-center justify-center'>
										<div className='absolute top-4 right-4 text-6xl font-black text-white/5'>01</div>
										<div className='relative aspect-square w-full max-w-full max-h-full'>
											<img
												src={avatarUrl}
												alt='Generated Avatar'
												className='absolute inset-0 w-full h-full object-cover'
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className='mt-8'>
					<div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6' />
					<div className='flex items-center justify-between'>
						<button
							onClick={onBack}
							className='group flex items-center gap-3 relative overflow-hidden'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-white/5 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-white/20 bg-black/50 backdrop-blur-sm group-hover:border-white/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Back</span>
							</span>
						</button>
						<button
							onClick={handleSubmit}
							disabled={avatarUrl.includes("placeholder")}
							className='group flex items-center gap-3 relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 to-teal-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-white/20 bg-black/50 backdrop-blur-sm group-hover:border-white/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Continue</span>
								<ArrowRight className='w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform duration-300' />
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step2AvatarGeneration;
