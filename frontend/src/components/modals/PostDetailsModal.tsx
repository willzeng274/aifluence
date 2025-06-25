"use client";

import React from "react";
import {
	X,
	Calendar,
	Hash,
	CheckCircle,
	Clock,
	Clapperboard,
	BookUser,
	Newspaper,
	MoreHorizontal,
} from "lucide-react";

interface Video {
	video_id: number;
	schedule_id: number;
	scheduled_time: string;
	content_type: "story" | "reel" | "post";
	status: string;
	caption: string;
	hashtags: string[];
	is_active: boolean;
	has_sponsor: boolean;
}

interface PostDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	video: Video | null;
}

const PostDetailsModal = ({
	isOpen,
	onClose,
	video,
}: PostDetailsModalProps) => {
	if (!isOpen || !video) return null;

	const formattedDate = new Date(video.scheduled_time).toLocaleString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}
	);

	const getContentTypeProps = () => {
		switch (video.content_type) {
			case "story":
				return {
					Icon: BookUser,
					color: "text-sky-400",
					gradient: "from-sky-500/20 to-transparent",
				};
			case "reel":
				return {
					Icon: Clapperboard,
					color: "text-rose-400",
					gradient: "from-rose-500/20 to-transparent",
				};
			case "post":
			default:
				return {
					Icon: Newspaper,
					color: "text-amber-400",
					gradient: "from-amber-500/20 to-transparent",
				};
		}
	};

	const { Icon: ContentIcon, color, gradient } = getContentTypeProps();

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in'
			onClick={onClose}
		>
			<div
				className='relative w-full max-w-4xl bg-gradient-to-br from-[#1c1c1c] to-[#111] border border-white/10 rounded-xl shadow-2xl shadow-purple-500/10 animate-fade-in-up max-h-[90vh] flex flex-col'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between p-4 border-b border-white/10 ${gradient}`}
				>
					<div className={`flex items-center gap-3 ${color}`}>
						<ContentIcon className='w-6 h-6' />
						<h2 className='text-xl font-bold tracking-tight text-white capitalize'>
							{video.content_type} Details
						</h2>
					</div>
					<button
						onClick={onClose}
						className='text-white/50 hover:text-white transition-colors rounded-full p-1'
					>
						<X className='w-6 h-6' />
					</button>
				</div>

				{/* Body */}
				<div className='grid md:grid-cols-2 gap-8 p-8 overflow-y-auto'>
					{/* Left: Preview */}
					<div className='space-y-6'>
						<h3 className='text-sm text-white/50 uppercase tracking-widest'>
							Preview
						</h3>
						<div className='bg-black/30 border border-white/10 rounded-lg p-4 space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='w-8 h-8 rounded-full bg-purple-500/50'></div>
									<span className='font-bold text-sm'>
										influencer_name
									</span>
								</div>
								<MoreHorizontal className='w-5 h-5 text-white/50' />
							</div>
							<div className='aspect-square w-full bg-zinc-800 rounded flex items-center justify-center'>
								<ContentIcon
									className={`w-16 h-16 ${color} opacity-30`}
								/>
							</div>
							<div>
								<p className='text-sm leading-relaxed text-white/90'>
									{video.caption}
								</p>
								<div className='flex flex-wrap gap-2 mt-3'>
									{video.hashtags.map((tag) => (
										<span
											key={tag}
											className={`text-xs ${color} opacity-80`}
										>
											#{tag}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Right: Metadata */}
					<div className='space-y-6'>
						<h3 className='text-sm text-white/50 uppercase tracking-widest'>
							Metadata
						</h3>
						<div className='space-y-4 text-sm'>
							<div className='flex justify-between items-center'>
								<span className='flex items-center gap-2 text-white/60'>
									<Calendar className='w-4 h-4' /> Scheduled
								</span>
								<span className='font-mono'>
									{formattedDate}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='flex items-center gap-2 text-white/60'>
									<Clock className='w-4 h-4' /> Status
								</span>
								<span
									className={`capitalize px-2 py-0.5 text-xs rounded-full font-medium ${
										video.status === "posted"
											? "bg-green-500/20 text-green-300"
											: "bg-blue-500/20 text-blue-300"
									}`}
								>
									{video.status}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='flex items-center gap-2 text-white/60'>
									<CheckCircle className='w-4 h-4' />{" "}
									Sponsored
								</span>
								<span
									className={`font-mono ${
										video.has_sponsor
											? "text-yellow-300"
											: "text-white/50"
									}`}
								>
									{video.has_sponsor ? "Yes" : "No"}
								</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='flex items-center gap-2 text-white/60'>
									<Hash className='w-4 h-4' /> Hashtags
								</span>
								<span className='font-mono'>
									{video.hashtags.length}
								</span>
							</div>
						</div>
					</div>
				</div>
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
				.animate-fade-in {
					animation: fade-in 0.2s ease-out forwards;
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(20px) scale(0.98);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				.animate-fade-in-up {
					animation: fade-in-up 0.3s ease-out forwards;
				}
			`}</style>
		</div>
	);
};

export default PostDetailsModal;
