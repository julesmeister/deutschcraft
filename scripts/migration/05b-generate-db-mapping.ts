import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { normalizeToSlug } from "../../lib/utils/flashcardIdGenerator";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const OUTPUT_FILE = path.join(
  process.cwd(),
  "scripts/migration/db-migration-mapping.json"
);
const LEVELS_DIR = path.join(process.cwd(), "lib/data/vocabulary/levels");
const LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];

interface Flashcard {
  id: string;
  german: string;
  english: string;
  level: string;
}

function generateKey(german: string, english: string, level: string): string {
  if (!german || !english || !level) {
    // console.warn('Missing data for key generation:', { german, english, level });
    return "";
  }
  return `${normalizeToSlug(german)}|${normalizeToSlug(
    english
  )}|${level.toLowerCase()}`;
}

async function generateDbMapping() {
  console.log("📖 Loading JSON vocabulary...");
  const lookup = new Map<string, string>(); // key -> newId
  let jsonCount = 0;

  for (const level of LEVELS) {
    const filePath = path.join(LEVELS_DIR, `${level}.json`);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    if (data.flashcards) {
      for (const card of data.flashcards) {
        const key = generateKey(card.german, card.english, card.level);
        lookup.set(key, card.id);
        jsonCount++;
      }
    }
  }
  console.log(`   Loaded ${jsonCount} flashcards from JSON files`);

  console.log("🔌 Connecting to Turso...");
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log("📥 Fetching vocabulary from DB...");
  const result = await db.execute("SELECT * FROM vocabulary");
  const rows = result.rows;
  console.log(`   Found ${rows.length} vocabulary records in DB`);

  const mapping: Record<string, string> = {};
  const stats = {
    total: rows.length,
    mapped: 0,
    unmapped: 0,
    alreadyCorrect: 0,
  };

  const unmappedRecords: any[] = [];

  for (const row of rows) {
    const oldId = row.word_id as string;
    const german = row.german_word as string;
    const english = row.english_translation as string;
    const level = row.level as string;

    const key = generateKey(german, english, level);
    const newId = lookup.get(key);

    if (newId) {
      if (oldId === newId) {
        stats.alreadyCorrect++;
        // We still add it to mapping to be safe/consistent, or maybe strictly map changes?
        // Let's add it so lookups always succeed.
        mapping[oldId] = newId;
      } else {
        mapping[oldId] = newId;
        stats.mapped++;
      }
    } else {
      stats.unmapped++;
      unmappedRecords.push({ oldId, german, english, level });
    }
  }

  // Also add mappings for FLASH_ prefixes
  const flashMapping: Record<string, string> = {};
  for (const [oldId, newId] of Object.entries(mapping)) {
    flashMapping[`FLASH_${oldId}`] = newId; // Map FLASH_old -> new (without FLASH_)
    // Note: The new system says "No FLASH_ prefix needed", so we map to the raw newId.
  }

  const finalMapping = {
    ...mapping,
    ...flashMapping,
  };

  const outputData = {
    generatedAt: new Date().toISOString(),
    stats,
    mapping: finalMapping,
    unmappedRecords: unmappedRecords.slice(0, 20), // Sample
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
  console.log(`💾 Saved mapping to ${OUTPUT_FILE}`);
  console.log("📊 Stats:", stats);

  if (stats.unmapped > 0) {
    console.log("\n⚠️  Sample unmapped records:");
    unmappedRecords.slice(0, 5).forEach((r) => console.log(r));
  }
}

generateDbMapping().catch(console.error);
