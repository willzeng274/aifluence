"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import "simplebar-react/dist/simplebar.min.css";
import Step1ChooseType, {
	InfluencerType,
} from "@/components/creation-flow/Step1_ChooseType";
import Step2DefineIdentity from "@/components/creation-flow/Step2_DefineIdentity";
import Step2AvatarGeneration from "@/components/creation-flow/Step2_AvatarGeneration";
import Step3SetSchedule from "@/components/creation-flow/Step3SetSchedule";
import Step3CompanySchedule from "@/components/creation-flow/Step3_CompanySchedule";

const WizardStep = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		initial={{ opacity: 0, x: 50 }}
		animate={{ opacity: 1, x: 0 }}
		exit={{ opacity: 0, x: -50 }}
		transition={{ duration: 0.3, ease: "easeInOut" }}
		className='w-full'
	>
		{children}
	</motion.div>
);

type FormData = {
	influencerType?: InfluencerType;
	identity?: any;
	avatar?: { description: string; avatarUrl: string };
	schedule?: any;
};

const CreateInfluencerPage = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({});

	const handleNext = () => setStep((prev) => prev + 1);
	const handleBack = () => setStep((prev) => prev - 1);

	const handleSelectType = (type: InfluencerType) => {
		setFormData({ ...formData, influencerType: type });
		handleNext();
	};

	const handleDefineIdentity = (data: any) => {
		setFormData({ ...formData, identity: data });
		handleNext();
	};

	const handleAvatarSubmit = (data: {
		description: string;
		avatarUrl: string;
	}) => {
		setFormData({ ...formData, avatar: data });
		handleNext();
	};

	const handleSubmit = (data: any) => {
		const finalData = { ...formData, schedule: data };
		setFormData(finalData);
		console.log("Final Influencer Data:", finalData);
		handleNext();
	};

	const influencerType = formData.influencerType;

	return (
		<div className='min-h-screen w-full bg-[#111111] text-white flex items-center justify-center p-8 overflow-hidden'>
			<div className='absolute inset-0 -z-10 h-full w-full bg-[#111111] bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:32px_32px]'></div>
			<div className='absolute inset-0 -z-20 h-full w-full bg-gradient-to-tr from-black via-transparent to-purple-900/50 opacity-60'></div>

			<div className='w-full max-w-3xl'>
				<AnimatePresence mode='wait'>
					{step === 1 && (
						<WizardStep key='step1'>
							<Step1ChooseType onSelectType={handleSelectType} />
						</WizardStep>
					)}
					{step === 2 && influencerType && (
						<WizardStep key='step2'>
							<Step2DefineIdentity
								influencerType={influencerType}
								onBack={handleBack}
								onSubmit={handleDefineIdentity}
							/>
						</WizardStep>
					)}
					{step === 3 && (
						<WizardStep key='step3-avatar'>
							<Step2AvatarGeneration
								onBack={handleBack}
								onSubmit={handleAvatarSubmit}
							/>
						</WizardStep>
					)}
					{step === 4 && influencerType === "lifestyle" && (
						<WizardStep key='step4-lifestyle-schedule'>
							<Step3SetSchedule
								influencerType={influencerType}
								onBack={handleBack}
								onSubmit={handleSubmit}
							/>
						</WizardStep>
					)}
					{step === 4 && influencerType === "company" && (
						<WizardStep key='step4-company-schedule'>
							<Step3CompanySchedule
								onBack={handleBack}
								onSubmit={handleSubmit}
							/>
						</WizardStep>
					)}
					{step === 5 && (
						<WizardStep key='step5'>
							<div className='text-center'>
								<h1 className='text-3xl font-bold'>
									Setup Complete!
								</h1>
								<p className='text-white/50 mt-4'>
									Your new influencer has been created.
								</p>
								<button
									onClick={() => router.push("/")}
									className='mt-8 px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
								>
									Back to Home
								</button>
							</div>
						</WizardStep>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default CreateInfluencerPage;
