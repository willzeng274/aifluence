import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface Step2AvatarGenerationProps {
	onBack: () => void;
	onSubmit: (data: { description: string; avatarUrl: string }) => void;
}

const Step2AvatarGeneration: React.FC<Step2AvatarGenerationProps> = ({
	onBack,
	onSubmit,
}) => {
	const [description, setDescription] = useState("");
	const [avatarUrl, setAvatarUrl] = useState(
		"https://api.dicebear.com/7.x/bottts/svg?seed=placeholder"
	);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerate = () => {
		if (!description) return;
		setIsGenerating(true);
		// Use a placeholder API (RoboHash) to generate an image from the description
		const generatedUrl = `https://robohash.org/${encodeURIComponent(
			description
		)}.png?set=set4`;

		// Simulate API call delay
		setTimeout(() => {
			setAvatarUrl(generatedUrl);
			setIsGenerating(false);
		}, 1500);
	};

	const handleSubmit = () => {
		onSubmit({ description, avatarUrl });
	};

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Generate Persona's Look
				</h1>
				<p className='text-white/50 mt-2'>
					Describe the visual appearance of your AI persona.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
				<div className='space-y-6'>
					<div className='space-y-2'>
						<label
							htmlFor='description'
							className='text-sm font-medium text-white/80'
						>
							Appearance Description
						</label>
						<textarea
							id='description'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='e.g., "A young woman with long, silver hair, wearing futuristic cyberpunk attire, standing in a neon-lit city of Tokyo..."'
							className='w-full h-40 bg-white/5 p-4 rounded-lg border border-white/10 focus:ring-2 focus:ring-teal-500 focus:outline-none transition'
							rows={5}
						/>
					</div>
					<button
						onClick={handleGenerate}
						disabled={isGenerating || !description}
						className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 rounded-lg font-semibold text-base hover:bg-teal-700 transition-colors disabled:bg-white/10 disabled:cursor-not-allowed'
					>
						{isGenerating ? (
							"Generating..."
						) : (
							<>
								<Sparkles className='w-5 h-5' />
								Generate Avatar
							</>
						)}
					</button>
				</div>
				<div className='flex flex-col items-center justify-center bg-white/5 p-6 rounded-2xl border border-white/10 aspect-square'>
					{isGenerating ? (
						<div className='flex flex-col items-center justify-center text-white/60'>
							<Sparkles className='w-12 h-12 animate-spin' />
							<p className='mt-4'>Generating your persona...</p>
						</div>
					) : (
						<img
							src={avatarUrl}
							alt='Generated Avatar'
							className='w-full h-full object-cover rounded-lg'
						/>
					)}
				</div>
			</div>

			<div className='flex items-center justify-between pt-12'>
				<button
					onClick={onBack}
					className='px-6 py-2 text-white/60 hover:text-white transition-colors'
				>
					Back
				</button>
				<button
					onClick={handleSubmit}
					disabled={avatarUrl.includes("placeholder")}
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Next <ArrowRight className='w-4 h-4 ml-2 inline' />
				</button>
			</div>
		</>
	);
};

export default Step2AvatarGeneration;
