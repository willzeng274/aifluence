import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Target, Users, Globe, TrendingUp } from "lucide-react";

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
		<div className='relative h-screen max-h-screen overflow-x-hidden flex flex-col'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />

			<div className='relative z-10 flex-1 flex flex-col p-8'>
				<div className='mb-8'>
					<div className='flex items-baseline gap-4 mb-4'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Strategic Planning</span>
					</div>

					<h1 className='text-5xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-white/90'>TARGET YOUR</span>
						<br />
						<span className='text-white/60'>INFLUENCE VECTOR</span>
					</h1>

					<div className='flex items-center gap-6 mt-4'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-xs uppercase tracking-wider'>
							{isGenerating
								? "Analyzing profile parameters"
								: "Refine AI recommendations"}
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				{isGenerating && (
					<div className='mb-8 relative group'>
						<div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse' />
						<div className='relative border border-white/20 p-6'>
							<div className='flex items-center justify-center gap-4'>
								<div className='relative'>
									<div className='absolute inset-0 bg-white/5 blur-xl scale-150' />
									<Loader2 className='relative w-6 h-6 animate-spin text-white/60' />
								</div>
								<span className='text-white/60 uppercase tracking-wider'>
									Generating optimal parameters...
								</span>
							</div>
						</div>
					</div>
				)}

				<div className='flex-1 min-h-0 overflow-y-auto pr-4 mb-6'>
					<fieldset disabled={isGenerating} className='space-y-8'>
						<div className='relative group'>
							<div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
							<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
								<div className='flex items-center gap-3 mb-4'>
									<Target className='w-5 h-5 text-purple-400' />
									<label className='text-xs font-medium text-white/50 uppercase tracking-wider'>
										Mission Objectives
									</label>
								</div>
								<input
									type='text'
									id='goals'
									value={goals}
									onChange={(e) => setGoals(e.target.value)}
									className='w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/10 placeholder-white/30 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
									placeholder='e.g., Build community, Promote sustainability'
									required
								/>
							</div>
						</div>

						<div className='relative group'>
							<div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
							<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
								<div className='flex items-center gap-3 mb-6'>
									<Users className='w-5 h-5 text-blue-400' />
									<legend className='text-xs font-medium text-white/50 uppercase tracking-wider'>
										Audience Demographics
									</legend>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
									<div className='space-y-2'>
										<label className='block text-xs font-medium text-white/40'>
											Min Age
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
											className='w-full px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/10 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
										/>
									</div>
									<div className='space-y-2'>
										<label className='block text-xs font-medium text-white/40'>
											Max Age
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
											className='w-full px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/10 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
										/>
									</div>
									<div className='space-y-2'>
										<label className='block text-xs font-medium text-white/40'>
											Gender Focus
										</label>
										<select
											id='audienceGender'
											value={audienceGender}
											onChange={(e) =>
												setAudienceGender(
													e.target.value as AudienceGender
												)
											}
											className='w-full px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/10 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
										>
											<option value='all'>All</option>
											<option value='male'>Male</option>
											<option value='female'>Female</option>
											<option value='other'>Other</option>
										</select>
									</div>
									<div className='space-y-2'>
										<label className='block text-xs font-medium text-white/40'>
											Primary Region
										</label>
										<select
											id='audienceRegion'
											value={audienceRegion}
											onChange={(e) =>
												setAudienceRegion(
													e.target.value as AudienceRegion
												)
											}
											className='w-full px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/10 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
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
							</div>
						</div>

						<div className='relative group'>
							<div className='absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
							<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
								<div className='flex items-center gap-3 mb-4'>
									<TrendingUp className='w-5 h-5 text-teal-400' />
									<label className='text-xs font-medium text-white/50 uppercase tracking-wider'>
										Interest Vectors
									</label>
								</div>
								<input
									type='text'
									id='audienceInterests'
									value={audienceInterests}
									onChange={(e) =>
										setAudienceInterests(e.target.value)
									}
									className='w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/10 placeholder-white/30 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
									placeholder='e.g., Hiking, AI, Indie Music'
									required
								/>
							</div>
						</div>
					</fieldset>
				</div>

				<div className='mt-auto'>
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
							disabled={isGenerating}
							className='group flex items-center gap-3 relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 to-teal-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-white/20 bg-black/50 backdrop-blur-sm group-hover:border-white/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Continue</span>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step2DefineAudience;
