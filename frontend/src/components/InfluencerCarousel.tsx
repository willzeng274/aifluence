"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";

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
}

type Props = {
	influencers: Influencer[];
	className?: string;
	onCardClick: (influencer: Influencer) => void;
};

const InfluencerCarousel = ({
	influencers,
	className = "",
	onCardClick,
}: Props) => {
	const [rotation, setRotation] = useState(0);

	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const startRotationRef = useRef(0);
	const dragDistanceRef = useRef(0);
	const clickedInfluencerRef = useRef<Influencer | null>(null);

	const totalCards = influencers.length;
	const angleStep = 360 / totalCards;
	const radius = 150 + totalCards * 40; // Increased radius for more spacing

	const getClientX = (
		e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
	) => {
		return "touches" in e ? e.touches[0].clientX : e.clientX;
	};

	const handleDragStart = useCallback(
		(e: React.MouseEvent | React.TouchEvent, influencer: Influencer) => {
			isDraggingRef.current = true;
			startXRef.current = getClientX(e);
			startRotationRef.current = rotation;
			dragDistanceRef.current = 0;
			clickedInfluencerRef.current = influencer;
			document.body.style.cursor = "grabbing";
			document.body.style.userSelect = "none";
		},
		[rotation]
	);

	const handleDragging = useCallback((e: MouseEvent | TouchEvent) => {
		if (!isDraggingRef.current) return;
		const clientX = getClientX(e);
		const deltaX = clientX - startXRef.current;
		dragDistanceRef.current = Math.abs(deltaX);
		const sensitivity = 0.4;
		const newRotation = startRotationRef.current + deltaX * sensitivity;
		setRotation(newRotation);
	}, []);

	const handleDragEnd = useCallback(() => {
		if (isDraggingRef.current) {
			if (dragDistanceRef.current < 10 && clickedInfluencerRef.current) {
				onCardClick(clickedInfluencerRef.current);
			}
			isDraggingRef.current = false;
			clickedInfluencerRef.current = null;
			document.body.style.cursor = "default";
			document.body.style.userSelect = "auto";
		}
	}, [onCardClick]);

	useEffect(() => {
		window.addEventListener("mousemove", handleDragging);
		window.addEventListener("touchmove", handleDragging);
		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("touchend", handleDragEnd);

		return () => {
			window.removeEventListener("mousemove", handleDragging);
			window.removeEventListener("touchmove", handleDragging);
			window.removeEventListener("mouseup", handleDragEnd);
			window.removeEventListener("touchend", handleDragEnd);
		};
	}, [handleDragging, handleDragEnd]);

	return (
		<div className={`relative w-full h-full ${className}`}>
			<div
				className='relative w-full h-full flex items-center justify-center'
				style={{ perspective: "2000px", transform: "scale(0.85)" }}
			>
				<div
					className='relative w-[300px] h-[450px] transition-transform duration-[50ms] ease-out'
					style={{
						transformStyle: "preserve-3d",
						transform: `rotateY(${rotation}deg)`,
					}}
				>
					{influencers.map((influencer, index) => {
						const cardRotation = index * angleStep;

						// Calculate how far the card is from the front (0 to 180 degrees)
						const effectiveRotation = rotation + cardRotation;
						const normalizedAngle =
							((effectiveRotation % 360) + 360) % 360;
						const angleDifference = Math.min(
							normalizedAngle,
							360 - normalizedAngle
						);

						// Map angle difference to brightness (1.0 at front, 0.2 at back)
						const minBrightness = 0.2;
						const maxBrightness = 1.0;
						const brightness =
							maxBrightness -
							(angleDifference / 180) *
								(maxBrightness - minBrightness);

						return (
							<div
								key={influencer.id}
								className='absolute w-full h-full cursor-grab active:cursor-grabbing'
								style={{
									transformStyle: "preserve-3d",
									transform: `rotateY(${cardRotation}deg) translateZ(${radius}px)`,
									filter: `brightness(${brightness})`,
									transition:
										"filter 0.3s ease-out, transform 0.3s ease-out",
								}}
								onMouseDown={(e) =>
									handleDragStart(e, influencer)
								}
								onTouchStart={(e) =>
									handleDragStart(e, influencer)
								}
							>
								<div className='relative w-full h-full rounded-3xl overflow-hidden bg-black/20 backdrop-blur-lg border border-white/10 shadow-2xl'>
									<Image
										fill
										alt={influencer.name}
										className='w-full h-full object-cover'
										src={influencer.face_image_url}
										draggable={false}
									/>
									<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
									<h1 className='absolute bottom-6 left-6 text-3xl font-bold tracking-tight'>
										{influencer.name}
									</h1>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default InfluencerCarousel;
