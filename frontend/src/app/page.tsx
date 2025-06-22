"use client";

import InfluencerCarousel from "@/components/InfluencerCarousel";
import { influencers as influencersData } from "@/constants/influencers";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import InfluencerDetailsSidebar from "@/components/InfluencerDetailsSidebar";
import { useRouter } from "next/navigation";

// Define influencer type for state
type Influencer = (typeof influencersData)[0];

const Home = () => {
	const [influencers, setInfluencers] =
		useState<Influencer[]>(influencersData);

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
		// TODO: API_PLACEHOLDER_GET Fetch influencers from API
		// const data = await response.json();
		// setInfluencers(data);
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
