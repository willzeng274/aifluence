"use client";

import React, { useState } from "react";

interface AddSponsoredPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (postData: any) => void;
	date: Date;
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

const AddSponsoredPostModal: React.FC<AddSponsoredPostModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	date,
}) => {
	const [sponsorName, setSponsorName] = useState("");
	const [sponsorLogoUrl, setSponsorLogoUrl] = useState("");
	const [time, setTime] = useState("10:00");
	const [script, setScript] = useState("");
	const [caption, setCaption] = useState("");
	const [hashtags, setHashtags] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);

		let sponsorId: number;

		try {
			const sponsorResponse = await fetch(
				"http://localhost:8000/sponsors",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						company_name: sponsorName,
						brand_logo_url: sponsorLogoUrl,
					}),
				}
			);

			if (!sponsorResponse.ok) {
				const errorData = await sponsorResponse.json();
				console.error("Failed to create sponsor:", errorData);
				throw new Error("Failed to create sponsor.");
			}
			const newSponsor = await sponsorResponse.json();
			sponsorId = newSponsor.id;
		} catch (error) {
			console.error(error);
			alert("Error creating sponsor. Please try again.");
			setIsSubmitting(false);
			return;
		}

		const [hours, minutes] = time.split(":").map(Number);
		const scheduledDateTime = new Date(date);
		scheduledDateTime.setHours(hours, minutes);

		const postData = {
			run_at: scheduledDateTime.toISOString(),
			is_active: true,
			video_params: {
				scheduled_time: scheduledDateTime.toISOString(),
				content_type: "reel", // Hardcoding to reel for sponsored content
				generation_prompt: {
					description: script,
					intention:
						"Create a sponsored post that is engaging and informative.",
				},
				caption: caption,
				hashtags: hashtags.split(",").map((h) => h.trim()),
				platform: "instagram",
				sponsor_id: sponsorId,
			},
		};

		await onSubmit(postData);
		setIsSubmitting(false);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'>
			<div className='bg-[#111] border border-white/20 w-full max-w-2xl text-white animate-slide-up'>
				<header className='p-6 border-b border-white/10 flex justify-between items-center'>
					<div>
						<h2 className='text-xl font-semibold uppercase tracking-widest'>
							Add Sponsored Post
						</h2>
						<p className='text-white/50 text-sm'>
							Scheduling for:{" "}
							{date.toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-white/10'
					>
						<CloseIcon />
					</button>
				</header>
				<form onSubmit={handleSubmit} className='p-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='md:col-span-2'>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Sponsor
							</label>
							<div className='grid grid-cols-2 gap-4'>
								<input
									type='text'
									value={sponsorName}
									onChange={(e) =>
										setSponsorName(e.target.value)
									}
									placeholder='Sponsor Name'
									required
									className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
								/>
								<input
									type='text'
									value={sponsorLogoUrl}
									onChange={(e) =>
										setSponsorLogoUrl(e.target.value)
									}
									placeholder='Sponsor Logo URL'
									required
									className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
								/>
							</div>
						</div>
						<div className='md:col-span-2'>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Content
							</label>
							<textarea
								value={script}
								onChange={(e) => setScript(e.target.value)}
								placeholder='Post script or detailed description...'
								required
								rows={5}
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div className='md:col-span-2'>
							<textarea
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder='Final caption for the post'
								required
								rows={3}
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Hashtags
							</label>
							<input
								type='text'
								value={hashtags}
								onChange={(e) => setHashtags(e.target.value)}
								placeholder='comma, separated, tags'
								required
								className='w-full bg-transparent border border-white/20 p-3 placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
							/>
						</div>
						<div>
							<label className='block text-sm uppercase tracking-wider text-white/50 mb-2'>
								Time
							</label>
							<input
								type='time'
								value={time}
								onChange={(e) => setTime(e.target.value)}
								required
								className='w-full bg-transparent border border-white/20 p-3 focus:outline-none focus:border-white/50 transition-colors'
							/>
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
							{isSubmitting ? "Scheduling..." : "Schedule Post"}
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

export default AddSponsoredPostModal;
