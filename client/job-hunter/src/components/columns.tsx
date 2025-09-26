"use client";

import { ColumnDef } from "@tanstack/react-table";

export type JobAd = {
	url: string;
	companyName: string;
	jobTitle: string;
	processedAt: string;
	status: "pending" | "processing" | "success" | "error";
};

export const columns: ColumnDef<JobAd>[] = [
	{
		accessorKey: "url",
		header: "Job url",
	},
	{
		accessorKey: "companyName",
		header: "Company",
	},
	{
		accessorKey: "jobTitle",
		header: "Role",
	},
	{
		accessorKey: "processedAt",
		header: "Processed At",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
];
