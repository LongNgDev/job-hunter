import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { validate } from "../middleware/validate.js";
import { JobAdSchema } from "../schema/jobAds.schema.js";
import { producer } from "../kafka/producer.js";

const router: Router = Router();

type JobAd = {
	id: string;
	url: string;
	companyName?: string;
	recruiterName?: string;
	jobTitle: string;
	jobDescription: string;
	salaryStart?: number;
	salaryEnd?: number;
	openDay: Date;
	closeDay: Date;
};

const JOBS = new Map<string, JobAd>();

// health check
router.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "OK" });
});

/* follow CRUD Method */
// CREATE
router.post("/", validate(JobAdSchema), async (req: Request, res: Response) => {
	const id = uuidv4();
	const newJob = {
		id,
		...req.body,
	};

	// Produce to Kafka
	await producer.send({
		topic: "job.created",
		messages: [{ key: id, value: JSON.stringify(newJob) }],
	});

	console.log(newJob);

	// JOBS.set(id, newJob);
	res.status(201).json(newJob);
});

// RETRIEVE

// retrieve all entries
router.get("/", (_req: Request, res: Response) => {
	res.status(200).json(Array.from(JOBS.values()));
});

// retrieve entry by id
router.get("/:id", (req: Request, res: Response) => {
	const job = JOBS.get(req.params.id as string);
	job
		? res.status(200).json(job)
		: res.status(404).json({ error: "Not found" });
});

// retrieve entry by search query (add later)

// tailor schema for just update only field that need
const JobAdPatchSchema = JobAdSchema.partial().refine(
	(d) =>
		d.salaryStart == null ||
		d.salaryEnd == null ||
		d.salaryEnd >= d.salaryStart,
	{ message: "salaryEnd must be ≥ salaryStart." }
);

// UPDATE
router.patch(
	"/:id",
	validate(JobAdPatchSchema),
	(req: Request, res: Response) => {
		const job = JOBS.get(req.params.id as string);

		// not found handler
		if (!job) {
			return res.status(404).json({ error: "Not found" });
		}

		const updated_job = { ...job, ...req.body };
		JOBS.set(req.params.id as string, updated_job);
		res.status(200).json({ updated_job });
	}
);

// DELETE
router.delete("/:id", (req: Request, res: Response) => {
	// not found handler
	if (!JOBS.has(req.params.id as string)) {
		return res.status(404).json({ error: "Not found" });
	}
	JOBS.delete(req.params.id as string);
	res.status(204).send();
});

export default router;
