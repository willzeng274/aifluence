import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Clock, FileText, Image } from "lucide-react";

interface ScheduledItem {
	type: "post" | "story";
	time: string; // e.g., "2:30 PM"
}

// Helper to generate a schedule based on settings
const generateSchedule = (
	date: Date,
	postFrequencyHours: number,
	storyFrequencyHours: number,
	randomness: number
): Record<string, ScheduledItem[]> => {
	const schedule: Record<string, ScheduledItem[]> = {};
	const year = date.getFullYear();
	const month = date.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const placeItems = (frequencyHours: number, type: "post" | "story") => {
		if (frequencyHours <= 0) return;

		const intervalDays = frequencyHours / 24;
		// Start at a random point in the first interval
		let nextDay = 1 + Math.random() * intervalDays;

		while (nextDay <= daysInMonth) {
			let dayToPost = nextDay;

			if (randomness > 0) {
				const maxJitter = (intervalDays / 2) * randomness;
				const jitter = (Math.random() - 0.5) * 2 * maxJitter;
				dayToPost += jitter;
			}

			const roundedDay = Math.round(dayToPost);

			if (roundedDay >= 1 && roundedDay <= daysInMonth) {
				const dateKey = new Date(year, month, roundedDay)
					.toISOString()
					.split("T")[0];

				// Add random time
				const hour = Math.floor(Math.random() * 24);
				const minute = Math.floor(Math.random() * 60);
				const eventTime = new Date(
					year,
					month,
					roundedDay,
					hour,
					minute
				);
				const timeString = eventTime.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});

				if (!schedule[dateKey]) schedule[dateKey] = [];
				schedule[dateKey].push({ type, time: timeString });
			}

			nextDay += intervalDays;
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
	const [month, setMonth] = useState(new Date());
	const [postFrequencyHours, setPostFrequencyHours] = useState(24);
	const [storyFrequencyHours, setStoryFrequencyHours] = useState(8);
	const [randomness, setRandomness] = useState(0.5);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const [scheduledDays, setScheduledDays] = useState<
		Record<string, ScheduledItem[]>
	>({});

	useEffect(() => {
		const newSchedule = generateSchedule(
			month,
			postFrequencyHours,
			storyFrequencyHours,
			randomness
		);
		setScheduledDays(newSchedule);
	}, [month, postFrequencyHours, storyFrequencyHours, randomness]);

	const handleSubmit = () => {
		onSubmit({
			postFrequencyHours,
			storyFrequencyHours,
			randomness,
			schedule: scheduledDays,
		});
	};

	const selectedDateKey = selectedDate
		? selectedDate.toISOString().split("T")[0]
		: null;
	const scheduleForSelectedDay =
		selectedDateKey && scheduledDays[selectedDateKey]
			? scheduledDays[selectedDateKey]
			: [];

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
					<CustomSlider
						label='Randomness (Salt)'
						value={randomness}
						setValue={setRandomness}
						min={0}
						max={1}
						step={0.05}
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

				<div className='space-y-4'>
					<div className='custom-calendar-container'>
						<Calendar
							value={month}
							onClickDay={(value) => setSelectedDate(value)}
							showNavigation={false}
							tileClassName={({ date, view }) => {
								if (view === "month" && selectedDate) {
									if (
										date.toDateString() ===
										selectedDate.toDateString()
									) {
										return "react-calendar__tile--active-custom";
									}
								}
								return null;
							}}
							tileContent={({ date, view }) => {
								if (view === "month") {
									const dateKey = date
										.toISOString()
										.split("T")[0];
									const daySchedule = scheduledDays[dateKey];
									if (daySchedule && daySchedule.length > 0) {
										const hasPost = daySchedule.some(
											(item) => item.type === "post"
										);
										const hasStory = daySchedule.some(
											(item) => item.type === "story"
										);
										let dotClass = "";
										if (hasPost && hasStory) {
											dotClass =
												"bg-gradient-to-r from-teal-500 to-orange-500";
										} else if (hasPost) {
											dotClass = "bg-teal-500";
										} else if (hasStory) {
											dotClass = "bg-orange-500";
										}
										return (
											<div
												className={`h-2 w-2 rounded-full mx-auto mt-1 ${dotClass}`}
											></div>
										);
									}
								}
								return null;
							}}
						/>
					</div>
					<div className='bg-white/5 p-6 rounded-2xl border border-white/10 min-h-[220px]'>
						<h3 className='font-bold text-lg mb-4'>
							{selectedDate
								? `Schedule for ${selectedDate.toLocaleDateString(
										"en-US",
										{
											month: "long",
											day: "numeric",
										}
								  )}`
								: "Select a day to see details"}
						</h3>
						{selectedDate ? (
							scheduleForSelectedDay.length > 0 ? (
								<ul className='space-y-3'>
									{scheduleForSelectedDay.map(
										(item, index) => (
											<li
												key={index}
												className='flex items-center text-sm'
											>
												<Clock
													className='w-4 h-4 mr-3 text-white/50'
													aria-hidden='true'
												/>
												<span className='mr-auto text-white/80'>
													{item.time}
												</span>
												{item.type === "post" ? (
													<div className='flex items-center gap-2 text-teal-400'>
														<FileText className='w-4 h-4' />
														Post
													</div>
												) : (
													<div className='flex items-center gap-2 text-orange-400'>
														<Image className='w-4 h-4' />
														Story
													</div>
												)}
											</li>
										)
									)}
								</ul>
							) : (
								<div className='text-center text-white/50 pt-8'>
									No scheduled events.
								</div>
							)
						) : (
							<div className='text-center text-white/50 pt-8'>
								Click on a calendar day.
							</div>
						)}
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
					onClick={handleSubmit}
					className='px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
				>
					Finish Setup
				</button>
			</div>
			<style>{`
                .custom-calendar-container .react-calendar {
                    background-color: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem; /* rounded-2xl */
                    padding: 0.75rem; /* p-3 */
                    font-family: inherit;
                    width: 100%;
                }
                .react-calendar__navigation { display: none; }
                .react-calendar__month-view__weekdays {
                    font-size: 0.75rem; /* text-xs */
                    font-weight: 600; /* font-semibold */
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                }
                .react-calendar__tile {
                    color: white;
                    border-radius: 9999px;
                    height: 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding-top: 0.25rem;
                    transition: background-color 0.2s;
                }
                .react-calendar__tile:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                .react-calendar__tile--active-custom,
                .react-calendar__tile--active-custom:hover {
                    background-color: rgba(56, 189, 179, 0.3) !important; /* A shade of teal */
                }
                .react-calendar__tile--now {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                 .react-calendar__tile--now:hover {
                    background-color: rgba(255, 255, 255, 0.15);
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    color: rgba(255, 255, 255, 0.3);
                }
            `}</style>
		</>
	);
};

export default Step3CompanySchedule;
