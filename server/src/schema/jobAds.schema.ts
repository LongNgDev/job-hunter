import z from "zod";

export const JobAdSchema = z
	.object({
		url: z.url(),
		jobTitle: z.string().min(1),
		jobDescription: z.string().min(1),
		companyName: z.string().min(1).optional(),
		recruiterName: z.string().min(1).optional(),
		salaryStart: z.number().nonnegative().optional().nullable(),
		salaryEnd: z.number().nonnegative().optional().nullable(),
		// allow ISO strings from client, coerce to Date
		openDate: z.coerce.date().optional().nullable(),
		closeDate: z.coerce.date().optional().nullable(),
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
	// openDate ≤ closeDate
	.refine(
		(data) =>
			data.openDate == null ||
			data.closeDate == null ||
			data.openDate <= data.closeDate,
		{
			message: "closeDate must be on/after openDate.",
		}
	);
