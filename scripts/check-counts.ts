import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkCounts() {
  try {
    const subResult = await db.execute("SELECT COUNT(*) as count FROM writing_submissions");
    console.log(`Total writing submissions: ${subResult.rows[0].count}`);

    const reviewResult = await db.execute("SELECT COUNT(*) as count FROM teacher_reviews");
    console.log(`Total teacher reviews: ${reviewResult.rows[0].count}`);
    
    // List all submissions to see dates and IDs
    const listResult = await db.execute("SELECT submission_id, created_at FROM writing_submissions ORDER BY created_at DESC");
    console.log("Submissions list:", listResult.rows);

  } catch (error) {
    console.error("Error:", error);
  }
}

checkCounts();
