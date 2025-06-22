import React from "react";

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
		<polyline points='9 22 9 12 15 12 15 22' />
	</svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
	</svg>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
		<circle cx='12' cy='12' r='3' />
	</svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<line x1='12' y1='5' x2='12' y2='19'></line>
		<line x1='5' y1='12' x2='19' y2='12'></line>
	</svg>
);

const Navbar = ({ onAddClick }: { onAddClick: () => void }) => {
	return (
		<nav className='absolute top-1/2 left-6 -translate-y-1/2 z-20 flex flex-col gap-3'>
			<button className='w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-all'>
				<HomeIcon className='w-6 h-6' />
			</button>
			<button className='w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white/50 hover:bg-white/20 hover:text-white transition-all'>
				<UserIcon className='w-6 h-6' />
			</button>
			<button className='w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white/50 hover:bg-white/20 hover:text-white transition-all'>
				<SettingsIcon className='w-6 h-6' />
			</button>
			<div className='h-[1px] w-8 my-2 bg-white/10 self-center'></div>
			<button
				onClick={onAddClick}
				className='w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/50 to-purple-500/50 backdrop-blur-md border border-white/10 rounded-xl text-white hover:from-blue-500 hover:to-purple-500 transition-all'
			>
				<PlusIcon className='w-6 h-6' />
			</button>
		</nav>
	);
};

export default Navbar;
