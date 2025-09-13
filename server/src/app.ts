import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import api from "./routes/index.js";
import { initProducer } from "./kafka/producer.js";

const app = express();
app.use(express.json());

// mount all route under /api
app.use("/api", api);

// Health check
app.use("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "OK" });
});

// 404
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Not Found" });
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err.message);
	res
		.status(err.status || 500)
		.json({ error: err.message || "Internal Error" });
});

app.listen(env.port, async () => {
	console.log(`http://localhost:${env.port}`);
	await initProducer(); // connect Kafka producer
});
