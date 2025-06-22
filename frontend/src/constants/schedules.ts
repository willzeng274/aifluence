export interface ScheduledItem {
	type: "post" | "story";
	time: string; // e.g., "2:30 PM"
}

// Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export const companyWeeklySchedule: Record<number, ScheduledItem[]> = {
	1: [
		{ type: "post", time: "9:15 AM" },
		{ type: "story", time: "12:00 PM" },
		{ type: "story", time: "6:30 PM" },
	], // Monday
	3: [
		{ type: "post", time: "11:00 AM" },
		{ type: "story", time: "2:00 PM" },
		{ type: "story", time: "8:00 PM" },
	], // Wednesday
	5: [
		{ type: "post", time: "10:00 AM" },
		{ type: "story", time: "1:00 PM" },
		{ type: "story", time: "7:45 PM" },
	], // Friday
	6: [{ type: "story", time: "3:00 PM" }], // Saturday
};

export const generateCompanyScheduleForMonth = (
	date: Date
): Record<string, ScheduledItem[]> => {
	const schedule: Record<string, ScheduledItem[]> = {};
	const year = date.getFullYear();
	const month = date.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	for (let day = 1; day <= daysInMonth; day++) {
		const currentDate = new Date(year, month, day);
		const dayOfWeek = currentDate.getDay();

		if (companyWeeklySchedule[dayOfWeek]) {
			const dateKey = currentDate.toISOString().split("T")[0];
			schedule[dateKey] = companyWeeklySchedule[dayOfWeek];
		}
	}

	return schedule;
};
