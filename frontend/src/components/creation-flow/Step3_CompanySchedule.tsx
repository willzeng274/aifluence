import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import ScheduleCalendar, {
	Schedule as ScheduleData,
	ScheduledItem as ScheduleItem,
} from "../shared/ScheduleCalendar";
import { Clock, FileText, Image } from "lucide-react";

interface ScheduledItem {
	type: "post" | "story";
	time: string; // e.g., "2:30 PM"
}

// Helper to generate a schedule based on settings
const generateSchedule = (
	date: Date,
	postFrequencyHours: number,
	storyFrequencyHours: number
): ScheduleData => {
	const schedule: ScheduleData = {};
	const year = date.getFullYear();
	const month = date.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const placeItems = (frequencyHours: number, type: "post" | "story") => {
		if (frequencyHours <= 0) return;

		const totalHoursInMonth = daysInMonth * 24;
		let currentHour = Math.random() * frequencyHours; // Start at a random point in the first interval

		while (currentHour < totalHoursInMonth) {
			let hourToPost = currentHour;

			if (hourToPost >= 0 && hourToPost < totalHoursInMonth) {
				const dayOfMonth = Math.floor(hourToPost / 24) + 1;
				const hourOfDay = Math.floor(hourToPost % 24);
				const minute = Math.floor(Math.random() * 60);

				const dateKey = new Date(year, month, dayOfMonth)
					.toISOString()
					.split("T")[0];

				const eventTime = new Date(
					year,
					month,
					dayOfMonth,
					hourOfDay,
					minute
				);
				const timeString = eventTime.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});

				if (!schedule[dateKey]) schedule[dateKey] = [];
				schedule[dateKey].push({
					type,
					time: timeString,
					description: `AI-generated ${type} based on your settings.`,
				});
			}

			currentHour += frequencyHours;
		}
	};

	placeItems(postFrequencyHours, "post");
	placeItems(storyFrequencyHours, "story");

	// Sort items by time for each day
	for (const day in schedule) {
		schedule[day].sort(
			(a, b) =>
				new Date(`1/1/1970 ${a.time}`).getTime() -
				new Date(`1/1/1970 ${b.time}`).getTime()
		);
	}

	return schedule;
};

const CustomSlider = ({
	label,
	value,
	setValue,
	min,
	max,
	step = 1,
}: {
	label: string;
	value: number;
	setValue: (n: number) => void;
	min: number;
	max: number;
	step?: number;
}) => (
	<div>
		<label className='flex justify-between text-sm font-medium text-white/70 mb-2'>
			<span>{label}</span>
			<span className='text-white/90 font-bold'>{value}</span>
		</label>
		<input
			type='range'
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={(e) => setValue(parseFloat(e.target.value))}
			className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500'
		/>
	</div>
);

interface Step3CompanyScheduleProps {
	onBack: () => void;
	onSubmit: (scheduleData: any) => void;
}

const Step3CompanySchedule: React.FC<Step3CompanyScheduleProps> = ({
	onBack,
	onSubmit,
}) => {
	const [startMonth] = useState(new Date());
	const [postFrequencyHours, setPostFrequencyHours] = useState(24);
	const [storyFrequencyHours, setStoryFrequencyHours] = useState(8);

	const [scheduledDays, setScheduledDays] = useState<ScheduleData>({});

	useEffect(() => {
		const combinedSchedule: ScheduleData = {};
		for (let i = 0; i < 12; i++) {
			const targetDate = new Date(
				startMonth.getFullYear(),
				startMonth.getMonth() + i,
				1
			);
			const monthSchedule = generateSchedule(
				targetDate,
				postFrequencyHours,
				storyFrequencyHours
			);
			Object.assign(combinedSchedule, monthSchedule);
		}
		setScheduledDays(combinedSchedule);
	}, [startMonth, postFrequencyHours, storyFrequencyHours]);

	const handleSubmit = () => {
		onSubmit({
			postFrequencyHours,
			storyFrequencyHours,
			schedule: scheduledDays,
		});
	};

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Set Brand Schedule
				</h1>
				<p className='text-white/50 mt-2'>
					Define the sponsored content rhythm for your brand
					ambassador.
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
				<div className='space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10'>
					<CustomSlider
						label='Post every X hours'
						value={postFrequencyHours}
						setValue={setPostFrequencyHours}
						min={8}
						max={168}
					/>
					<CustomSlider
						label='Story every X hours'
						value={storyFrequencyHours}
						setValue={setStoryFrequencyHours}
						min={1}
						max={48}
					/>

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

export default Step3CompanySchedule;
