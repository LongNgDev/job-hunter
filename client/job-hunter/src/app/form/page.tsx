"use client";

import { useState } from "react";

type FormData = {
	url: string;
	companyName: string;
	recruiterName: string;
	jobTitle: string;
	jobDescription: string;
	salaryStart: number;
	salaryEnd: number;
	openDate: Date | undefined;
	closeDate: Date | undefined;
};

const initialData: FormData = {
	url: "",
	companyName: "",
	recruiterName: "",
	jobTitle: "",
	jobDescription: "",
	salaryStart: 0,
	salaryEnd: 0,
	openDate: undefined,
	closeDate: undefined,
};

export default function Form() {
	const [data, setData] = useState<FormData>(initialData);
	const [submitting, setSubmitting] = useState(false);

	// helper: update any field in the object state
	const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
		setData((d) => ({ ...d, [key]: value }));

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);

		// IMPORTANT: Dates + undefined handling before sending
		const payload = serializeForApi(data);

		console.log(payload);

		try {
			const res = await fetch("http://localhost:4000/api/jobs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed to submit");
			alert("🎉 Job saved!");
			setData(initialData);
		} catch (err: unknown) {
			alert(err ?? "Submit failed");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold">Create Job</h1>

			<form onSubmit={onSubmit} className="space-y-4">
				{/* URL / Company / Recruiter */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm font-medium mb-1">Job URL</label>
						<input
							className="w-full rounded border p-2"
							value={data.url}
							onChange={(e) => setField("url", e.target.value)}
							placeholder="https://www.seek.com.au/job/..."
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Company Name
						</label>
						<input
							className="w-full rounded border p-2"
							value={data.companyName}
							onChange={(e) => setField("companyName", e.target.value)}
							placeholder="Acme Pty Ltd"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Recruiter Name
						</label>
						<input
							className="w-full rounded border p-2"
							value={data.recruiterName}
							onChange={(e) => setField("recruiterName", e.target.value)}
							placeholder="Jane Doe"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Job Title</label>
						<input
							className="w-full rounded border p-2"
							value={data.jobTitle}
							onChange={(e) => setField("jobTitle", e.target.value)}
							placeholder="Junior Software Engineer"
						/>
					</div>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium mb-1">
						Job Description
					</label>
					<textarea
						className="w-full rounded border p-2 min-h-[120px]"
						value={data.jobDescription}
						onChange={(e) => setField("jobDescription", e.target.value)}
						placeholder="What you'll do, requirements, stack, etc."
					/>
				</div>

				{/* Salary */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm font-medium mb-1">
							Salary Start
						</label>
						<input
							type="text"
							inputMode="numeric"
							min={0}
							className="w-full rounded border p-2"
							value={data.salaryStart}
							onChange={(e) => setField("salaryStart", Number(e.target.value))}
							placeholder="80000"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Salary End</label>
						<input
							type="text"
							inputMode="numeric"
							min={0}
							pattern="[0-9]*"
							className="w-full rounded border p-2"
							value={data.salaryEnd}
							onChange={(e) => setField("salaryEnd", Number(e.target.value))}
							placeholder="100000"
						/>
					</div>
				</div>

				{/* Dates */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-sm font-medium mb-1">
							Open Date (optional)
						</label>
						<input
							type="date"
							className="w-full rounded border p-2"
							value={data.openDate ? toInputDate(data.openDate) : ""}
							onChange={(e) =>
								setField(
									"openDate",
									e.target.value ? new Date(e.target.value) : undefined
								)
							}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Close Date (optional)
						</label>
						<input
							type="date"
							className="w-full rounded border p-2"
							value={data.closeDate ? toInputDate(data.closeDate) : ""}
							onChange={(e) =>
								setField(
									"closeDate",
									e.target.value ? new Date(e.target.value) : undefined
								)
							}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<button
						type="reset"
						onClick={() => setData(initialData)}
						className="px-4 py-2 border rounded"
					>
						Reset
					</button>
					<button
						type="submit"
						disabled={submitting}
						className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
					>
						{submitting ? "Submitting…" : "Submit"}
					</button>
				</div>
			</form>
		</div>
	);
}

/* ---- utils ---- */

// convert Date -> yyyy-mm-dd string for <input type="date">
function toInputDate(d: Date) {
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 10);
}

// convert for API: Dates -> ISO string, undefined -> null (so DB can store explicit null)
function serializeForApi(d: FormData) {
	return {
		...d,
		openDate: d.openDate ? d.openDate.toISOString() : null,
		closeDate: d.closeDate ? d.closeDate.toISOString() : null,
	};
}
