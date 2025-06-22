"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import StatsChart from "@/components/StatsChart";
import EngagementGrid from "@/components/EngagementGrid";
import "react-calendar/dist/Calendar.css";
import ScheduleCalendar, {
	Schedule,
} from "@/components/shared/ScheduleCalendar";
import AddSponsoredPostModal from "@/components/modals/AddSponsoredPostModal";

// Define video and influencer types based on API response
interface Video {
	video_id: number;
	schedule_id: number;
	scheduled_time: string;
	content_type: "story" | "reel";
	status: string;
	caption: string;
	hashtags: string[];
	is_active: boolean;
	has_sponsor: boolean;
}

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
	videos?: Video[];
	followers?: string;
	engagement?: string;
}

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
	const [influencer, setInfluencer] = useState<Influencer | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDateForPost, setSelectedDateForPost] = useState<Date | null>(
		null
	);

	const fetchInfluencerData = useCallback(async () => {
		const influencerId = params.id;
		if (!influencerId) return;

		try {
			const influencerRes = await fetch(
				`http://localhost:8000/influencer/${influencerId}`
			);
			if (!influencerRes.ok) {
				console.error("Failed to fetch influencer");
				setInfluencer(null);
				return;
			}
			const influencerData: Influencer = await influencerRes.json();

			const videoRes = await fetch(
				`http://localhost:8000/influencer/${influencerId}/videos`
			);
			let videos: Video[] = [];
			if (videoRes.ok) {
				const videoData = await videoRes.json();
				if (videoData.videos && videoData.videos.length > 0) {
					videos = videoData.videos;
				}
			}

			const fullInfluencerData: Influencer = {
				...influencerData,
				videos,
				followers: `${(Math.random() * 5).toFixed(1)}M`,
				engagement: `${(Math.random() * 5).toFixed(2)}%`,
			};

			setInfluencer(fullInfluencerData);
		} catch (error) {
			console.error("Error fetching influencer data:", error);
			setInfluencer(null);
		}
	}, [params.id]);

	useEffect(() => {
		fetchInfluencerData();
	}, [fetchInfluencerData]);

	const handleAddPost = (date: Date) => {
		setSelectedDateForPost(date);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedDateForPost(null);
	};

	const handleScheduleSubmit = async (postData: any) => {
		if (!influencer) return;

		const payload = {
			...postData,
			video_params: {
				...postData.video_params,
				influencer_id: influencer.id,
			},
		};

		try {
			const response = await fetch("http://localhost:8000/schedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				alert("Post scheduled successfully!");
				handleCloseModal();
				// Refresh data to show the new post
				await fetchInfluencerData();
			} else {
				const error = await response.json();
				alert(
					`Failed to schedule post: ${
						error.detail || "Unknown error"
					}`
				);
			}
		} catch (error) {
			console.error("Error scheduling post:", error);
			alert("An error occurred while scheduling the post.");
		}
	};

	if (!influencer) {
		return (
			<div className='w-screen h-screen bg-[#111111] flex items-center justify-center text-white'>
				<p>Loading...</p>
			</div>
		);
	}

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
		<div className='min-h-screen bg-[#111111] text-white font-sans animate-page-enter overflow-auto'>
			<div className='absolute inset-0 z-0'>
				<Image
					src={influencer.face_image_url}
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
						{influencer.mode}
					</p>
				</header>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column - Profile */}
					<div className='lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-right'>
						<div className='relative w-48 h-48 mb-6 rounded-full overflow-hidden shadow-2xl'>
							<Image
								src={influencer.face_image_url}
								alt={influencer.name}
								fill
								className='object-cover'
							/>
						</div>
						<h1 className='text-4xl md:text-5xl font-bold tracking-tighter'>
							{influencer.name}
						</h1>
						<p className='text-lg text-white/60 mt-1'>
							@
							{influencer.name.toLowerCase().replace(/\\s+/g, "")}
						</p>
						<p className='text-white/80 leading-relaxed mt-4 max-w-sm'>
							{influencer.persona.background}
						</p>
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
									{influencer.engagement && (
										<span className='text-xl font-bold text-white'>
											{influencer.engagement}
										</span>
									)}
								</h3>
								{influencer.engagement && (
									<EngagementGrid
										engagement={influencer.engagement}
									/>
								)}
							</div>
						</div>

						{/* --- Schedule Section --- */}
						<div className='bg-white/5 p-6 rounded-2xl md:col-span-2'>
							<h3 className='text-sm text-white/50 uppercase tracking-widest mb-4'>
								Content Schedule
							</h3>
							<ScheduleCalendar
								schedule={scheduleByDay}
								onAddPost={handleAddPost}
							/>
						</div>
					</div>
				</div>
			</main>

			{selectedDateForPost && (
				<AddSponsoredPostModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					onSubmit={handleScheduleSubmit}
					date={selectedDateForPost}
				/>
			)}

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
