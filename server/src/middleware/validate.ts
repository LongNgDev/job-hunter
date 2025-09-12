import type { NextFunction, Request, Response } from "express";
import { ZodType, z } from "zod";

export const validate =
	(schema: ZodType) =>
	(err: any, req: Request, res: Response, next: NextFunction) => {
		const parsed = schema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ errors: z.treeifyError(err) });
		}
		req.body = parsed.data;
		next();
	};
