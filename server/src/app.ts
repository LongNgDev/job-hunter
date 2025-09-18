import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env.js";
import api from "./routes/index.js";
import { initProducer } from "./kafka/producer.js";
import { initSubscriber } from "./redis/subscriber.js";
import cors from "cors";

const app = express();
app.use(express.json());

// allow your Next.js dev origin
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true, // if you plan to send cookies/auth
	})
);

// optional: handle preflight explicitly (some hosts need this)
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header(
		"Access-Control-Allow-Methods",
		"GET,POST,PUT,PATCH,DELETE,OPTIONS"
	);
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Credentials", "true");
	if (req.method === "OPTIONS") return res.sendStatus(204);
	next();
});

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
	await initSubscriber(); //connect Redis subsciber
});
