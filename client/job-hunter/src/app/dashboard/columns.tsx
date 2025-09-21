"use client";

import { ColumnDef } from "@tanstack/react-table";

export type JobAd = {
	url: string;
	companyName: string;
	jobTitle: string;
	processedAt: string;
	status: string;
};

export const columns: ColumnDef<JobAd>[] = [
	{ accessorKey: "url", header: "Job url" },
	{ accessorKey: "companyName", header: "Company" },
	{ accessorKey: "jobTitle", header: "Role" },
	{ accessorKey: "processedAt", header: "Processed at" },
	{ accessorKey: "status", header: "Status" },
];
