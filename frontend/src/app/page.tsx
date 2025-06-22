"use client";

import InfluencerCarousel from "@/components/InfluencerCarousel";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import InfluencerDetailsSidebar from "@/components/InfluencerDetailsSidebar";
import { useRouter } from "next/navigation";

// Define video type based on API response
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

// Define influencer type based on API response
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

const Home = () => {
	const [influencers, setInfluencers] = useState<Influencer[]>([]);
	const [selectedInfluencer, setSelectedInfluencer] =
		useState<Influencer | null>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();

	const handleCardClick = (influencer: Influencer) => {
		setSelectedInfluencer(influencer);
	};

	const handleCloseSidebar = () => {
		setSelectedInfluencer(null);
	};

	const handleConnect = (influencerId: number) => {
		setIsExiting(true);
		setTimeout(() => {
			router.push(`/influencer/${influencerId}`);
		}, 500); // Match animation duration
	};

	const handleAddClick = () => {
		setIsExiting(true);
		setTimeout(() => {
			router.push("/create");
		}, 500); // Match animation duration
	};

	const handleFetchInfluencers = async () => {
		try {
			const response = await fetch(
				"http://localhost:8000/influencers?skip=0&limit=100"
			);
			if (response.ok) {
				const influencersData = await response.json();

				const influencersWithVideos = await Promise.all(
					influencersData.map(async (influencer: Influencer) => {
						try {
							const videoResponse = await fetch(
								`http://localhost:8000/influencer/${influencer.id}/videos`
							);
							if (videoResponse.ok) {
								const videoData = await videoResponse.json();
								if (
									videoData.videos &&
									videoData.videos.length > 0
								) {
									return {
										...influencer,
										videos: videoData.videos,
									};
								}
							}
							return null;
						} catch (error) {
							console.error(
								`Failed to fetch videos for influencer ${influencer.id}`,
								error
							);
							return null;
						}
					})
				);

				const filteredInfluencers = influencersWithVideos
					.filter((i): i is Influencer => i !== null)
					.map((influencer) => ({
						...influencer,
						followers: `${(Math.random() * 5).toFixed(1)}M`,
						engagement: `${(Math.random() * 5).toFixed(2)}%`,
					}));

				setInfluencers(filteredInfluencers);
			} else {
				console.error("Failed to fetch influencers");
			}
		} catch (error) {
			console.error("Error fetching influencers:", error);
		}
	};

	useEffect(() => {
		handleFetchInfluencers();
	}, []);

	return (
		<main
			className={`relative w-screen h-screen bg-[#111111] text-white overflow-hidden font-sans ${
				isExiting ? "animate-page-exit" : ""
			}`}
		>
			<div className='absolute inset-0 z-0 bg-gradient-to-br from-[#1d1229] via-[#111111] to-[#291812]'></div>
			{/* Background Blobs */}
			<div className='absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-900/50 via-transparent to-transparent -translate-x-1/3 -translate-y-1/3 blur-3xl opacity-30'></div>
			<div className='absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-amber-800/50 via-transparent to-transparent translate-x-1/3 translate-y-1/3 blur-3xl opacity-20'></div>

			<div className='relative z-10 h-full flex flex-col'>
				<Navbar onAddClick={handleAddClick} />

				{/* Main Content */}
				<section className='w-full h-full flex flex-col'>
					<div className='w-full h-full flex flex-col items-center justify-center relative'>
						<header className='absolute top-16 text-center z-10'>
							<h1 className='text-5xl font-bold tracking-tighter'>
								Influencers
							</h1>
						</header>
						<InfluencerCarousel
							influencers={influencers}
							onCardClick={handleCardClick}
						/>
					</div>
				</section>

				{selectedInfluencer && (
					<InfluencerDetailsSidebar
						influencer={selectedInfluencer}
						onClose={handleCloseSidebar}
						onConnect={handleConnect}
					/>
				)}
			</div>

			<style jsx>{`
				@keyframes page-exit {
					from {
						opacity: 1;
						transform: translateX(0);
					}
					to {
						opacity: 0;
						transform: translateX(-50px);
					}
				}
				.animate-page-exit {
					animation: page-exit 0.5s
						cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
				}
			`}</style>
		</main>
	);
};

export default Home;
