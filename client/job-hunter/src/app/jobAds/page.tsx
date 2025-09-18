import { columns, JobAd } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<JobAd[]> {
	const res = await fetch("http://localhost:4000/api/jobs", {
		cache: "no-store",
	});
	if (!res.ok) throw new Error(`Jobs fetch failed: ${res.status}`);
	const raw = await res.json();

	const dataPromises = raw.items.map(
		async ({ id, companyName, jobTitle, processedAt }: JobAd) => {
			const res = await fetch(`http://localhost:4000/api/jobs/${id}/status`, {
				cache: "no-store",
				signal: AbortSignal.timeout(5000),
			});
			const data = await res.json();

			const { status } = data;

			processedAt = new Date(processedAt).toLocaleString("en-AU", {
				timeZone: "Australia/Melbourne",
				dateStyle: "medium",
				timeStyle: "short",
			});

			return { id, companyName, jobTitle, processedAt, status };
		}
	);

	const jobs = await Promise.all(dataPromises);

	return jobs;
}

export default async function DemoPage() {
	const data = await getData();

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={data} />
		</div>
	);
}
