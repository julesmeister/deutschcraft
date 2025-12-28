import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkSchema() {
  console.log("Checking table schema for teacher_reviews...");
  try {
    const result = await db.execute("PRAGMA table_info(teacher_reviews)");
    console.log(result.rows);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkSchema();
