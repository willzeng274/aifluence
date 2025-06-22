import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { generateCompanyScheduleForMonth } from "@/constants/schedules";
import { InfluencerType } from "./Step1_ChooseType";
import ScheduleCalendar, { Schedule } from "../shared/ScheduleCalendar";

interface Step3SetScheduleProps {
	influencerType: InfluencerType;
	onBack: () => void;
	onSubmit: (scheduleData: any) => void;
}

const Step3SetSchedule: React.FC<Step3SetScheduleProps> = ({
	onBack,
	onSubmit,
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
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Confirm Influencer Schedule
				</h1>
				<p className='text-white/50 mt-2'>
					This is the preset content schedule for your Lifestyle
					Influencer.
				</p>
			</div>

			<div className='flex gap-8 items-start'>
				<div className='space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10'>
					<h2 className='text-lg font-bold'>Preset Schedule</h2>
					<p className='text-white/70'>
						Your Lifestyle Influencer comes with a pre-configured
						schedule optimized for persona development. It
						establishes a regular cadence without overwhelming the
						audience.
					</p>
					<div className='flex flex-wrap gap-x-4 gap-y-2 pt-4 text-xs'>
						<div className='flex items-center gap-2'>
							<div className='w-3 h-3 rounded-full bg-teal-500'></div>
							Post
						</div>
						<div className='flex items-center gap-2'>
							<div className='w-3 h-3 rounded-full bg-orange-500'></div>
							Story
						</div>
						<div className='flex items-center gap-2'>
							<div className='w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-orange-500'></div>
							Both
						</div>
					</div>
				</div>

				<div className='lg:col-span-1'>
					<ScheduleCalendar schedule={scheduledDays} />
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
					onClick={handleSubmit}
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
				>
					Finish Setup
				</button>
			</div>
		</>
	);
};

export default Step3SetSchedule;
