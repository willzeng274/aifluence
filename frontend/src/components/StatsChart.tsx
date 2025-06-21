"use client";

import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

type Props = {
	data: { month: string; followers: number }[];
};

const StatsChart = ({ data }: Props) => {
	return (
		<ResponsiveContainer width='100%' height={250}>
			<AreaChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}
			>
				<defs>
					<linearGradient
						id='colorFollowers'
						x1='0'
						y1='0'
						x2='0'
						y2='1'
					>
						<stop
							offset='5%'
							stopColor='#8884d8'
							stopOpacity={0.8}
						/>
						<stop
							offset='95%'
							stopColor='#8884d8'
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray='3 3'
					stroke='rgba(255, 255, 255, 0.1)'
				/>
				<XAxis
					dataKey='month'
					stroke='rgba(255, 255, 255, 0.5)'
					fontSize={12}
				/>
				<YAxis
					stroke='rgba(255, 255, 255, 0.5)'
					fontSize={12}
					tickFormatter={(value) => `${value}M`}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: "rgba(20, 20, 20, 0.8)",
						borderColor: "rgba(255, 255, 255, 0.2)",
						borderRadius: "10px",
					}}
				/>
				<Area
					type='monotone'
					dataKey='followers'
					stroke='#8884d8'
					fill='url(#colorFollowers)'
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default StatsChart;
