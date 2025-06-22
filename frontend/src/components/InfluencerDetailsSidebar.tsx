import React from "react";
import Image from "next/image";
import ScheduleCalendar from "./shared/ScheduleCalendar";

type Influencer = {
	id: number;
	name: string;
	handle: string;
	followers: string;
	category: string;
	image: string;
	verified: boolean;
	engagement: string;
	bio: string;
	followerHistory: { month: string; followers: number }[];
	schedule?: Record<string, { type: string; time: string; description: string }[]>;
};

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
							src={influencer.image}
							alt={influencer.name}
							fill
							className='object-cover rounded-full'
						/>
					</div>
					{influencer.verified && (
						<div className='absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-[#111111]'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='3'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M20 6 9 17l-5-5'></path>
							</svg>
						</div>
					)}
				</div>
				<h3 className='text-2xl font-bold tracking-tight'>
					{influencer.name}
				</h3>
				<p className='text-white/50 text-sm'>{influencer.handle}</p>
				<div className='my-5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium'>
					{influencer.category}
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
						About
					</h4>
					<p className='text-white/60 text-sm leading-relaxed line-clamp-4'>
						{influencer.bio}
					</p>
				</div>

				{/* Schedule Calendar */}
				{influencer.schedule ? (
					<div className="mt-6 w-full">
						<ScheduleCalendar
							schedule={
								Object.fromEntries(
									Object.entries(influencer.schedule ?? {}).map(([date, items]) => [
										date,
										items.map(item => ({
											...item,
											type: item.type as "post" | "story",
										})),
									])
								)
							}
						/>
					</div>
				) : (
					<div className="mt-6 w-full text-white/50 text-sm text-center">
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
