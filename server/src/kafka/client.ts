import { Kafka } from "kafkajs";

const brokers = process.env.KAFKA_BROKERS?.split(",") ?? [
	"localhost:19092",
	"localhost:29092",
	"localhost:39092",
]; // ← host

export const kafka = new Kafka({
	clientId: "job-hunter-api",
	brokers,
});
