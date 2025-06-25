import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { generateCompanyScheduleForMonth } from "@/constants/schedules";
import { InfluencerType } from "./Step1_ChooseType";
import ScheduleCalendar, { Schedule } from "../shared/ScheduleCalendar";

interface Step3SetScheduleProps {
	influencerType: InfluencerType;
	onBack: () => void;
	onSubmit: (scheduleData: any) => void;
	isSubmitting: boolean;
}

const Step3SetSchedule: React.FC<Step3SetScheduleProps> = ({
	onBack,
	onSubmit,
	isSubmitting,
}) => {
	const [month] = useState(new Date());
	const [scheduledDays, setScheduledDays] = useState<Schedule>({});

	useEffect(() => {
		const newSchedule = generateCompanyScheduleForMonth(month);
		setScheduledDays(newSchedule);
	}, [month]);

	const handleSubmit = () => {
		onSubmit({
			schedulePreset: "company-default",
			schedule: scheduledDays,
		});
	};


	return (
		<div className='relative min-h-screen overflow-y-auto overflow-x-hidden'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />
			
			<div className='relative z-10 p-8'>
				<div className='mb-6'>
					<div className='flex items-baseline gap-4 mb-3'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Finalize</span>
					</div>
					
					<h1 className='text-4xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-white/90'>CONFIRM</span>
						<br />
						<span className='text-white/60'>CONTENT CADENCE</span>
					</h1>
					
					<div className='flex items-center gap-6 mt-3'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-xs uppercase tracking-wider'>
							Preset lifestyle schedule
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
					<div className='border border-white/10 p-6'>
						<h3 className='text-lg font-semibold mb-4'>
							Preset Schedule
						</h3>
						<p className='text-sm text-white/70 mb-4'>
							Your Lifestyle Influencer comes with a pre-configured
							schedule optimized for persona development.
						</p>
						
						<div className='space-y-3'>
							<div>
								<p className='text-xs font-medium text-white/50 mb-1'>✓ Benefit</p>
								<p className='text-sm text-white/70 pl-4'>Establishes regular cadence</p>
							</div>
							<div>
								<p className='text-xs font-medium text-white/50 mb-1'>✓ Strategy</p>
								<p className='text-sm text-white/70 pl-4'>Avoids audience fatigue</p>
							</div>
						</div>

						<div className='mt-6 pt-4 border-t border-white/10'>
							<p className='text-sm font-medium text-white/70 mb-3'>
								Legend
							</p>
							<div className='flex flex-wrap gap-4'>
								<div className='flex items-center gap-2'>
									<div className='w-3 h-3 rounded-full bg-teal-500' />
									<span className='text-sm text-white/60'>Post</span>
								</div>
								<div className='flex items-center gap-2'>
									<div className='w-3 h-3 rounded-full bg-orange-500' />
									<span className='text-sm text-white/60'>Story</span>
								</div>
								<div className='flex items-center gap-2'>
									<div className='w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-orange-500' />
									<span className='text-sm text-white/60'>Both</span>
								</div>
							</div>
						</div>
					</div>

					<div className='border border-white/10 p-6'>
						<h3 className='text-lg font-semibold mb-6'>
							Calendar Preview
						</h3>
						<ScheduleCalendar 
							schedule={scheduledDays} 
							showDetailsPanel={true}
						/>
					</div>
				</div>

				<div className='mt-6'>
					<div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4' />
					
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
							disabled={isSubmitting}
							className='group flex items-center gap-3 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 to-teal-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-white/20 bg-black/50 backdrop-blur-sm group-hover:border-white/40 transition-all duration-300 flex items-center gap-2'>
								{isSubmitting && (
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								)}
								<span className='font-semibold uppercase tracking-wider text-sm'>
									{isSubmitting ? "Launching..." : "Launch Influencer"}
								</span>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step3SetSchedule;