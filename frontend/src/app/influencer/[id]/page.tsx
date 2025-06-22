"use client";

import { influencers } from "@/constants/influencers";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import StatsChart from "@/components/StatsChart";
import EngagementGrid from "@/components/EngagementGrid";
import "react-calendar/dist/Calendar.css";
import ScheduleCalendar, {
	Schedule,
} from "@/components/shared/ScheduleCalendar";

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
		<path d='m15 18-6-6 6-6' />
	</svg>
);

const InfluencerProfilePage = () => {
	const params = useParams();
	const router = useRouter();
	const [influencer, setInfluencer] = useState<
		((typeof influencers)[0] & { schedule?: Schedule }) | null
	>(null);

	useEffect(() => {
		const influencerId = params.id;
		const foundInfluencer = influencers.find(
			(inf) => inf.id.toString() === influencerId
		);
		if (foundInfluencer) {
			setInfluencer(foundInfluencer);
		}
	}, [params.id]);

	if (!influencer) {
		return (
			<div className='w-screen h-screen bg-[#111111] flex items-center justify-center text-white'>
				<p>Loading...</p>
			</div>
		);
	}

	const scheduledDays = (influencer.schedule || {}) as Schedule;

	return (
		<div className='min-h-screen bg-[#111111] text-white font-sans animate-page-enter'>
			<div className='absolute inset-0 z-0'>
				<Image
					src={influencer.image}
					alt={influencer.name}
					layout='fill'
					className='object-cover opacity-10 blur-2xl scale-125'
				/>
				<div className='absolute inset-0 bg-gradient-to-b from-black/30 via-black/80 to-[#111111]'></div>
			</div>

			<main className='relative z-10 p-8 md:p-12'>
				<header className='flex items-center justify-between mb-12 animate-fade-in-down'>
					<button
						onClick={() => router.back()}
						className='p-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 text-sm'
					>
						<ChevronLeftIcon className='w-5 h-5' />
						Back to Selection
					</button>
					<p className='px-3 py-1 bg-white/10 rounded-full text-sm font-medium'>
						{influencer.category}
					</p>
				</header>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column - Profile */}
					<div className='lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-right'>
						<div className='relative w-48 h-48 mb-6 rounded-full overflow-hidden shadow-2xl'>
							<Image
								src={influencer.image}
								alt={influencer.name}
								fill
								className='object-cover'
							/>
						</div>
						<h1 className='text-4xl md:text-5xl font-bold tracking-tighter'>
							{influencer.name}
						</h1>
						<p className='text-lg text-white/60 mt-1'>
							{influencer.handle}
						</p>
						<p className='text-white/80 leading-relaxed mt-4 max-w-sm'>
							{influencer.bio}
						</p>
						<button className='mt-6 w-full max-w-xs py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'>
							Send Message
						</button>
					</div>

					{/* Right Column - Stats */}
					<div className='lg:col-span-2 flex flex-col gap-8 animate-fade-in-left'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='bg-white/5 p-6 rounded-2xl'>
								<h3 className='text-sm text-white/50 uppercase tracking-widest mb-2'>
									Followers
								</h3>
								<p className='text-4xl font-bold'>
									{influencer.followers}
								</p>
							</div>
							<div className='bg-white/5 p-6 rounded-2xl'>
								<h3 className='text-sm text-white/50 uppercase tracking-widest mb-2 flex justify-between items-baseline'>
									<span>Engagement</span>
									<span className='text-xl font-bold text-white'>
										{influencer.engagement}
									</span>
								</h3>
								<EngagementGrid
									engagement={influencer.engagement}
								/>
							</div>
						</div>

						<div className='bg-white/5 p-6 rounded-2xl'>
							<h3 className='text-sm text-white/50 uppercase tracking-widest mb-4'>
								Follower Growth (6 Months)
							</h3>
							<StatsChart data={influencer.followerHistory} />
						</div>

						{/* --- Schedule Section --- */}
						<div className='bg-white/5 p-6 rounded-2xl md:col-span-2'>
							<h3 className='text-sm text-white/50 uppercase tracking-widest mb-4'>
								Content Schedule
							</h3>
							<ScheduleCalendar schedule={scheduledDays} />
						</div>
					</div>
				</div>
			</main>

			<style jsx>{`
				@keyframes page-enter {
					from {
						opacity: 0;
						transform: translateX(50px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				.animate-page-enter {
					animation: page-enter 0.6s
						cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
				}

				@keyframes fade-in-down {
					from {
						opacity: 0;
						transform: translateY(-20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes fade-in-right {
					from {
						opacity: 0;
						transform: translateX(-20px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				@keyframes fade-in-left {
					from {
						opacity: 0;
						transform: translateX(20px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				.animate-fade-in-down {
					animation: fade-in-down 0.6s 0.3s ease-out forwards;
					opacity: 0;
				}
				.animate-fade-in-right {
					animation: fade-in-right 0.6s 0.5s ease-out forwards;
					opacity: 0;
				}
				.animate-fade-in-left {
					animation: fade-in-left 0.6s 0.7s ease-out forwards;
					opacity: 0;
				}
			`}</style>
		</div>
	);
};

export default InfluencerProfilePage;
