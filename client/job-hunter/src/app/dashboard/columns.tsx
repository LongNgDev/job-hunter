"use client";

import { ColumnDef } from "@tanstack/react-table";

export type JobAd = {
	id: string;
	companyName: string;
	jobTitle: string;
	processedAt: string;
	status: string;
};

export const columns: ColumnDef<JobAd>[] = [
	{ accessorKey: "id", header: "ID" },
	{ accessorKey: "companyName", header: "Company" },
	{ accessorKey: "jobTitle", header: "Role" },
	{ accessorKey: "processedAt", header: "Processed at" },
	{ accessorKey: "status", header: "Status" },
];
