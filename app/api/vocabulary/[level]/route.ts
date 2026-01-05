import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import path from "path";
import fs from "fs/promises";
import { CEFRLevel } from "@/lib/models/cefr";

// Cache vocabulary data for 1 hour (static content that rarely changes)
const getCachedVocabularyLevel = unstable_cache(
  async (level: string) => {
    // Construct split directory path
    const splitDir = path.join(
      process.cwd(),
      "lib",
      "data",
      "vocabulary",
      "split",
      level.toLowerCase()
    );

    // Read _index.json
    const indexFilePath = path.join(splitDir, "_index.json");
    let indexData;

    try {
      const indexContent = await fs.readFile(indexFilePath, "utf-8");
      indexData = JSON.parse(indexContent);
    } catch (error) {
      // Fallback to monolithic file if split index doesn't exist (migration safety)
      const legacyFilePath = path.join(
        process.cwd(),
        "lib",
        "data",
        "vocabulary",
        "levels",
        `${level.toLowerCase()}.json`
      );
      const fileContent = await fs.readFile(legacyFilePath, "utf-8");
      return JSON.parse(fileContent);
    }

    // Aggregate flashcards from all categories
    const allFlashcards = [];

    if (indexData && indexData.categories) {
      // Read all category files in parallel
      const filePromises = indexData.categories.map(async (cat: any) => {
        if (!cat.file) return [];
        const catFilePath = path.join(splitDir, cat.file);
        try {
          const catContent = await fs.readFile(catFilePath, "utf-8");
          const catData = JSON.parse(catContent);
          return catData.flashcards || [];
        } catch (e) {
          console.error(`Failed to read category file ${cat.file}`, e);
          return [];
        }
      });

      const results = await Promise.all(filePromises);
      results.forEach((cards) => allFlashcards.push(...cards));
    }

    return {
      level: level,
      flashcards: allFlashcards,
      totalCards: allFlashcards.length,
    };
  },
  ["vocabulary-level"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["vocabulary"],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level: levelParam } = await params;
    const level = levelParam.toUpperCase();

    // Validate level
    if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
      return NextResponse.json(
        { error: "Invalid CEFR level" },
        { status: 400 }
      );
    }

    // Fetch from cache (or compute and cache if not present)
    const data = await getCachedVocabularyLevel(level);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in vocabulary API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
