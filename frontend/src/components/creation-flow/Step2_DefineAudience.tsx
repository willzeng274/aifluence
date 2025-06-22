import React, { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

type AudienceGender = "all" | "male" | "female" | "other";
type AudienceRegion =
	| "North America"
	| "Europe"
	| "Asia"
	| "South America"
	| "Africa"
	| "Australia"
	| "Other";

interface Step2DefineAudienceProps {
	name: string;
	tone: string;
	background_info: string;
	onBack: () => void;
	onSubmit: (data: {
		goals: string[];
		audience_age_range: [number, number];
		audience_gender: AudienceGender;
		audience_interests: string[];
		audience_region: AudienceRegion;
	}) => void;
}

const Step2DefineAudience: React.FC<Step2DefineAudienceProps> = ({
	name,
	tone,
	background_info,
	onBack,
	onSubmit,
}) => {
	const [goals, setGoals] = useState("");
	const [audienceAgeMin, setAudienceAgeMin] = useState(18);
	const [audienceAgeMax, setAudienceAgeMax] = useState(35);
	const [audienceGender, setAudienceGender] = useState<AudienceGender>("all");
	const [audienceInterests, setAudienceInterests] = useState("");
	const [audienceRegion, setAudienceRegion] =
		useState<AudienceRegion>("North America");

	const [isGenerating, setIsGenerating] = useState(true);

	useEffect(() => {
		const handleGenerateSuggestions = async () => {
			setIsGenerating(true);
			try {
				const response = await fetch(
					"/api/generate-audience-suggestions",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name, tone, background_info }),
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					console.error("Failed to fetch suggestions:", errorData);
					alert(
						`Error: ${
							errorData.error || "Could not generate suggestions."
						}`
					);
					return;
				}

				const data = await response.json();
				setGoals(data.goals?.join(", ") || "");
				setAudienceAgeMin(data.audience_age_range?.[0] || 18);
				setAudienceAgeMax(data.audience_age_range?.[1] || 35);
				setAudienceGender(data.audience_gender || "all");
				setAudienceInterests(data.audience_interests?.join(", ") || "");
				setAudienceRegion(data.audience_region || "North America");
			} catch (error) {
				console.error("Error calling suggestion API:", error);
				alert("An unexpected error occurred. Please try again.");
			} finally {
				setIsGenerating(false);
			}
		};

		handleGenerateSuggestions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, tone, background_info]);

	const handleSubmit = () => {
		onSubmit({
			goals: goals.split(",").map((g) => g.trim()),
			audience_age_range: [audienceAgeMin, audienceAgeMax],
			audience_gender: audienceGender,
			audience_interests: audienceInterests
				.split(",")
				.map((i) => i.trim()),
			audience_region: audienceRegion,
		});
	};

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Define Goals & Audience
				</h1>
				<p className='text-white/50 mt-2'>
					{isGenerating
						? "Generating suggestions based on your profile..."
						: "Review and adjust the AI-generated suggestions below."}
				</p>
			</div>

			<div className='space-y-6 max-h-[60vh] overflow-y-auto pr-4'>
				{isGenerating && (
					<div className='flex items-center justify-center gap-2 p-4 bg-white/5 rounded-lg'>
						<Loader2 className='w-4 h-4 animate-spin' />
						<span className='text-white/70'>
							Generating suggestions...
						</span>
					</div>
				)}

				<fieldset disabled={isGenerating} className='space-y-6'>
					<div>
						<label
							htmlFor='goals'
							className='block text-sm font-medium text-white/70 mb-2'
						>
							Goals (comma-separated)
						</label>
						<input
							type='text'
							id='goals'
							value={goals}
							onChange={(e) => setGoals(e.target.value)}
							className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
							placeholder='e.g., Build community, Promote sustainability'
							required
						/>
					</div>

					<fieldset>
						<legend className='block text-sm font-medium text-white/70 mb-2'>
							Target Audience
						</legend>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<div>
								<label
									htmlFor='audienceAgeMin'
									className='block text-xs font-medium text-white/50 mb-1'
								>
									Age Range (Min)
								</label>
								<input
									type='number'
									id='audienceAgeMin'
									value={audienceAgeMin}
									onChange={(e) =>
										setAudienceAgeMin(
											parseInt(e.target.value)
										)
									}
									className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
								/>
							</div>
							<div>
								<label
									htmlFor='audienceAgeMax'
									className='block text-xs font-medium text-white/50 mb-1'
								>
									Age Range (Max)
								</label>
								<input
									type='number'
									id='audienceAgeMax'
									value={audienceAgeMax}
									onChange={(e) =>
										setAudienceAgeMax(
											parseInt(e.target.value)
										)
									}
									className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
								/>
							</div>
							<div>
								<label
									htmlFor='audienceGender'
									className='block text-xs font-medium text-white/50 mb-1'
								>
									Gender
								</label>
								<select
									id='audienceGender'
									value={audienceGender}
									onChange={(e) =>
										setAudienceGender(
											e.target.value as AudienceGender
										)
									}
									className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
								>
									<option value='all'>All</option>
									<option value='male'>Male</option>
									<option value='female'>Female</option>
									<option value='other'>Other</option>
								</select>
							</div>
							<div>
								<label
									htmlFor='audienceRegion'
									className='block text-xs font-medium text-white/50 mb-1'
								>
									Region
								</label>
								<select
									id='audienceRegion'
									value={audienceRegion}
									onChange={(e) =>
										setAudienceRegion(
											e.target.value as AudienceRegion
										)
									}
									className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
								>
									<option value='North America'>
										North America
									</option>
									<option value='Europe'>Europe</option>
									<option value='Asia'>Asia</option>
									<option value='South America'>
										South America
									</option>
									<option value='Africa'>Africa</option>
									<option value='Australia'>Australia</option>
									<option value='Other'>Other</option>
								</select>
							</div>
						</div>
					</fieldset>
					<div>
						<label
							htmlFor='audienceInterests'
							className='block text-sm font-medium text-white/70 mb-2'
						>
							Audience Interests (comma-separated)
						</label>
						<input
							type='text'
							id='audienceInterests'
							value={audienceInterests}
							onChange={(e) =>
								setAudienceInterests(e.target.value)
							}
							className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
							placeholder='e.g., Hiking, AI, Indie Music'
							required
						/>
					</div>
				</fieldset>
			</div>

			<div className='flex items-center justify-between pt-8'>
				<button
					onClick={onBack}
					className='px-6 py-2 text-white/60 hover:text-white transition-colors'
				>
					Back
				</button>
				<button
					onClick={handleSubmit}
					disabled={isGenerating}
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50'
				>
					Next
				</button>
			</div>
		</>
	);
};

export default Step2DefineAudience;
