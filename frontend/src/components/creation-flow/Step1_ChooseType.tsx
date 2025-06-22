import React, { useState } from "react";
import { User, Briefcase } from "lucide-react";

export type InfluencerType = "lifestyle" | "company";

const TypeCard = ({
	icon,
	title,
	description,
	onClick,
	isHovered,
	onHover,
	index,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
	isHovered: boolean;
	onHover: (hover: boolean) => void;
	index: number;
}) => (
	<button
		onClick={onClick}
		onMouseEnter={() => onHover(true)}
		onMouseLeave={() => onHover(false)}
		className={`
			relative overflow-hidden group
			bg-black p-[1px]
			transform transition-all duration-500 ease-out
			${isHovered ? 'translate-x-2 -translate-y-2' : ''}
		`}
	>
		{/* Outlined border wrapper */}
		<div className='absolute inset-0 border-1 border-white/10 group-hover:border-white/30 transition-colors duration-500 z-0' />

		{/* Inner gradient */}
		<div 
			className={`
				absolute inset-0 z-0
				bg-gradient-to-br 
				${index === 0 ? 'from-purple-500/10 to-transparent' : 'from-blue-500/10 to-transparent'}
				opacity-0 group-hover:opacity-100 transition-opacity duration-500
			`}
		/>

		{/* Actual content */}
		<div className='relative z-10 p-12 flex flex-col items-start h-full'>
			<div className={`mb-8 relative ${isHovered ? 'animate-pulse' : ''}`}>
				<div className='absolute inset-0 bg-white/5 blur-xl scale-150 rounded-xl' />
				<div className='relative border border-white/20 p-4 bg-black/50 backdrop-blur-sm rounded-xl'>
					{icon}
				</div>
			</div>

			<h3 className='text-2xl font-black tracking-tighter mb-4 uppercase'>{title}</h3>

			<div className='flex-1'>
				<p className='text-white/70 text-sm leading-relaxed'>{description}</p>
			</div>

			<div className={`
				mt-8 w-full h-px bg-gradient-to-r from-white/20 to-transparent
				transform origin-left transition-transform duration-500
				${isHovered ? 'scale-x-100' : 'scale-x-0'}
			`} />

			<div className={`
				absolute top-4 right-4 text-8xl font-black text-white/5
				transform transition-transform duration-700
				${isHovered ? 'translate-x-2 translate-y-2' : ''}
			`}>
				{index + 1}
			</div>
		</div>
	</button>
);

interface Step1ChooseTypeProps {
	onSelectType: (type: InfluencerType) => void;
}

const Step1ChooseType: React.FC<Step1ChooseTypeProps> = ({ onSelectType }) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div className='relative overflow-x-hidden'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-white/5 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 blur-3xl' />

			<div className='relative z-10'>
				<div className='mb-16'>
					<div className='flex items-baseline gap-4 mb-6'>
						<div className='w-20 h-px bg-gradient-to-r from-white/50 to-transparent' />
						<span className='text-white/30 text-xs tracking-[0.3em] uppercase'>Initialize</span>
					</div>

					<h1 className='text-6xl font-black tracking-tighter leading-none mb-4'>
						<span className='text-white/90'>ARCHITECT</span>
						<br />
						<span className='text-white/60'>YOUR INFLUENCE</span>
					</h1>

					<div className='flex items-center gap-6 mt-8'>
						<div className='flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent' />
						<p className='text-white/40 text-sm uppercase tracking-wider'>
							Select operational mode
						</p>
						<div className='flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent' />
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					<TypeCard
						icon={<User className='w-10 h-10 text-purple-400' />}
						title='Lifestyle Persona'
						description='An autonomous influencer that builds a personal brand, history, and narrative over time.'
						onClick={() => onSelectType("lifestyle")}
						isHovered={hoveredIndex === 0}
						onHover={(hover) => setHoveredIndex(hover ? 0 : null)}
						index={0}
					/>
					<TypeCard
						icon={<Briefcase className='w-10 h-10 text-blue-400' />}
						title='Brand Ambassador'
						description='A marketing-focused influencer designed to promote specific products or a company.'
						onClick={() => onSelectType("company")}
						isHovered={hoveredIndex === 1}
						onHover={(hover) => setHoveredIndex(hover ? 1 : null)}
						index={1}
					/>
				</div>

				<div className='mt-16 flex justify-center'>
					<div className='flex items-center gap-2'>
						<div className='w-8 h-px bg-white/20' />
						<div className='w-2 h-2 bg-white/30 rotate-45' />
						<div className='w-8 h-px bg-white/20' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step1ChooseType;