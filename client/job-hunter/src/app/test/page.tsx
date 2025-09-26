import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import SectionCards from "@/components/section-card";
import React from "react";

function page() {
	return (
		<div className="flex flex-col gap-4 w-dvw p-4">
			<SectionCards />
			<ChartAreaInteractive />
		</div>
	);
}

export default page;
