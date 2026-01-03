import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../turso/client";

async function fixEnrollmentStatusColumn() {
  console.log("Checking for enrollment_status column in users table...");

  try {
    // Try to select the column to see if it exists
    await db.execute("SELECT enrollment_status FROM users LIMIT 1");
    console.log("Column enrollment_status ALREADY EXISTS.");
  } catch (e) {
    console.log("Column enrollment_status MISSING. Adding it now...");
    try {
      // Add the column
      await db.execute(
        "ALTER TABLE users ADD COLUMN enrollment_status TEXT DEFAULT 'not_submitted'"
      );
      console.log("Column enrollment_status ADDED successfully.");

      // Verify
      try {
        await db.execute("SELECT enrollment_status FROM users LIMIT 1");
        console.log("Verification successful: Column now exists.");
      } catch (verifyError) {
        console.error("Verification failed:", verifyError);
      }
    } catch (alterError) {
      console.error("Failed to add column:", alterError);
    }
  }
}

fixEnrollmentStatusColumn()
  .then(() => console.log("Done"))
  .catch((err) => console.error("Script failed:", err));
