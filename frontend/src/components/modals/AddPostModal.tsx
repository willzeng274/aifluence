"use client";

import React, { useState, useEffect } from "react";

interface Sponsor {
	id: number;
	name: string;
}

interface AddPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: any) => void;
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

const AddPostModal: React.FC<AddPostModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	date,
}) => {
	const [contentType, setContentType] = useState<"reel" | "story">("reel");
	const [caption, setCaption] = useState("");
	const [hashtags, setHashtags] = useState("");
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [selectedSponsor, setSelectedSponsor] = useState<string>("");
	const [time, setTime] = useState("10:00");
	const [script, setScript] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const fetchSponsors = async () => {
			try {
				const response = await fetch("http://localhost:8000/sponsors");
				if (response.ok) {
					const data: Sponsor[] = await response.json();
					setSponsors(data);
				}
			} catch (error) {
				console.error("Failed to fetch sponsors:", error);
			}
		};

		if (isOpen) {
			fetchSponsors();
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const [hours, minutes] = time.split(":").map(Number);
		const scheduledDateTime = new Date(date);
		scheduledDateTime.setHours(hours, minutes, 0, 0);

		const postData = {
			run_at: scheduledDateTime.toISOString(),
			is_active: true,
			video_params: {
				content_type: contentType,
				caption,
				hashtags: hashtags.split(",").map((h) => h.trim()),
				sponsor_id: selectedSponsor
					? parseInt(selectedSponsor, 10)
					: null,
				scheduled_time: scheduledDateTime.toISOString(),
				generation_prompt: {
					description: script,
					intention:
						"Create a post that is engaging and informative.",
				},
				platform: "instagram",
			},
		};

		try {
			await onSubmit(postData);
		} catch (error) {
			console.error("Failed to submit post:", error);
			alert("An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
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
					<button onClick={onClose} className='p-2 hover:bg-white/10'>
						<CloseIcon />
					</button>
				</header>
				<form onSubmit={handleSubmit} className='p-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='md:col-span-2'>
							<label
								htmlFor='sponsor'
								className='block text-sm font-medium text-white/70 mb-2'
							>
								Link Sponsor (Optional)
							</label>
							<select
								id='sponsor'
								name='sponsor'
								value={selectedSponsor}
								onChange={(e) =>
									setSelectedSponsor(e.target.value)
								}
								className='w-full bg-transparent border border-white/20 p-3 text-white focus:outline-none focus:border-white/50 transition-colors appearance-none'
								style={{
									backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
									backgroundPosition: "right 0.5rem center",
									backgroundRepeat: "no-repeat",
									backgroundSize: "1.5em 1.5em",
									paddingRight: "2.5rem",
								}}
							>
								<option value='' className='bg-[#111]'>
									No Sponsor
								</option>
								{sponsors.map((sponsor) => (
									<option
										key={sponsor.id}
										value={sponsor.id}
										className='bg-[#111]'
									>
										{sponsor.name}
									</option>
								))}
							</select>
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

export default AddPostModal;
