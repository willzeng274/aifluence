import React from "react";
import Image from "next/image";
import ScheduleCalendar from "./shared/ScheduleCalendar";

interface Influencer {
	id: number;
	name: string;
	face_image_url: string;
	persona: {
		background: string;
		goals: string[];
		tone: string;
	};
	mode: string;
	audience_targeting: {
		age_range: [number, number];
		gender: string;
		interests: string[];
		region: string;
	};
	growth_phase_enabled: boolean;
	growth_intensity: number;
	posting_frequency: {
		story_interval_hours: number;
		reel_interval_hours: number;
	} | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	followers?: string;
	engagement?: string;
	videos?: any[]; // Using any to avoid type issues with ScheduleCalendar for now
}

type Props = {
	influencer: Influencer;
	onClose: () => void;
	onConnect: (influencerId: number) => void;
};

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<line x1='18' y1='6' x2='6' y2='18'></line>
		<line x1='6' y1='6' x2='18' y2='18'></line>
	</svg>
);

const InfluencerDetailsSidebar = ({
	influencer,
	onClose,
	onConnect,
}: Props) => {
	const scheduleByDay = (influencer.videos || []).reduce(
		(acc: Record<string, any[]>, video: any) => {
			const date = new Date(video.scheduled_time)
				.toISOString()
				.split("T")[0];
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push({
				type: video.content_type,
				time: new Date(video.scheduled_time).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				description: video.caption,
			});
			return acc;
		},
		{}
	);

	return (
		<aside className='absolute top-0 right-0 h-full w-[380px] bg-black/40 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col p-8 animate-slide-in overflow-y-auto'>
			{/* Header */}
			<div className='flex justify-between items-center mb-8'>
				<h2 className='text-xl font-semibold'>Profile</h2>
				<button
					onClick={onClose}
					className='p-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors'
				>
					<CloseIcon className='w-5 h-5' />
				</button>
			</div>

			{/* Profile Info */}
			<div className='flex-1 flex flex-col items-center text-center'>
				<div className='relative w-28 h-28 mb-4'>
					<div className='w-full h-full rounded-full overflow-hidden'>
						<Image
							src={influencer.face_image_url}
							alt={influencer.name}
							fill
							className='object-cover rounded-full'
						/>
					</div>
				</div>
				<h3 className='text-2xl font-bold tracking-tight'>
					{influencer.name}
				</h3>
				<p className='text-white/50 text-sm'>
					@{influencer.name.toLowerCase().replace(/\\s+/g, "")}
				</p>
				<div className='my-5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium'>
					{influencer.mode}
				</div>

				{/* Stats */}
				<div className='w-full flex justify-around bg-white/5 p-5 rounded-xl'>
					<div className='text-center'>
						<p className='text-xl font-bold'>
							{influencer.followers}
						</p>
						<p className='text-xs text-white/40 uppercase tracking-widest'>
							Followers
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xl font-bold'>
							{influencer.engagement}
						</p>
						<p className='text-xs text-white/40 uppercase tracking-widest'>
							Engagement
						</p>
					</div>
				</div>

				{/* Bio */}
				<div className='text-left w-full mt-6'>
					<h4 className='font-semibold text-sm mb-2 text-white/80'>
						Background
					</h4>
					<p className='text-white/60 text-sm leading-relaxed line-clamp-4'>
						{influencer.persona.background}
					</p>
				</div>

				{/* Goals */}
				<div className='text-left w-full mt-6'>
					<h4 className='font-semibold text-sm mb-2 text-white/80'>
						Goals
					</h4>
					<ul className='text-white/60 text-sm leading-relaxed list-disc list-inside'>
						{influencer.persona.goals.map((goal, index) => (
							<li key={index}>{goal}</li>
						))}
					</ul>
				</div>

				{/* Schedule Calendar */}
				{influencer.videos && influencer.videos.length > 0 ? (
					<div className='mt-6 w-full'>
						<ScheduleCalendar schedule={scheduleByDay} />
					</div>
				) : (
					<div className='mt-6 w-full text-white/50 text-sm text-center'>
						No schedule available.
					</div>
				)}
			</div>

			{/* Footer Button */}
			<button
				onClick={() => onConnect(influencer.id)}
				className='w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
			>
				View Full Profile
			</button>

			<style jsx>{`
				@keyframes slide-in {
					from {
						transform: translateX(100%);
						opacity: 0;
					}
					to {
						transform: translateX(0);
						opacity: 1;
					}
				}
				.animate-slide-in {
					animation: slide-in 0.4s
						cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
				}
			`}</style>
		</aside>
	);
};

export default InfluencerDetailsSidebar;
