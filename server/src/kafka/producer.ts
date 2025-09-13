import { Partitioners } from "kafkajs";
import { kafka } from "./client.js";

export const producer = kafka.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});

export async function initProducer() {
	await producer.connect();
	console.log("✅ Kafka producer connected");
}
