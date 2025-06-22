"use client";

import React, { useState } from "react";

interface AddSponsorModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSponsorAdded: () => void;
}

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

const AddSponsorModal: React.FC<AddSponsorModalProps> = ({
	isOpen,
	onClose,
	onSponsorAdded,
}) => {
	const [name, setName] = useState("");
	const [website, setWebsite] = useState("");
	const [industry, setIndustry] = useState("");
	const [sponsorshipTier, setSponsorshipTier] = useState("Gold");
	const [status, setStatus] = useState("Active");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);

		const sponsorData = {
			name,
			website,
			industry,
			sponsorship_tier: sponsorshipTier,
			status,
			targeting_tags: industry.split(",").map((t) => t.trim()),
		};

		try {
			const response = await fetch("http://localhost:8000/sponsors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sponsorData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`Failed to create sponsor: ${
						errorData.detail || "Unknown error"
					}`
				);
			}

			onSponsorAdded();
			onClose();
		} catch (error) {
			console.error(error);
			alert(`Error creating sponsor: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'
			onClick={onClose}
		>
			<div
				className='bg-[#111] border border-white/20 w-full max-w-2xl text-white animate-slide-up'
				onClick={(e) => e.stopPropagation()}
			>
				<header className='p-6 border-b border-white/10 flex justify-between items-center'>
					<div>
						<h2 className='text-xl font-semibold uppercase tracking-widest'>
							Add New Sponsor
						</h2>
						<p className='text-white/50 text-sm'>
							Enter the details for the new brand partnership.
						</p>
					</div>
					<button onClick={onClose} className='p-2 hover:bg-white/10'>
						<CloseIcon />
					</button>
				</header>
				<form onSubmit={handleSubmit} className='p-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Sponsor Name
							</label>
							<input
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder='e.g., QuantumLeap Tech'
								required
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Website
							</label>
							<input
								type='text'
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								placeholder='e.g., quantumleap.tech'
								required
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div className='md:col-span-2'>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Industry
							</label>
							<input
								type='text'
								value={industry}
								onChange={(e) => setIndustry(e.target.value)}
								placeholder='e.g., AI & Robotics, Gaming'
								required
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Sponsorship Tier
							</label>
							<select
								value={sponsorshipTier}
								onChange={(e) =>
									setSponsorshipTier(e.target.value)
								}
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							>
								<option className='bg-[#111]'>Platinum</option>
								<option className='bg-[#111]'>Gold</option>
								<option className='bg-[#111]'>Silver</option>
							</select>
						</div>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Status
							</label>
							<select
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							>
								<option className='bg-[#111]'>Active</option>
								<option className='bg-[#111]'>Paused</option>
								<option className='bg-[#111]'>Inactive</option>
							</select>
						</div>
					</div>
					<div className='flex justify-end gap-4 mt-8 border-t border-white/10 pt-6'>
						<button
							type='button'
							onClick={onClose}
							disabled={isSubmitting}
							className='px-8 py-3 border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-widest text-sm'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-8 py-3 bg-white text-black transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm font-semibold'
						>
							{isSubmitting ? "Adding..." : "Add Sponsor"}
						</button>
					</div>
				</form>
			</div>
			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				@keyframes slide-up {
					from {
						transform: translateY(20px);
					}
					to {
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fade-in 0.3s ease-out forwards;
				}
				.animate-slide-up {
					animation: slide-up 0.3s ease-out forwards;
				}
			`}</style>
		</div>
	);
};

export default AddSponsorModal;
