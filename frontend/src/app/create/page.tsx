"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import "simplebar-react/dist/simplebar.min.css";
import Step1ChooseType, {
	InfluencerType,
} from "@/components/creation-flow/Step1_ChooseType";
import Step2DefineIdentity from "@/components/creation-flow/Step2_DefineIdentity";
import Step2DefineAudience from "@/components/creation-flow/Step2_DefineAudience";
import Step2AvatarGeneration from "@/components/creation-flow/Step2_AvatarGeneration";
import Step3SetSchedule from "@/components/creation-flow/Step3SetSchedule";
import Step3CompanySchedule from "@/components/creation-flow/Step3_CompanySchedule";
import Step3GrowthAndSocials from "@/components/creation-flow/Step3_GrowthAndSocials";

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

type FormData = {
	mode: InfluencerType;
	name: string;
	face_image_url: string;
	background_info: string;
	goals: string[];
	tone: Tone;
	audience_age_range: [number, number];
	audience_gender: AudienceGender;
	audience_interests: string[];
	audience_region: AudienceRegion;
	growth_phase_enabled: boolean;
	growth_intensity: number;
	instagram_username?: string;
	instagram_password?: string;
	schedule: any;
};

const CreateInfluencerPage = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<Partial<FormData>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNext = () => setStep((prev) => prev + 1);
	const handleBack = () => setStep((prev) => prev - 1);

	const handleSelectType = (type: InfluencerType) => {
		setFormData({ ...formData, mode: type });
		handleNext();
	};

	const handleDefineIdentity = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleDefineAudience = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleAvatarSubmit = (data: {
		description: string;
		avatarUrl: string;
	}) => {
		setFormData({ ...formData, face_image_url: data.avatarUrl });
		handleNext();
	};

	const handleGrowthAndSocialsSubmit = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleSubmit = async (data: any) => {
		setIsSubmitting(true);
		try {
			const finalData = { ...formData, schedule: data };
			setFormData(finalData);

			// Prepare payload for API based on documentation
			const { schedule, ...apiPayloadBase } = finalData;
			const apiPayload: any = { ...apiPayloadBase };

			// TODO: This is a temporary fix to handle the company schedule. Modify backend to handle this.
			apiPayload.posting_frequency = {
				story_interval_hours: schedule.storyFrequencyHours,
				reel_interval_hours: schedule.postFrequencyHours,
			};

			console.log("Sending payload to API:", apiPayload);

			const response = await fetch(
				"http://localhost:8000/sorcerer/init",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(apiPayload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("API Error:", errorData);
				alert(
					`Error creating influencer: ${
						errorData.detail || "An unknown error occurred."
					}`
				);
				return;
			}

			const responseData = await response.json();
			console.log("API Success:", responseData);

			// On success, proceed to the final "Setup Complete!" screen
			handleNext();
		} catch (error) {
			console.error("Failed to connect to API server.", error);
			alert(
				"Failed to connect to the API server. Please ensure it's running and accessible."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const mode = formData.mode;

	return (
		<div className='min-h-screen w-full bg-[#111111] text-white flex items-center justify-center overflow-hidden'>
			<div className='absolute inset-0 -z-10 h-full w-full bg-[#111111] bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:32px_32px]'></div>
			<div className='absolute inset-0 -z-20 h-full w-full bg-gradient-to-tr from-black via-transparent to-purple-900/50 opacity-60'></div>

			{isSubmitting && (
				<div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
					<svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<h2 className="text-2xl font-bold text-white">Launching Your Influencer...</h2>
					<p className="text-white/70 mt-2">Please wait a moment, we're setting things up.</p>
				</div>
			)}

			<div className='w-full max-w-3xl'>
				<AnimatePresence mode='wait'>
					{step === 1 && (
						<WizardStep key='step1'>
							<Step1ChooseType onSelectType={handleSelectType} />
						</WizardStep>
					)}
					{step === 2 && mode && (
						<WizardStep key='step2'>
							<Step2DefineIdentity
								influencerType={mode}
								onBack={handleBack}
								onSubmit={handleDefineIdentity}
							/>
						</WizardStep>
					)}
					{step === 3 && mode && (
						<WizardStep key='step3-audience'>
							<Step2DefineAudience
								name={formData.name || ""}
								tone={formData.tone || "casual"}
								background_info={formData.background_info || ""}
								onBack={handleBack}
								onSubmit={handleDefineAudience}
							/>
						</WizardStep>
					)}
					{step === 4 && (
						<WizardStep key='step4-avatar'>
							<Step2AvatarGeneration
								onBack={handleBack}
								onSubmit={handleAvatarSubmit}
								formData={formData}
							/>
						</WizardStep>
					)}
					{step === 5 && (
						<WizardStep key='step5-growth'>
							<Step3GrowthAndSocials
								onBack={handleBack}
								onSubmit={handleGrowthAndSocialsSubmit}
							/>
						</WizardStep>
					)}
					{step === 6 && mode === "lifestyle" && (
						<WizardStep key='step6-lifestyle-schedule'>
							<Step3SetSchedule
								influencerType={mode}
								onBack={handleBack}
								onSubmit={handleSubmit}
								isSubmitting={isSubmitting}
							/>
						</WizardStep>
					)}
					{step === 6 && mode === "company" && (
						<WizardStep key='step6-company-schedule'>
							<Step3CompanySchedule
								onBack={handleBack}
								onSubmit={handleSubmit}
							/>
						</WizardStep>
					)}
					{step === 7 && (
						<WizardStep key='step7'>
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
