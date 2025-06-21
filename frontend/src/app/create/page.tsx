"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import Step1ChooseType, {
	InfluencerType,
} from "@/components/creation-flow/Step1_ChooseType";
import Step2DefineIdentity from "@/components/creation-flow/Step2_DefineIdentity";
import Step3SetSchedule from "@/components/creation-flow/Step3_SetSchedule";

const WizardStep = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		initial={{ opacity: 0, x: 50 }}
		animate={{ opacity: 1, x: 0 }}
		exit={{ opacity: 0, x: -50 }}
		transition={{ duration: 0.5, ease: "easeInOut" }}
		className='w-full'
	>
		{children}
	</motion.div>
);

const CreateInfluencerPage = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);

	// Form state
	const [influencerType, setInfluencerType] = useState<InfluencerType | null>(
		null
	);
	const [persona, setPersona] = useState("");
	const [avatar, setAvatar] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [scheduleData, setScheduleData] = useState(null);

	const handleNext = () => setStep((s) => s + 1);
	const handleBack = () => setStep((s) => s - 1);

	const handleSelectType = (type: InfluencerType) => {
		setInfluencerType(type);
		handleNext();
	};

	const handleGenerateAvatar = () => {
		setIsGenerating(true);
		// Simulate API call
		setTimeout(() => {
			// In a real app, this would be a URL from a generation service
			const seed = new Date().getTime();
			setAvatar(
				`https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=transparent`
			);
			setIsGenerating(false);
		}, 1500);
	};

	const handleSubmit = (finalScheduleData: any) => {
		setScheduleData(finalScheduleData);
		console.log({
			influencerType,
			persona,
			avatar,
			schedule: finalScheduleData,
		});
		router.push("/");
	};

	return (
		<div className='min-h-screen w-full bg-[#111111] text-white flex items-center justify-center p-8 overflow-hidden'>
			<div className='absolute inset-0 -z-10 h-full w-full bg-[#111111] bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:32px_32px]'></div>
			<div className='absolute inset-0 -z-20 h-full w-full bg-gradient-to-tr from-black via-transparent to-purple-900/50 opacity-60'></div>

			<div className='w-full max-w-2xl'>
				<AnimatePresence mode='wait'>
					{step === 1 && (
						<WizardStep key='step1'>
							<Step1ChooseType onSelectType={handleSelectType} />
						</WizardStep>
					)}
					{step === 2 && influencerType === "lifestyle" && (
						<WizardStep key='step2'>
							<Step2DefineIdentity
								persona={persona}
								setPersona={setPersona}
								avatar={avatar}
								isGenerating={isGenerating}
								onGenerateAvatar={handleGenerateAvatar}
								onBack={handleBack}
								onNext={handleNext}
							/>
						</WizardStep>
					)}
					{step === 3 && influencerType === "lifestyle" && (
						<WizardStep key='step3'>
							<Step3SetSchedule
								onBack={handleBack}
								onSubmit={handleSubmit}
							/>
						</WizardStep>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default CreateInfluencerPage;
