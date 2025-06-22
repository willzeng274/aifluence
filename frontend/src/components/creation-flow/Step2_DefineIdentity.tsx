import React, { useState } from "react";
import { InfluencerType } from "./Step1_ChooseType";

type Tone = "energetic" | "casual" | "professional";
type AudienceGender = "all" | "male" | "female" | "other";
type AudienceRegion =
	| "North America"
	| "Europe"
	| "Asia"
	| "South America"
	| "Africa"
	| "Australia"
	| "Other";

interface Step2DefineIdentityProps {
	influencerType: InfluencerType;
	onBack: () => void;
	onSubmit: (data: {
		name: string;
		background_info: string;
		goals: string[];
		tone: Tone;
		audience_age_range: [number, number];
		audience_gender: AudienceGender;
		audience_interests: string[];
		audience_region: AudienceRegion;
	}) => void;
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
	const [name, setName] = useState("");
	const [background_info, setBackgroundInfo] = useState("");
	const [goals, setGoals] = useState("");
	const [tone, setTone] = useState<Tone>("casual");
	const [audienceAgeMin, setAudienceAgeMin] = useState(18);
	const [audienceAgeMax, setAudienceAgeMax] = useState(35);
	const [audienceGender, setAudienceGender] = useState<AudienceGender>("all");
	const [audienceInterests, setAudienceInterests] = useState("");
	const [audienceRegion, setAudienceRegion] =
		useState<AudienceRegion>("North America");

	const handleSubmit = () => {
		onSubmit({
			name,
			background_info,
			goals: goals.split(",").map((g) => g.trim()),
			tone,
			audience_age_range: [audienceAgeMin, audienceAgeMax],
			audience_gender: audienceGender,
			audience_interests: audienceInterests
				.split(",")
				.map((i) => i.trim()),
			audience_region: audienceRegion,
		});
	};

	const content = {
		lifestyle: {
			title: "Define Their Identity",
			subtitle: "Give your persona a core script and a unique face.",
		},
		company: {
			title: "Define Brand Voice",
			subtitle:
				"Establish the brand's core messaging and visual identity.",
		},
	};
	const currentContent = content[influencerType];

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					{currentContent.title}
				</h1>
				<p className='text-white/50 mt-2'>{currentContent.subtitle}</p>
			</div>

			<div className='space-y-6 max-h-[60vh] overflow-y-auto pr-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-white/70 mb-2'
						>
							Name
						</label>
						<input
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
							placeholder={
								influencerType === "lifestyle"
									? "e.g., Alex 'Zen' Miller"
									: "e.g., EcoVibe"
							}
							required
						/>
					</div>
					<div>
						<label
							htmlFor='tone'
							className='block text-sm font-medium text-white/70 mb-2'
						>
							Tone
						</label>
						<select
							id='tone'
							value={tone}
							onChange={(e) => setTone(e.target.value as Tone)}
							className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
						>
							<option value='energetic'>Energetic</option>
							<option value='casual'>Casual</option>
							<option value='professional'>Professional</option>
						</select>
					</div>
				</div>

				<div>
					<label
						htmlFor='background_info'
						className='block text-sm font-medium text-white/70 mb-2'
					>
						{influencerType === "lifestyle"
							? "Persona Script"
							: "Brand Voice & Mission"}
					</label>
					<textarea
						id='background_info'
						value={background_info}
						onChange={(e) => setBackgroundInfo(e.target.value)}
						className='w-full h-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
						placeholder={
							influencerType === "lifestyle"
								? "e.g., A 6'2 nonchalant dreadhead that smashes snow bunnies in SF..."
								: "e.g., We create eco-friendly products to empower a sustainable future..."
						}
						required
					/>
				</div>

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
									setAudienceAgeMin(parseInt(e.target.value))
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
									setAudienceAgeMax(parseInt(e.target.value))
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
						onChange={(e) => setAudienceInterests(e.target.value)}
						className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50'
						placeholder='e.g., Hiking, AI, Indie Music'
						required
					/>
				</div>
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
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
				>
					Next
				</button>
			</div>
		</>
	);
};

export default Step2DefineIdentity;
