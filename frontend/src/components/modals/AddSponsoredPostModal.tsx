"use client";

import React, { useState } from "react";

interface AddSponsoredPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (postData: any) => void;
	date: Date;
}

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
				content_type: "post",
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
		<div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'>
			<div className='bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg text-white'>
				<h2 className='text-2xl font-bold mb-4'>Add Sponsored Post</h2>
				<p className='text-white/60 mb-6'>
					Scheduling for: {date.toLocaleDateString()}
				</p>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Sponsor Name
						</label>
						<input
							type='text'
							value={sponsorName}
							onChange={(e) => setSponsorName(e.target.value)}
							required
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Sponsor Logo URL
						</label>
						<input
							type='text'
							value={sponsorLogoUrl}
							onChange={(e) => setSponsorLogoUrl(e.target.value)}
							placeholder='https://example.com/logo.png'
							required
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Time
						</label>
						<input
							type='time'
							value={time}
							onChange={(e) => setTime(e.target.value)}
							required
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Post Script/Description
						</label>
						<textarea
							value={script}
							onChange={(e) => setScript(e.target.value)}
							required
							rows={4}
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Caption
						</label>
						<textarea
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							required
							rows={3}
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Hashtags (comma-separated)
						</label>
						<input
							type='text'
							value={hashtags}
							onChange={(e) => setHashtags(e.target.value)}
							required
							className='w-full bg-[#111] border border-white/20 rounded-lg p-3'
						/>
					</div>
					<div className='flex justify-end gap-4 pt-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={isSubmitting}
							className='px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold'
						>
							{isSubmitting ? "Scheduling..." : "Schedule Post"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddSponsoredPostModal;
