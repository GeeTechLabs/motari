import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

function initDb() {
  const sql = neon(env.databaseUrl);
  return drizzle(sql, { schema: fullSchema });
}

let instance: ReturnType<typeof initDb>;

export function getDb() {
  if (!instance) {
    instance = initDb();
  }
  return instance;
}
