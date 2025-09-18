import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const get = (key: string, fallback?: string) => {
	const v = process.env[key];
	if (v === undefined) {
		if (fallback !== undefined) return fallback;
		throw new Error(`Missing env: ${key}`);
	}
	return v;
};

export const env = {
	port: Number(get("PORT", "3000")),
	mongodb: get(
		"MONGO_URI",
		"mongodb://admin:admin@mongo:27017/jobhunter?authSource=admin"
	),
};
