import React, { useEffect, useState } from "react";
import { User, Sparkles, Loader2 } from "lucide-react";
import { InfluencerType } from "./Step1_ChooseType";

interface Step2DefineIdentityProps {
	influencerType: InfluencerType;
	onBack: () => void;
	onSubmit: (data: { coreScript: string; avatarSeed: string }) => void;
}

const suggestionTags = [
	"Fitness Guru",
	"Tech Reviewer",
	"Food Blogger",
	"Travel Vlogger",
];

const Step2DefineIdentity: React.FC<Step2DefineIdentityProps> = ({
	influencerType,
	onBack,
	onSubmit,
}) => {
	const [coreScript, setCoreScript] = useState("");
	const [avatarSeed, setAvatarSeed] = useState("default-seed");
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerateAvatar = () => {
		const seed = Math.random().toString(36).substring(7);
		setAvatarSeed(seed);
	};

	const handleSuggestionClick = async (topic: string) => {
		setIsGenerating(true);
		try {
			const response = await fetch("/api/generate-prompt", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ topic }),
			});
			if (response.ok) {
				const data = await response.json();
				setCoreScript(data.prompt);
			} else {
				console.error("Failed to generate suggestion");
			}
		} catch (error) {
			console.error("Error calling suggestion API:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmit = () => {
		onSubmit({ coreScript, avatarSeed });
	};

	const content = {
		lifestyle: {
			title: "Define Their Identity",
			subtitle: "Give your persona a core script and a unique face.",
			personaLabel: "Persona Script",
			personaPlaceholder:
				"e.g., A 6'2 nonchalant dreadhead that smashes snow bunnies in SF...",
		},
		company: {
			title: "Define Brand Voice",
			subtitle:
				"Establish the brand's core messaging and visual identity.",
			personaLabel: "Brand Voice & Mission",
			personaPlaceholder:
				"e.g., We create eco-friendly products to empower a sustainable future...",
		},
	};
	const currentContent = content[influencerType];
	const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}&backgroundColor=transparent`;

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					{currentContent.title}
				</h1>
				<p className='text-white/50 mt-2'>{currentContent.subtitle}</p>
			</div>

			<div className='space-y-8'>
				<div>
					<label
						htmlFor='persona'
						className='block text-sm font-medium text-white/70 mb-2'
					>
						{currentContent.personaLabel}
					</label>
					<div className='mb-4'>
						<p className='text-sm text-white/50 mb-2'>
							Need inspiration? Try one of these ideas:
						</p>
						<div className='flex flex-wrap gap-2'>
							{suggestionTags.map((tag) => (
								<button
									key={tag}
									onClick={() => handleSuggestionClick(tag)}
									disabled={isGenerating}
									className='flex items-center gap-2 px-3 py-1 bg-white/10 text-xs rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-wait'
								>
									{isGenerating ? (
										<Loader2 className='w-3 h-3 animate-spin' />
									) : (
										<Sparkles className='w-3 h-3 text-teal-400' />
									)}
									{tag}
								</button>
							))}
						</div>
					</div>
					<textarea
						id='persona'
						value={coreScript}
						onChange={(e) => setCoreScript(e.target.value)}
						className='w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all duration-300'
						placeholder={currentContent.personaPlaceholder}
						required
					/>
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
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
				>
					Next
				</button>
			</div>
		</>
	);
};

export default Step2DefineIdentity;
