"use client";
import React, { useState, useEffect } from "react";

const MagicBlob = () => (
	<div className='relative w-16 h-16 flex items-center justify-center'>
		<svg className='absolute inset-0 w-full h-full' viewBox='0 0 100 100'>
			<defs>
				<linearGradient
					id='blob-gradient'
					x1='0%'
					y1='0%'
					x2='100%'
					y2='100%'
				>
					<stop offset='0%' stopColor='#8b5cf6'>
						<animate
							attributeName='stop-color'
							values='#8b5cf6;#6366f1;#8b5cf6'
							dur='3s'
							repeatCount='indefinite'
						/>
					</stop>
					<stop offset='100%' stopColor='#6366f1'>
						<animate
							attributeName='stop-color'
							values='#6366f1;#8b5cf6;#6366f1'
							dur='3s'
							repeatCount='indefinite'
						/>
					</stop>
				</linearGradient>
				<filter id='gooey-blob'>
					<feTurbulence
						type='fractalNoise'
						baseFrequency='0.02'
						numOctaves='3'
						result='noise'
						seed='1'
					>
						<animate
							attributeName='baseFrequency'
							values='0.02;0.05;0.02'
							dur='8s'
							repeatCount='indefinite'
						/>
					</feTurbulence>
					<feDisplacementMap
						in='SourceGraphic'
						in2='noise'
						scale='8'
					/>
					<feGaussianBlur stdDeviation='2' />
					<feColorMatrix values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10' />
				</filter>
			</defs>
			<g filter='url(#gooey-blob)'>
				<path fill='url(#blob-gradient)' opacity='0.9'>
					<animate
						attributeName='d'
						values='M50,25 Q65,30 70,50 Q65,70 50,75 Q35,70 30,50 Q35,30 50,25;
								M50,28 Q68,35 72,50 Q68,65 50,72 Q32,65 28,50 Q32,35 50,28;
								M50,30 Q63,38 68,50 Q63,62 50,70 Q37,62 32,50 Q37,38 50,30;
								M50,25 Q65,30 70,50 Q65,70 50,75 Q35,70 30,50 Q35,30 50,25'
						dur='4s'
						repeatCount='indefinite'
					/>
				</path>
				<circle cx='50' cy='50' r='18' fill='white' opacity='0.3'>
					<animate
						attributeName='r'
						values='18;22;18'
						dur='2s'
						repeatCount='indefinite'
					/>
				</circle>
				<circle cx='50' cy='50' r='12' fill='white' opacity='0.2'>
					<animate
						attributeName='r'
						values='12;16;12'
						dur='2s'
						begin='0.5s'
						repeatCount='indefinite'
					/>
				</circle>
			</g>
		</svg>
	</div>
);

const DivineIntervention = ({
	influencerId,
	onIntervention,
}: {
	influencerId: number;
	onIntervention: () => Promise<void>;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [eventDescription, setEventDescription] = useState("");
	const [intensity, setIntensity] = useState("moderate");
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	const handleOpen = () => {
		setIsOpen(true);
		setIsExiting(false);
	};

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => setIsOpen(false), 500);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!eventDescription.trim() || isLoading) return;
		setIsLoading(true);

		try {
			await fetch(
				`http://localhost:8000/influencer/${influencerId}/divine-intervention`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						event_description: eventDescription,
						intensity,
					}),
				}
			);
			await onIntervention();
			handleClose();
		} catch (error) {
			console.error("Divine Intervention failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<div className='relative group flex justify-center py-6'>
				<div className='absolute top-1/2 left-0 w-full h-[1px] bg-white/10'></div>
				<button
					onClick={handleOpen}
					className='relative z-10 h-16 w-16 flex items-center justify-center bg-[#111] rounded-full border border-white/10 group-hover:border-purple-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'
				>
					<MagicBlob />
				</button>
			</div>

			{isOpen && (
				<div
					className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-500 ${
						isExiting ? "opacity-0" : "opacity-100"
					}`}
				>
					<div id='stardust-bg' className='absolute inset-0'></div>
					<div className='relative w-full h-full flex flex-col items-center justify-center'>
						<form
							onSubmit={handleSubmit}
							className='w-full max-w-2xl text-center'
						>
							<input
								type='text'
								value={eventDescription}
								onChange={(e) =>
									setEventDescription(e.target.value)
								}
								placeholder='A new chapter unfolds...'
								className='w-full bg-transparent text-3xl text-white placeholder:text-white/30 text-center focus:outline-none p-4'
								autoFocus
							/>
							<div className='flex justify-center gap-8 my-12'>
								{["subtle", "moderate", "major"].map(
									(level) => (
										<button
											key={level}
											type='button'
											onClick={() => setIntensity(level)}
											className={`relative text-lg transition-colors duration-300 ${
												intensity === level
													? "text-purple-300"
													: "text-white/40 hover:text-white"
											}`}
										>
											{level.charAt(0).toUpperCase() +
												level.slice(1)}
											{intensity === level && (
												<div className='absolute -bottom-2 left-0 w-full h-0.5 bg-purple-300 shadow-[0_0_8px_theme(colors.purple.300)]'></div>
											)}
										</button>
									)
								)}
							</div>
							<button
								type='submit'
								className='text-white/50 hover:text-white transition-colors'
							>
								{isLoading ? "Rewriting..." : "Rewrite Destiny"}
							</button>
						</form>
						<button
							onClick={handleClose}
							className='absolute top-8 right-8 text-white/50 hover:text-white'
						>
							Close
						</button>
					</div>
				</div>
			)}
			<style jsx>{`
				#stardust-bg {
					background: radial-gradient(
						ellipse at bottom,
						#1b2735 0%,
						#090a0f 100%
					);
					overflow: hidden;
				}
			`}</style>
		</>
	);
};

export default DivineIntervention;
