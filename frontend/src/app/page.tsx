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

// NEW: Separate types for summary and detailed views
interface InfluencerSummary {
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

interface InfluencerDetails extends InfluencerSummary {
	life_story: string | null;
}

const Home = () => {
	const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
	const [selectedInfluencer, setSelectedInfluencer] =
		useState<InfluencerDetails | null>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();

	const handleCardClick = async (influencer: InfluencerSummary) => {
		try {
			const response = await fetch(
				`http://localhost:8000/influencer/${influencer.id}`
			);
			if (response.ok) {
				const fullInfluencerData: InfluencerDetails =
					await response.json();
				setSelectedInfluencer(fullInfluencerData);
			} else {
				console.error("Failed to fetch full influencer details");
			}
		} catch (error) {
			console.error("Error fetching influencer details:", error);
		}
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
					influencersData.map(
						async (influencer: InfluencerSummary) => {
							try {
								const videoResponse = await fetch(
									`http://localhost:8000/influencer/${influencer.id}/videos`
								);
								if (videoResponse.ok) {
									const videoData =
										await videoResponse.json();
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
								return { ...influencer, videos: [] }; // Ensure videos is not undefined
							} catch (error) {
								console.error(
									`Failed to fetch videos for influencer ${influencer.id}`,
									error
								);
								return { ...influencer, videos: [] }; // Ensure videos is not undefined
							}
						}
					)
				);

				const filteredInfluencers = influencersWithVideos
					.filter((i): i is InfluencerSummary => i !== null)
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
			<div className='starfield'></div>
			<div className='absolute inset-0 z-0 bg-gradient-to-br from-[#1d1229] via-[#111111] to-[#291812] opacity-90'></div>

			{/* Background Blobs */}
			<div className='absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-900/50 via-transparent to-transparent -translate-x-1/3 -translate-y-1/3 blur-3xl opacity-30 animate-blob-1'></div>
			<div className='absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-amber-800/50 via-transparent to-transparent translate-x-1/3 translate-y-1/3 blur-3xl opacity-20 animate-blob-2'></div>

			<div className='relative z-10 h-full flex flex-col'>
				<Navbar onAddClick={handleAddClick} />

				{/* Main Content */}
				<section className='w-full h-full flex flex-col items-center justify-center p-4 md:p-8'>
					<header
						className='text-center z-10 mb-10 animate-fade-in-down'
						style={{ animationDelay: "200ms" }}
					>
						<h1 className='text-5xl md:text-7xl font-black tracking-tighter text-shadow-glow uppercase'>
							Meet Your Promptfluencers
						</h1>
						<p className='text-white/60 mt-4 text-base md:text-lg max-w-2xl mx-auto'>
							From prompt to personality. The next generation of
							digital influence is here.
						</p>
					</header>
					<div
						className='w-full flex-1 flex items-center justify-center animate-fade-in-up'
						style={{ animationDelay: "400ms" }}
					>
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
				.text-shadow-glow {
					text-shadow: 0 0 10px rgba(255, 255, 255, 0.2),
						0 0 20px rgba(255, 255, 255, 0.1),
						0 0 40px rgba(192, 132, 252, 0.3);
				}
				.starfield {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: radial-gradient(
							1px 1px at 20px 30px,
							#eee,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							1px 1px at 40px 70px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 50px 160px,
							#ddd,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 90px 40px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							1px 1px at 130px 80px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 160px 120px,
							#ddd,
							rgba(0, 0, 0, 0)
						);
					background-repeat: repeat;
					background-size: 200px 200px;
					animation: move-stars 200s linear infinite;
					opacity: 0.5;
				}

				@keyframes move-stars {
					from {
						transform: translate(0, 0);
					}
					to {
						transform: translate(-1000px, -500px);
					}
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
				.animate-fade-in-down {
					animation: fade-in-down 0.8s ease-out forwards;
					opacity: 0;
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in-up {
					animation: fade-in-up 0.8s ease-out forwards;
					opacity: 0;
				}

				@keyframes blob-1 {
					0%,
					100% {
						transform: translate(-33%, -33%) scale(1);
					}
					50% {
						transform: translate(-20%, -40%) scale(1.2);
					}
				}
				.animate-blob-1 {
					animation: blob-1 20s infinite ease-in-out;
				}

				@keyframes blob-2 {
					0%,
					100% {
						transform: translate(33%, 33%) scale(1);
					}
					50% {
						transform: translate(25%, 45%) scale(0.8);
					}
				}
				.animate-blob-2 {
					animation: blob-2 25s infinite ease-in-out;
					animation-delay: -5s;
				}

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
