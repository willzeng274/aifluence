import React from "react";
import { User } from "lucide-react";

interface EngagementGridProps {
	engagement: string;
}

const EngagementGrid: React.FC<EngagementGridProps> = ({ engagement }) => {
	const engagementValue = parseFloat(engagement.replace("%", ""));
	const filledCount = Math.round(engagementValue);
	const totalCount = 50;

	return (
		<div className='grid grid-cols-10 gap-0.5'>
			{Array.from({ length: totalCount }).map((_, i) => {
				const isFilled = i < filledCount / (100 / 50);
				return (
					<div
						key={i}
						className={`
                            size-4 aspect-square rounded-md flex items-center justify-center
                            transition-colors duration-300
                        `}
					>
						<User
							className={`size-4 transition-colors ${
								isFilled ? "text-orange-500" : "text-white/30"
							}`}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default EngagementGrid;
