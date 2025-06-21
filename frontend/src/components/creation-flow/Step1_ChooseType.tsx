import React from "react";
import { User, Briefcase } from "lucide-react";

export type InfluencerType = "lifestyle" | "company";

const TypeCard = ({
	icon,
	title,
	description,
	onClick,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
}) => (
	<button
		onClick={onClick}
		className='bg-white/5 border border-white/10 p-8 rounded-2xl text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-start h-full'
	>
		<div className='bg-gradient-to-br from-white/10 to-white/0 p-3 rounded-xl mb-4 border border-white/10'>
			{icon}
		</div>
		<h3 className='text-xl font-bold mb-2 tracking-tight'>{title}</h3>
		<p className='text-white/60 text-sm flex-1'>{description}</p>
	</button>
);

interface Step1ChooseTypeProps {
	onSelectType: (type: InfluencerType) => void;
}

const Step1ChooseType: React.FC<Step1ChooseTypeProps> = ({ onSelectType }) => {
	return (
		<>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-bold tracking-tighter'>
					Choose Your Influencer's Path
				</h1>
				<p className='text-white/50 mt-2'>
					What's the primary purpose of this AI personality?
				</p>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<TypeCard
					icon={<User className='w-8 h-8 text-purple-400' />}
					title='Lifestyle Persona'
					description='An autonomous influencer that builds a personal brand, history, and narrative over time.'
					onClick={() => onSelectType("lifestyle")}
				/>
				<TypeCard
					icon={<Briefcase className='w-8 h-8 text-blue-400' />}
					title='Brand Ambassador'
					description='A marketing-focused influencer designed to promote specific products or a company.'
					onClick={() => onSelectType("company")}
				/>
			</div>
		</>
	);
};

export default Step1ChooseType;
