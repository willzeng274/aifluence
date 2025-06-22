import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Step3GrowthAndSocialsProps {
	onBack: () => void;
	onSubmit: (data: {
		growth_phase_enabled: boolean;
		growth_intensity: number;
		instagram_username?: string;
		instagram_password?: string;
	}) => void;
}

const Step3GrowthAndSocials: React.FC<Step3GrowthAndSocialsProps> = ({
	onBack,
	onSubmit,
}) => {
	const [growth_phase_enabled, setGrowthPhaseEnabled] = useState(true);
	const [growth_intensity, setGrowthIntensity] = useState(0.5);
	const [instagram_username, setInstagramUsername] = useState("");
	const [instagram_password, setInstagramPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = () => {
		onSubmit({
			growth_phase_enabled,
			growth_intensity,
			instagram_username,
			instagram_password,
		});
	};

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Setup Growth & Socials
				</h1>
				<p className='text-white/50 mt-2'>
					Configure automated growth settings and link social
					accounts.
				</p>
			</div>

			<div className='space-y-8 max-h-[60vh] overflow-y-auto pr-4'>
				<fieldset className='space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10'>
					<legend className='text-lg font-bold text-white -ml-2 px-2'>
						Growth Settings
					</legend>
					<div className='flex items-center justify-between'>
						<label
							htmlFor='growth_phase_enabled'
							className='font-medium text-white/90'
						>
							Enable Automated Growth Phase
						</label>
						<button
							onClick={() =>
								setGrowthPhaseEnabled(!growth_phase_enabled)
							}
							className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
								growth_phase_enabled
									? "bg-teal-600"
									: "bg-gray-600"
							}`}
						>
							<span
								className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
									growth_phase_enabled
										? "translate-x-5"
										: "translate-x-0"
								}`}
							/>
						</button>
					</div>
					{growth_phase_enabled && (
						<div>
							<label
								htmlFor='growth_intensity'
								className='block text-sm font-medium text-white/70 mb-2'
							>
								Growth Intensity: {growth_intensity.toFixed(2)}
							</label>
							<input
								id='growth_intensity'
								type='range'
								min='0'
								max='1'
								step='0.05'
								value={growth_intensity}
								onChange={(e) =>
									setGrowthIntensity(
										parseFloat(e.target.value)
									)
								}
								className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500'
							/>
						</div>
					)}
				</fieldset>

				<fieldset className='space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10'>
					<legend className='text-lg font-bold text-white -ml-2 px-2'>
						Social Accounts (Optional)
					</legend>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label
								htmlFor='instagram_username'
								className='block text-sm font-medium text-white/70 mb-2'
							>
								Instagram Username
							</label>
							<input
								type='text'
								id='instagram_username'
								value={instagram_username}
								onChange={(e) =>
									setInstagramUsername(e.target.value)
								}
								className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white'
								placeholder='@username'
							/>
						</div>
						<div className='relative'>
							<label
								htmlFor='instagram_password'
								className='block text-sm font-medium text-white/70 mb-2'
							>
								Instagram Password
							</label>
							<input
								type={showPassword ? "text" : "password"}
								id='instagram_password'
								value={instagram_password}
								onChange={(e) =>
									setInstagramPassword(e.target.value)
								}
								className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-white/30 text-white'
								placeholder='••••••••'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5'
							>
								{showPassword ? (
									<EyeOff className='h-5 w-5 text-gray-400' />
								) : (
									<Eye className='h-5 w-5 text-gray-400' />
								)}
							</button>
						</div>
					</div>
				</fieldset>
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

export default Step3GrowthAndSocials;
