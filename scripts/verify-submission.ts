import { db } from "../turso/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function verifySubmission() {
  const submissionId = "vZ1J1uyh7PSHwXzLvWMT";
  console.log(`Checking Turso for submission ID: ${submissionId}`);

  try {
    // Check writing_submissions
    const submissionResult = await db.execute({
      sql: "SELECT * FROM writing_submissions WHERE submission_id = ?",
      args: [submissionId],
    });

    if (submissionResult.rows.length === 0) {
      console.log("❌ Submission NOT FOUND in writing_submissions table.");
    } else {
      console.log("✅ Submission FOUND in writing_submissions table:");
      console.log(submissionResult.rows[0]);
    }

    // Check teacher_reviews
    const reviewResult = await db.execute({
      sql: "SELECT * FROM teacher_reviews WHERE submission_id = ?",
      args: [submissionId],
    });

    if (reviewResult.rows.length === 0) {
      console.log("❌ Review NOT FOUND in teacher_reviews table.");
    } else {
      console.log("✅ Review FOUND in teacher_reviews table:");
      console.log(reviewResult.rows[0]);
    }
  } catch (error) {
    console.error("Error querying Turso:", error);
  }
}

verifySubmission();
