import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import SectionCards from "@/components/section-card";
import { columns, JobAd } from "@/components/columns";
import { DataTable } from "@/components/data-table";

async function getData(): Promise<JobAd[]> {
	const res = await fetch("http://localhost:4000/api/jobs", {
		cache: "no-store",
	});
	if (!res.ok) throw new Error(`Jobs fetch failed: ${res.status}`);
	const raw = await res.json();

	const dataPromises = raw.items.map(
		async ({ url, companyName, jobTitle, processedAt, status }: JobAd) => {
			/* 	const res = await fetch(`http://localhost:4000/api/jobs/${id}/status`, {
				cache: "no-store",
				signal: AbortSignal.timeout(5000),
			});
			const data = await res.json();

			const { status } = data;
 */
			processedAt = new Date(processedAt).toLocaleString("en-AU", {
				timeZone: "Australia/Melbourne",
				dateStyle: "medium",
				timeStyle: "short",
			});

			return { url, companyName, jobTitle, processedAt, status };
		}
	);

	const jobs = await Promise.all(dataPromises);

	return jobs;
}

async function page() {
	const data = await getData();

	return (
		<div className="flex flex-col gap-6 w-dvw p-4 max-w-[100rem] m-auto min-w-md">
			<SectionCards />
			<ChartAreaInteractive />
			<DataTable columns={columns} data={data} />
		</div>
	);
}

export default page;
