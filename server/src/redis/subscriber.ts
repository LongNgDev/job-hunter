import { redis } from "./client.js";

const CHANNEL = "job.status";

export const subscriber = redis;

export async function initSubscriber() {
	await subscriber.on("connect", () =>
		console.log("✅ Redis subscriber connected")
	);

	redis.subscribe(CHANNEL, (err, count) => {
		if (err) return console.error("[sub] subscribe failed:", err);
		console.log(`Subscriber listening on ${CHANNEL}`);
	});
}
