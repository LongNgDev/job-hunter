import z from "zod";

export const JobAdSchema = z
	.object({
		url: z.url(),
		jobTitle: z.string().min(1),
		jobDescription: z.string().min(1),
		companyName: z.string().min(1).optional(),
		recruiterName: z.string().min(1).optional(),
		salaryStart: z.number().nonnegative().optional(),
		salaryEnd: z.number().nonnegative().optional(),
		// allow ISO strings from client, coerce to Date
		openDay: z.coerce.date(),
		closeDay: z.coerce.date(),
	})
	.strict()
	// salaryEnd >= salaryStart (when both present)
	.refine(
		(data) =>
			data.salaryStart == null ||
			data.salaryEnd == null ||
			data.salaryStart <= data.salaryEnd,
		{ message: "salaryEnd must be larger than salaryStart." }
	)
	// openDay ≤ closeDay
	.refine((d) => d.openDay <= d.closeDay, {
		message: "closeDay must be on/after openDay.",
	});
