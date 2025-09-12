import { Router, Request, Response } from "express";
import job_ads from "./job_ads.js";

const router: Router = Router();

// api health check
router.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

// redirect all route to job_ads
router.use("/jobs", job_ads);

export default router;
