import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Helper to generate a schedule based on settings
const generateSchedule = (
	date: Date,
	postsPerWeek: number,
	storiesPerWeek: number,
	randomness: number
) => {
	const schedule: Record<string, string[]> = {};
	const year = date.getFullYear();
	const month = date.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const totalPosts = Math.round((daysInMonth / 7) * postsPerWeek);
	const totalStories = Math.round((daysInMonth / 7) * storiesPerWeek);

	const placeItems = (count: number, type: string) => {
		let availableDays = Array.from(
			{ length: daysInMonth },
			(_, i) => i + 1
		);
		for (let i = 0; i < count; i++) {
			if (availableDays.length === 0) break;

			const randomFactor = 1 - Math.pow(1 - randomness, 2);
			const dayIndex = Math.floor(
				Math.random() *
					availableDays.length *
					(randomness > 0.1 ? randomFactor : 1)
			);
			const day = availableDays.splice(dayIndex, 1)[0];
			if (!day) continue;

			const dateKey = new Date(year, month, day)
				.toISOString()
				.split("T")[0];
			if (!schedule[dateKey]) schedule[dateKey] = [];
			if (!schedule[dateKey].includes(type)) {
				schedule[dateKey].push(type);
			}
		}
	};

	placeItems(totalPosts, "post");
	placeItems(totalStories, "story");

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

interface Step3SetScheduleProps {
	onBack: () => void;
	onSubmit: (scheduleData: any) => void;
}

const Step3SetSchedule: React.FC<Step3SetScheduleProps> = ({
	onBack,
	onSubmit,
}) => {
	const [month, setMonth] = useState(new Date());
	const [postsPerWeek, setPostsPerWeek] = useState(3);
	const [storiesPerWeek, setStoriesPerWeek] = useState(5);
	const [randomness, setRandomness] = useState(0.5);

	const [scheduledDays, setScheduledDays] = useState<
		Record<string, string[]>
	>({});

	useEffect(() => {
		const newSchedule = generateSchedule(
			month,
			postsPerWeek,
			storiesPerWeek,
			randomness
		);
		setScheduledDays(newSchedule);
	}, [month, postsPerWeek, storiesPerWeek, randomness]);

	const handleSubmit = () => {
		onSubmit({
			postsPerWeek,
			storiesPerWeek,
			randomness,
			schedule: scheduledDays,
		});
	};

	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Set the Schedule
				</h1>
				<p className='text-white/50 mt-2'>
					Define the content rhythm and growth strategy in real-time.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
				<div className='space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10'>
					<CustomSlider
						label='Posts per week'
						value={postsPerWeek}
						setValue={setPostsPerWeek}
						min={0}
						max={7}
					/>
					<CustomSlider
						label='Stories per week'
						value={storiesPerWeek}
						setValue={setStoriesPerWeek}
						min={0}
						max={21}
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

				<div className='custom-calendar-container'>
					<Calendar
						value={month}
						showNavigation={false}
						tileContent={({ date, view }) => {
							if (view === "month") {
								const dateKey = date
									.toISOString()
									.split("T")[0];
								const daySchedule = scheduledDays[dateKey];
								if (daySchedule) {
									const isPost = daySchedule.includes("post");
									const isStory =
										daySchedule.includes("story");
									let dotClass = "";
									if (isPost && isStory) {
										dotClass =
											"bg-gradient-to-r from-teal-500 to-orange-500";
									} else if (isPost) {
										dotClass = "bg-teal-500";
									} else if (isStory) {
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

export default Step3SetSchedule;
