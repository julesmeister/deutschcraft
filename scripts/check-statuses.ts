import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkStatuses() {
  try {
    const result = await db.execute("SELECT status, COUNT(*) as count FROM writing_submissions GROUP BY status");
    console.log("Status distribution:", result.rows);
    
    const correctionStats = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ai_corrected_version IS NOT NULL THEN 1 ELSE 0 END) as has_ai,
        SUM(CASE WHEN teacher_score IS NOT NULL THEN 1 ELSE 0 END) as has_teacher
      FROM writing_submissions
    `);
    console.log("Correction stats:", correctionStats.rows[0]);

  } catch (error) {
    console.error("Error:", error);
  }
}

checkStatuses();
