import "dotenv/config";

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
};
