import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import ScheduleCalendar, {
	Schedule as ScheduleData,
} from "../shared/ScheduleCalendar";

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
	<div className='space-y-2'>
		<label className='flex justify-between'>
			<span className='text-sm font-medium text-white/70'>{label}</span>
			<span className='text-sm text-white/70'>{value}</span>
		</label>
		<input
			type='range'
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={(e) => setValue(parseFloat(e.target.value))}
			className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:cursor-pointer'
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
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
		<div className='relative min-h-screen overflow-y-auto overflow-x-hidden'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />
			
			<div className='relative z-10 p-8'>
				<div className='mb-6'>
					<div className='flex items-baseline gap-4 mb-3'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Configure</span>
					</div>
					
					<h1 className='text-4xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-white/90'>CUSTOMIZE YOUR</span>
						<br />
						<span className='text-white/60'>POSTING SCHEDULE</span>
					</h1>
					
					<div className='flex items-center gap-6 mt-3'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-xs uppercase tracking-wider'>
							Set your content frequency
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
					<div className='space-y-6'>
						<div className='border border-white/10 p-6'>
							<h3 className='text-lg font-semibold mb-6'>
								Schedule Settings
							</h3>
							<div className='space-y-6'>
								<CustomSlider
									label='Post Frequency (Hours)'
									value={postFrequencyHours}
									setValue={setPostFrequencyHours}
									min={8}
									max={168}
								/>
								<CustomSlider
									label='Story Frequency (Hours)'
									value={storyFrequencyHours}
									setValue={setStoryFrequencyHours}
									min={1}
									max={48}
								/>

								<div className='pt-4 border-t border-white/10'>
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
						</div>

						<div className='border border-white/10 p-6 mt-6'>
							<h4 className='font-bold text-base mb-4'>
								{selectedDate
									? `Schedule for ${selectedDate.toLocaleDateString(
											"en-US",
											{
												month: "long",
												day: "numeric",
											}
									  )}`
									: "Select a day"}
							</h4>
							{selectedDate ? (
								(() => {
									const selectedDateKey = selectedDate.toISOString().split("T")[0];
									const scheduleForSelectedDay = scheduledDays[selectedDateKey] || [];
									return scheduleForSelectedDay.length > 0 ? (
										<ul className='space-y-3 max-h-64 overflow-y-auto'>
											{scheduleForSelectedDay.map((item, index) => (
												<li key={index} className='flex items-start text-sm'>
													<span className='text-white/50 mr-3'>
														{item.time}
													</span>
													<div className='flex-1'>
														<div className='flex items-center gap-2 mb-1'>
															{item.type === "post" ? (
																<span className='text-teal-400 text-xs'>Post</span>
															) : (
																<span className='text-orange-400 text-xs'>Story</span>
															)}
														</div>
														<p className='text-white/60 text-xs'>
															{item.description}
														</p>
													</div>
												</li>
											))}
										</ul>
									) : (
										<div className='text-center text-white/50 pt-10 text-sm'>
											No scheduled events.
										</div>
									);
								})()
							) : (
								<div className='text-center text-white/50 pt-10 text-sm'>
									Click on a calendar day.
								</div>
							)}
						</div>
					</div>

					<div className='border border-white/10 p-6'>
						<h3 className='text-lg font-semibold mb-6'>
							Calendar Preview
						</h3>
						<ScheduleCalendar 
							schedule={scheduledDays} 
							showDetailsPanel={false}
							onClickDay={(date: Date) => setSelectedDate(date)}
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

export default Step3CompanySchedule;