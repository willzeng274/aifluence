import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Clock, FileText, Image } from "lucide-react";
import {
	generateCompanyScheduleForMonth,
	ScheduledItem,
} from "@/constants/schedules";
import { InfluencerType } from "./Step1_ChooseType";

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
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [scheduledDays, setScheduledDays] = useState<
		Record<string, ScheduledItem[]>
	>({});

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
					Confirm Influencer Schedule
				</h1>
				<p className='text-white/50 mt-2'>
					This is the preset content schedule for your Lifestyle
					Influencer.
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
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

export default Step3SetSchedule;
