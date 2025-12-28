import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listTables() {
  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables in Turso:", result.rows.map(r => r.name));
  } catch (error) {
    console.error("Error:", error);
  }
}

listTables();
