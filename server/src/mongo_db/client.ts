import { MongoClient } from "mongodb";

import { env } from "../config/env.js";

export const client = new MongoClient(env.mongodb);
