import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "ioredis";
import { validate } from "../middleware/validate.js";
import { JobAdSchema } from "../schema/jobAds.schema.js";
import { producer } from "../kafka/producer.js";
import { client } from "../mongo_db/client.js";

/* ---------------------------------- Setup --------------------------------- */

const router: Router = Router();

// Redis (use a single client; ioredis auto-reconnects)
const REDIS_URI = process.env.REDIS_URI ?? "redis://:admin@localhost:6379/0";
const redis = new Redis(REDIS_URI);

// Mongo
await client
	.connect()
	.then(() => console.log("✅ MongoDB producer connected"))
	.catch((err) => console.warn("⚠️ MongoDB connect warning:", err));

const db = client.db("jobhunter");
const col = db.collection("jobs");

// Types for our job document
type JobAd = {
	_id?: string; // Mongo’s internal id (stringified in API responses)
	id: string; // our public id (uuid)
	url: string;
	companyName?: string;
	recruiterName?: string;
	jobTitle: string;
	jobDescription: string;
	salaryStart?: number;
	salaryEnd?: number;
	openDate?: Date;
	closeDate?: Date;
};

/* ---------------------------- Helper Utilities ---------------------------- */

// Parse numbers from query with sensible defaults and caps
const parseIntSafe = (val: unknown, dflt: number) => {
	const n = parseInt(String(val ?? ""), 10);
	return Number.isFinite(n) ? n : dflt;
};

/* --------------------------------- Health --------------------------------- */

// Health check (no DB/Redis touch)
router.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ status: "OK" });
});

/* --------------------------------- Status --------------------------------- */
/**
 * GET /:id/status
 * Read processing status from Redis hash at key `job:<id>`.
 * - progress is coerced to number if present
 * - result is JSON-parsed if present
 */
router.get("/:id/status", async (req: Request, res: Response) => {
	const key = `job:${req.params.id}`;
	const data = await redis.hgetall(key);

	// Not found -> return clean 404
	if (!data || Object.keys(data).length === 0) {
		return res.status(404).json({ message: "Status not found" });
	}

	// Coerce progress
	if (data.progress != null) {
		(data as any).progress = Number(data.progress);
	}
	// Try parsing result
	if (data.result) {
		try {
			(data as any).result = JSON.parse(data.result);
		} catch {
			/* leave as string if invalid JSON */
		}
	}

	return res.status(200).json(data);
});

/* --------------------------------- Create --------------------------------- */
/**
 * POST /
 * Validate payload with JobAdSchema, generate uuid `id`,
 * produce event to Kafka topic `job.created`, respond 201 with the created envelope (not yet saved by worker).
 */
router.post("/", validate(JobAdSchema), async (req: Request, res: Response) => {
	const id = uuidv4();
	const url: string = req.body.url;

	const isExist = await col.findOne({ url: url });

	if (isExist) {
		return res.status(409).json({ Error: "Data already existed!" });
	}

	const newJob: JobAd = {
		id,
		...req.body,
	};

	// Fire-and-forget to Kafka (await to surface errors)
	await producer.send({
		topic: "job.created",
		messages: [{ key: url, value: JSON.stringify(newJob) }],
	});

	return res.status(201).json(newJob);
});

/* --------------------------------- List ----------------------------------- */
/**
 * GET /
 * Paginated list (page, limit) ordered by most recent _id.
 * NOTE: estimatedDocumentCount is fast but approximate; good enough for listing.
 */
router.get("/", async (req: Request, res: Response) => {
	const limit = Math.min(Math.max(parseIntSafe(req.query.limit, 20), 1), 100);
	const page = Math.max(parseIntSafe(req.query.page, 1), 1);
	const skip = (page - 1) * limit;

	const cursor = col
		.find(
			{},
			{
				projection: {
					// Example: hide large fields in list views
					// jobDescription: 0,
				},
			}
		)
		.sort({ _id: -1 })
		.skip(skip)
		.limit(limit);

	const [items, total] = await Promise.all([
		cursor.toArray(),
		col.estimatedDocumentCount(),
	]);

	return res.status(200).json({ items, page, limit, total });
});

/* -------------------------------- Retrieve -------------------------------- */
/**
 * GET /:id
 * Retrieve a single job by public `id` (uuid). 404 if not found.
 */
router.get("/:id", async (req: Request, res: Response) => {
	const job = await col.findOne<JobAd>({ id: req.params.id });
	if (!job) {
		return res.status(404).json({ message: "Job not found" });
	}
	return res.status(200).json(job);
});

/* --------------------------------- Update --------------------------------- */
// Build a PATCH schema from the create schema; also enforce salaryEnd >= salaryStart if both provided.
const JobAdPatchSchema = JobAdSchema.partial().refine(
	(d) =>
		d.salaryStart == null ||
		d.salaryEnd == null ||
		d.salaryEnd >= d.salaryStart,
	{ message: "salaryEnd must be ≥ salaryStart." }
);

/**
 * PATCH /:id
 * Partial update by public `id`. Prevents changing `id` / `_id`.
 * Returns the updated document.
 */
router.patch(
	"/:id",
	validate(JobAdPatchSchema),
	async (req: Request, res: Response) => {
		// Never allow id swaps through patch
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id: _ignoreId, _id: _ignoreMongoId, ...safeBody } = req.body ?? {};

		col
			.findOneAndUpdate(
				{ id: req.params.id },
				{ $set: safeBody },
				{ returnDocument: "after", ignoreUndefined: true }
			)
			.then((data) => {
				res.status(200).json(data);
			})
			.catch((err) => {
				res.status(404).json(err);
			});
	}
);

/* --------------------------------- Delete --------------------------------- */
/**
 * DELETE /:id
 * Soft vs hard delete: here we do a hard delete by `id`.
 * Respond 204 on success; 404 if not found (optional behavior).
 */
router.delete("/:id", async (req: Request, res: Response) => {
	const result = await col.findOneAndDelete({
		id: req.params.id,
	});
	const deleted = result?.value;

	// If you prefer 404 on missing:
	if (!deleted) return res.status(404).json({ message: "Job not found" });

	return res.status(204).send();
});

/* ------------------------------ Error Handler ----------------------------- */
/**
 * Centralized error handler to avoid “headers already sent” pitfalls.
 * Make sure this is the LAST middleware exported/used for this router.
 */
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	if (res.headersSent) return; // delegate to default handler if already started
	console.error("Router error:", err);
	return res
		.status(err?.status || 500)
		.json({ error: err?.message ?? "Internal Server Error" });
});

export default router;
