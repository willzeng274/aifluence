import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Clock, FileText, Image as ImageIcon, PlusCircle } from "lucide-react";

export interface ScheduledItem {
	type: "post" | "story" | "reel";
	time: string;
	description: string;
}

export interface Schedule {
	[date: string]: ScheduledItem[];
}

interface ScheduleCalendarProps {
	schedule: Schedule;
	showDetailsPanel?: boolean;
	onAddPost?: (date: Date) => void;
	onClickDay?: (date: Date) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
	schedule,
	showDetailsPanel = true,
	onAddPost,
	onClickDay,
}) => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [activeMonth, setActiveMonth] = useState(new Date());

	const today = new Date();
	const oneYearFromNow = new Date(
		today.getFullYear() + 1,
		today.getMonth(),
		today.getDate()
	);

	const selectedDateKey = selectedDate
		? selectedDate.toISOString().split("T")[0]
		: null;
	const scheduleForSelectedDay: ScheduledItem[] =
		selectedDateKey && schedule[selectedDateKey]
			? schedule[selectedDateKey]
			: [];

	return (
		<div className='flex flex-col gap-6 items-start'>
			<div
				className={`custom-calendar-container ${
					!showDetailsPanel ? "md:col-span-2" : ""
				}`}
			>
				<Calendar
					value={selectedDate}
					onClickDay={(value) => {
						setSelectedDate(value);
						if (onClickDay) {
							onClickDay(value);
						}
					}}
					onActiveStartDateChange={({ activeStartDate }) =>
						setActiveMonth(activeStartDate || new Date())
					}
					activeStartDate={activeMonth}
					minDate={today}
					maxDate={oneYearFromNow}
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
							const dateKey = date.toISOString().split("T")[0];
							const daySchedule = schedule[dateKey];
							if (daySchedule && daySchedule.length > 0) {
								console.log(daySchedule);
								const hasPost = daySchedule.some(
									(item) =>
										item.type === "reel" ||
										item.type === "post"
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
				<style>{`
                    .custom-calendar-container .react-calendar {
                        background-color: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 1rem;
                        padding: 0.75rem;
                        font-family: inherit;
                        width: 100%;
                    }

                    .react-calendar__navigation button {
                        color: white !important;
                        min-width: 44px;
                        font-size: 1rem;
                        font-weight: bold;
                        background: transparent !important;
                        border: none !important;
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    .react-calendar__navigation button:hover,
                    .react-calendar__navigation button:focus,
                    .react-calendar__navigation button:active {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    .react-calendar__navigation button:disabled {
                        background-color: transparent !important;
                        color: rgba(255, 255, 255, 0.3) !important;
                    }
                    
                    .react-calendar__navigation button:disabled:hover {
                        background-color: transparent !important;
                    }
                    
                    .react-calendar__navigation__label {
                        font-weight: bold !important;
                        color: white !important;
                        background: transparent !important;
                    }
                    
                    .react-calendar__navigation__label:hover,
                    .react-calendar__navigation__label:focus {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                        outline: none !important;
                    }

                    .react-calendar__navigation__arrow {
                        background: transparent !important;
                    }
                    
                    .react-calendar__navigation__arrow:hover,
                    .react-calendar__navigation__arrow:focus {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                    }
                    
                    .react-calendar__month-view__weekdays {
                        font-size: 0.75rem;
                        font-weight: 600;
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
                        background: transparent !important;
                        border: none !important;
                        outline: none !important;
                    }
                    
                    .react-calendar__tile:hover,
                    .react-calendar__tile:focus {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        outline: none !important;
                    }
                    
                    .react-calendar__tile--active-custom,
                    .react-calendar__tile--active-custom:hover,
                    .react-calendar__tile--active-custom:focus {
                        background-color: rgba(56, 189, 179, 0.3) !important;
                    }
                    
                    .react-calendar__tile--now {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                    }
                    
                    .react-calendar__tile--now:hover,
                    .react-calendar__tile--now:focus {
                        background-color: rgba(255, 255, 255, 0.15) !important;
                    }
                    
                    .react-calendar__month-view__days__day--neighboringMonth {
                        color: rgba(255, 255, 255, 0.3);
                    }
                    
                    .react-calendar__tile:disabled {
                        background-color: transparent !important;
                        color: rgba(255, 255, 255, 0.2) !important;
                        cursor: default;
                    }
                    
                    .react-calendar__tile:disabled:hover,
                    .react-calendar__tile:disabled:focus {
                        background-color: transparent !important;
                    }
                `}</style>
			</div>
			{showDetailsPanel && (
				<div className='bg-black/20 p-4 rounded-xl min-h-[220px] w-full'>
					<div className='flex justify-between items-center mb-3'>
						<h4 className='font-bold text-base'>
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
						{selectedDate && onAddPost && (
							<button
								onClick={() => onAddPost(selectedDate)}
								className='flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors'
							>
								<PlusCircle className='w-4 h-4' />
								Add Post
							</button>
						)}
					</div>
					{selectedDate ? (
						scheduleForSelectedDay.length > 0 ? (
							<ul className='space-y-3'>
								{scheduleForSelectedDay.map(
									(item: ScheduledItem, index: number) => (
										<li
											key={index}
											className='flex items-start text-sm'
										>
											<Clock
												className='w-4 h-4 mr-3 mt-0.5 text-white/50 shrink-0'
												aria-hidden='true'
											/>
											<div className='flex-grow'>
												<div className='flex justify-between items-center'>
													<span className='font-bold text-white/80'>
														{item.time}
													</span>
													{item.type === "post" ? (
														<div className='flex items-center gap-2 text-teal-400 text-xs'>
															<FileText className='w-3 h-3' />
															Post
														</div>
													) : item.type === "reel" ? (
														<div className='flex items-center gap-2 text-teal-400 text-xs'>
															<FileText className='w-3 h-3' />
															Reel
														</div>
													) : (
														<div className='flex items-center gap-2 text-orange-400 text-xs'>
															<ImageIcon className='w-3 h-3' />
															Story
														</div>
													)}
												</div>
												<p className='text-white/60 mt-1'>
													{item.description}
												</p>
											</div>
										</li>
									)
								)}
							</ul>
						) : (
							<div className='text-center text-white/50 pt-10 text-sm'>
								No scheduled events.
							</div>
						)
					) : (
						<div className='text-center text-white/50 pt-10 text-sm'>
							Click on a calendar day.
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ScheduleCalendar;
