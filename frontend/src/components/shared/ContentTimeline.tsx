import React from "react";

// This interface should be kept in sync with the one in the main page
interface Video {
	video_id: number;
	scheduled_time: string;
	content_type: "story" | "reel";
	caption: string;
}

type Props = {
	videos: Video[];
	onAddPost: (date: Date) => void;
};

const PostIcon = ({ type }: { type: "story" | "reel" }) => (
	<div className='w-10 h-10 flex-shrink-0 flex items-center justify-center border border-white/10 bg-black'>
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='20'
			height='20'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			className='text-white/50'
		>
			{type === "reel" ? (
				<path d='m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11l-5.223-3.482a.5.5 0 0 0-.777.416v8.132a.5.5 0 0 0 .777.416L16 13z' />
			) : (
				<>
					<circle cx='12' cy='12' r='3' />
					<path d='M22 12c-2.25 4-5.25 6-10 6s-7.75-2-10-6c2.25-4 5.25-6 10-6s7.75 2 10 6Z' />
				</>
			)}
		</svg>
	</div>
);

const AddPostIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<line x1='12' y1='5' x2='12' y2='19'></line>
		<line x1='5' y1='12' x2='19' y2='12'></line>
	</svg>
);

const ContentTimeline = ({ videos, onAddPost }: Props) => {
	const sortedVideos = [...videos].sort(
		(a, b) =>
			new Date(a.scheduled_time).getTime() -
			new Date(b.scheduled_time).getTime()
	);

	const groupedByDay = sortedVideos.reduce((acc, video) => {
		const date = new Date(video.scheduled_time).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(video);
		return acc;
	}, {} as Record<string, Video[]>);

	return (
		<div className='w-full'>
			<div className='border-t border-white/10'>
				{Object.keys(groupedByDay).length > 0 ? (
					Object.entries(groupedByDay).map(([date, dayVideos]) => (
						<div
							key={date}
							className='relative grid grid-cols-[auto_1fr] gap-x-6 py-8 border-b border-white/10 group'
						>
							<div className='text-right'>
								<p className='text-sm uppercase tracking-widest text-white/50'>
									{new Date(date).toLocaleDateString("en-US", {
										month: "short",
									})}
								</p>
								<p className='text-3xl font-bold text-white'>
									{new Date(date).getDate()}
								</p>
							</div>

							<div className='space-y-6'>
								{dayVideos.map((video) => (
									<div
										key={video.video_id}
										className='flex items-start gap-4'
									>
										<PostIcon type={video.content_type} />
										<div>
											<p className='font-semibold text-white'>
												{video.content_type
													.charAt(0)
													.toUpperCase() +
													video.content_type.slice(1)}
												{" at "}
												{new Date(
													video.scheduled_time
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
											<p className='text-white/60 text-sm mt-1'>
												{video.caption}
											</p>
										</div>
									</div>
								))}
							</div>
							<button
								onClick={() => onAddPost(new Date(date))}
								className='absolute top-8 right-0 flex items-center gap-2 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100'
							>
								<AddPostIcon />
								<span className='text-xs uppercase tracking-widest'>
									Add Post
								</span>
							</button>
						</div>
					))
				) : (
					<div className='py-16 text-center border-b border-white/10'>
						<p className='text-white/50'>
							No content scheduled yet.
						</p>
						<button
							onClick={() => onAddPost(new Date())}
							className='mt-4 px-4 py-2 border border-white/20 hover:bg-white/5 transition-colors text-xs uppercase tracking-widest'
						>
							+ Schedule First Post
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ContentTimeline; 