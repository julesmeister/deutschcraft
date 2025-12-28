import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkOtherTables() {
  try {
    const subResult = await db.execute("SELECT COUNT(*) as count FROM submissions");
    console.log(`Total 'submissions' table count: ${subResult.rows[0].count}`);

    const playgroundResult = await db.execute("SELECT COUNT(*) as count FROM playground_writings");
    console.log(`Total 'playground_writings' table count: ${playgroundResult.rows[0].count}`);
    
    // Check if 'submissions' has any content
    if (Number(subResult.rows[0].count) > 0) {
      const sample = await db.execute("SELECT * FROM submissions LIMIT 1");
      console.log("Sample 'submissions' row:", sample.rows[0]);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

checkOtherTables();
