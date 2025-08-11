import React, { useState } from "react";
import { InfluencerType } from "./Step1_ChooseType";
import { User, Mic, FileText } from "lucide-react";

type Tone = "energetic" | "casual" | "professional";

interface Step2DefineIdentityProps {
	influencerType: InfluencerType;
	onBack: () => void;
	onSubmit: (data: {
		name: string;
		background_info: string;
		tone: Tone;
	}) => void;
}

const Step2DefineIdentity: React.FC<Step2DefineIdentityProps> = ({
	influencerType,
	onBack,
	onSubmit,
}) => {
	const [name, setName] = useState("");
	const [background_info, setBackgroundInfo] = useState("");
	const [tone, setTone] = useState<Tone>("casual");

	const handleSubmit = () => {
		onSubmit({
			name,
			background_info,
			tone,
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
		<div className='relative h-screen max-h-screen overflow-x-hidden flex flex-col'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />

			<div className='relative z-10 flex-1 flex flex-col p-8'>
				<div className='mb-8'>
					<div className='flex items-baseline gap-4 mb-4'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Identity Matrix</span>
					</div>

					<h1 className='text-5xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-white/90'>FORGE YOUR</span>
						<br />
						<span className='text-white/60'>{influencerType === "lifestyle" ? "DIGITAL PERSONA" : "BRAND ESSENCE"}</span>
					</h1>

					<div className='flex items-center gap-6 mt-4'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-xs uppercase tracking-wider'>
							{currentContent.subtitle}
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				<div className='flex-1 min-h-0 overflow-y-auto pr-4 space-y-6 mb-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div className='relative group'>
							<div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
							<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
								<div className='flex items-center gap-3 mb-4'>
									<User className='w-5 h-5 text-purple-400' />
									<label className='text-xs font-medium text-white/50 uppercase tracking-wider'>
										Identity Designation
									</label>
								</div>
								<input
									type='text'
									id='name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/10 placeholder-white/30 text-white focus:border-white/30 focus:outline-none transition-all duration-300'
									placeholder={
										influencerType === "lifestyle"
											? "e.g., Alex 'Zen' Miller"
											: "e.g., EcoVibe"
									}
									autoComplete="off"
									required
								/>
							</div>
						</div>

						<div className='relative group'>
							<div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
							<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
								<div className='flex items-center gap-3 mb-4'>
									<Mic className='w-5 h-5 text-blue-400' />
									<label className='text-xs font-medium text-white/50 uppercase tracking-wider'>
										Voice Modulation
									</label>
								</div>
								<select
									id='tone'
									value={tone}
									onChange={(e) => setTone(e.target.value as Tone)}
									className='w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/10 text-white focus:border-white/30 focus:outline-none transition-all duration-300 cursor-pointer'
								>
									<option value='energetic' className='bg-black'>Energetic</option>
									<option value='casual' className='bg-black'>Casual</option>
									<option value='professional' className='bg-black'>Professional</option>
								</select>
							</div>
						</div>
					</div>

					<div className='relative group'>
						<div className='absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative border border-white/10 p-6 group-hover:border-white/30 transition-colors duration-500'>
							<div className='flex items-center gap-3 mb-6'>
								<FileText className='w-5 h-5 text-teal-400' />
								<label className='text-xs font-medium text-white/50 uppercase tracking-wider'>
									{influencerType === "lifestyle"
										? "Core Narrative Protocol"
										: "Brand Manifesto"}
								</label>
							</div>
							<div className='relative'>
								<div className='absolute top-4 right-4 text-8xl font-black text-white/5'>02</div>
								<textarea
									id='background_info'
									value={background_info}
									onChange={(e) => setBackgroundInfo(e.target.value)}
									className='relative w-full h-48 px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/10 placeholder-white/30 text-white focus:border-white/30 focus:outline-none transition-all duration-300 resize-none'
									placeholder={
										influencerType === "lifestyle"
											? "e.g., Fitness coach influencer selling 30-day transformation programs and branded supplements..."
											: "e.g., We create eco-friendly products to empower a sustainable future..."
									}
									required
								/>
							</div>
						</div>
					</div>
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
							className='group flex items-center gap-3 relative overflow-hidden'
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

export default Step2DefineIdentity;
