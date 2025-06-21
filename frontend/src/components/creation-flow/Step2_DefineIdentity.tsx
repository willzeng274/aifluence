import React from "react";
import { User, Sparkles } from "lucide-react";

interface Step2DefineIdentityProps {
	persona: string;
	setPersona: (value: string) => void;
	avatar: string;
	isGenerating: boolean;
	onGenerateAvatar: () => void;
	onBack: () => void;
	onNext: () => void;
}

const Step2DefineIdentity: React.FC<Step2DefineIdentityProps> = ({
	persona,
	setPersona,
	avatar,
	isGenerating,
	onGenerateAvatar,
	onBack,
	onNext,
}) => {
	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Define Their Identity
				</h1>
				<p className='text-white/50 mt-2'>
					Give your persona a core script and a unique face.
				</p>
			</div>

			<div className='space-y-8'>
				<div>
					<label
						htmlFor='persona'
						className='block text-sm font-medium text-white/70 mb-2'
					>
						Persona Script
					</label>
					<textarea
						id='persona'
						value={persona}
						onChange={(e) => setPersona(e.target.value)}
						className='w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300'
						placeholder="e.g., A 6'2 nonchalant dreadhead that smashes snow bunnies in SF..."
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-white/70 mb-2'>
						Generate Face
					</label>
					<div className='flex items-center gap-6'>
						<div className='w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center'>
							{avatar ? (
								<img
									src={avatar}
									alt='Generated Avatar'
									className='w-full h-full rounded-full object-cover'
								/>
							) : (
								<User className='w-10 h-10 text-white/30' />
							)}
						</div>
						<button
							type='button'
							onClick={onGenerateAvatar}
							disabled={isGenerating}
							className='px-6 py-2 border border-white/20 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
						>
							{isGenerating ? "Generating..." : "Generate Avatar"}
							{!isGenerating && <Sparkles className='w-4 h-4' />}
						</button>
					</div>
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
					onClick={onNext}
					className='px-8 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
				>
					Next
				</button>
			</div>
		</>
	);
};

export default Step2DefineIdentity;
