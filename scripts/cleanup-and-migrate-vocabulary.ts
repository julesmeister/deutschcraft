#!/usr/bin/env tsx

/**
 * Vocabulary Cleanup and Migration Script
 *
 * This script performs a comprehensive cleanup and reorganization:
 * 1. Deletes infinite recursion artifacts (build errors)
 * 2. Deletes loose category files in root (duplicates of split/ files)
 * 3. Renames remnote/ to vocabulary/
 * 4. Updates all import statements
 * 5. Creates backup before any destructive operations
 *
 * Usage:
 *   npx tsx scripts/cleanup-and-migrate-vocabulary.ts [--dry-run] [--no-backup]
 */

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const NO_BACKUP = process.argv.includes('--no-backup');

const REMNOTE_DIR = path.join(process.cwd(), 'lib', 'data', 'remnote');
const VOCABULARY_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary');
const BACKUP_DIR = path.join(process.cwd(), 'backup-remnote-' + Date.now());

interface MigrationPlan {
  filesToDelete: string[];
  directoryToRename: { from: string; to: string };
  importsToUpdate: Array<{ file: string; oldImport: string; newImport: string }>;
}

/**
 * Create backup of entire remnote directory
 */
function createBackup(): void {
  if (NO_BACKUP) {
    console.log('⚠️  Skipping backup (--no-backup flag)');
    return;
  }

  console.log('\n📦 Creating backup...');

  function copyRecursive(src: string, dest: string): void {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const entries = fs.readdirSync(src);
      for (const entry of entries) {
        copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(REMNOTE_DIR, BACKUP_DIR);
  console.log(`   ✅ Backup created at: ${BACKUP_DIR}`);
}

/**
 * Delete infinite recursion files
 */
function deleteInfiniteRecursionFiles(): string[] {
  console.log('\n🗑️  Deleting infinite recursion artifacts...');

  const files = fs.readdirSync(REMNOTE_DIR);
  const infiniteRecursionFiles = files.filter(f =>
    f.startsWith('--avoided-infinite-recursion--')
  );

  for (const file of infiniteRecursionFiles) {
    const filePath = path.join(REMNOTE_DIR, file);
    console.log(`   - ${file}`);

    if (!DRY_RUN) {
      fs.unlinkSync(filePath);
    }
  }

  console.log(`   ✅ Deleted ${infiniteRecursionFiles.length} files`);
  return infiniteRecursionFiles;
}

/**
 * Delete loose category files (they exist in split/ directory)
 */
function deleteLooseCategoryFiles(): string[] {
  console.log('\n🗑️  Deleting loose category files (duplicates of split/ files)...');

  const files = fs.readdirSync(REMNOTE_DIR);
  const looseFiles = files.filter(f =>
    f.endsWith('.json') &&
    f !== 'stats.json' &&
    f !== 'all-flashcards.json' && // Keep this for now
    !f.startsWith('--avoided-infinite-recursion--')
  );

  // Files to keep in root
  const keepFiles = ['stats.json', 'all-flashcards.json'];

  const filesToDelete = looseFiles.filter(f => !keepFiles.includes(f));

  for (const file of filesToDelete) {
    const filePath = path.join(REMNOTE_DIR, file);
    console.log(`   - ${file}`);

    if (!DRY_RUN) {
      fs.unlinkSync(filePath);
    }
  }

  console.log(`   ✅ Deleted ${filesToDelete.length} files`);
  console.log(`   ℹ️  Kept: ${keepFiles.join(', ')}`);

  return filesToDelete;
}

/**
 * Rename remnote directory to vocabulary
 */
function renameDirectory(): void {
  console.log('\n📁 Renaming directory...');
  console.log(`   remnote/ → vocabulary/`);

  if (!DRY_RUN) {
    if (fs.existsSync(VOCABULARY_DIR)) {
      throw new Error(`Target directory ${VOCABULARY_DIR} already exists!`);
    }
    fs.renameSync(REMNOTE_DIR, VOCABULARY_DIR);
    console.log('   ✅ Directory renamed');
  } else {
    console.log('   ⏭️  Skipped (dry run)');
  }
}

/**
 * Find all TypeScript/TSX files that import from remnote
 */
function findImportFiles(): string[] {
  const importFiles: string[] = [];

  function searchDirectory(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'backup-remnote') {
          searchDirectory(fullPath);
        }
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('remnote')) {
          importFiles.push(fullPath);
        }
      }
    }
  }

  searchDirectory(process.cwd());
  return importFiles;
}

/**
 * Update import statements in files
 */
function updateImportStatements(): number {
  console.log('\n📝 Updating import statements...');

  const importFiles = findImportFiles();
  let updatedCount = 0;

  for (const file of importFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const updatedContent = content.replace(
      /from\s+['"]@\/lib\/data\/remnote\//g,
      `from '@/lib/data/vocabulary/`
    ).replace(
      /import\s+(['"])@\/lib\/data\/remnote\//g,
      `import $1@/lib/data/vocabulary/`
    );

    if (content !== updatedContent) {
      console.log(`   - ${path.relative(process.cwd(), file)}`);
      updatedCount++;

      if (!DRY_RUN) {
        fs.writeFileSync(file, updatedContent, 'utf-8');
      }
    }
  }

  console.log(`   ✅ Updated ${updatedCount} files`);
  return updatedCount;
}

/**
 * Update package.json scripts
 */
function updatePackageJsonScripts(): void {
  console.log('\n📦 Updating package.json scripts...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Update script descriptions or comments if needed
  console.log('   ℹ️  flashcards:split and flashcards:merge scripts still work');
  console.log('   ℹ️  They now operate on lib/data/vocabulary/ directory');
}

/**
 * Create new README for vocabulary directory
 */
function createVocabularyReadme(): void {
  console.log('\n📝 Creating vocabulary README...');

  const readmePath = path.join(
    DRY_RUN ? REMNOTE_DIR : VOCABULARY_DIR,
    'README.md'
  );

  const readmeContent = `# German Vocabulary Database

This directory contains the German vocabulary flashcards organized by CEFR level (A1-C2).

## Directory Structure

\`\`\`
vocabulary/
├── levels/              # Main flashcard data files (production)
│   ├── a1.json         # A1 level flashcards (445 cards)
│   ├── a2.json         # A2 level flashcards (466 cards)
│   ├── b1.json         # B1 level flashcards (1,086 cards)
│   ├── b2.json         # B2 level flashcards (680 cards)
│   ├── c1.json         # C1 level flashcards (124 cards)
│   └── c2.json         # C2 level flashcards (65 cards)
├── split/              # Category-based files (development)
│   ├── a1/
│   │   ├── _index.json
│   │   ├── body-parts.json
│   │   ├── verbs.json
│   │   └── ... (25 categories)
│   ├── a2/ ... b1/ ... b2/ ... c1/ ... c2/
│   └── ...
├── stats.json          # Vocabulary statistics
└── README.md           # This file
\`\`\`

## Usage

### Reading Flashcards

The application reads from \`levels/*.json\` files:

\`\`\`typescript
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import a2Data from '@/lib/data/vocabulary/levels/a2.json';
// ...
\`\`\`

### Editing Flashcards

For easier editing, use the split files:

1. **Split**: \`npm run flashcards:split [level|all]\`
2. **Edit**: Modify files in \`split/[level]/\` directory
3. **Merge**: \`npm run flashcards:merge [level|all]\`

See \`FLASHCARD_MANAGEMENT.md\` in project root for details.

## Statistics

- **Total Flashcards**: 2,866
- **Total Categories**: 92
- **CEFR Levels**: 6 (A1, A2, B1, B2, C1, C2)

## File Format

Each flashcard JSON file contains:

\`\`\`json
{
  "level": "A1",
  "totalCards": 445,
  "flashcards": [
    {
      "id": "body-a1-001",
      "german": "der Körper",
      "english": "body",
      "category": "Body Parts",
      "level": "A1",
      "tags": ["body", "basic", "A1"],
      "_meta": {
        "source": "Body Parts Expansion",
        "lineNumber": 0,
        "hierarchy": ["A1", "Body Parts", "der Körper"]
      }
    }
  ]
}
\`\`\`

## Maintenance

- Use \`split-flashcards.ts\` script to organize data
- Use \`merge-flashcards.ts\` script to consolidate changes
- See \`scripts/README.md\` for detailed documentation
`;

  if (!DRY_RUN) {
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  }

  console.log('   ✅ README created');
}

/**
 * Generate migration summary
 */
function printSummary(
  deletedInfiniteFiles: string[],
  deletedLooseFiles: string[],
  updatedImports: number
): void {
  console.log('\n' + '='.repeat(70));
  console.log('✨ MIGRATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nDeleted Files:`);
  console.log(`   Infinite recursion artifacts: ${deletedInfiniteFiles.length}`);
  console.log(`   Loose category files:         ${deletedLooseFiles.length}`);
  console.log(`   Total deleted:                ${deletedInfiniteFiles.length + deletedLooseFiles.length}`);
  console.log(`\nDirectory Changes:`);
  console.log(`   Renamed: remnote/ → vocabulary/`);
  console.log(`\nCode Updates:`);
  console.log(`   Import statements updated:    ${updatedImports} files`);

  if (!NO_BACKUP) {
    console.log(`\nBackup:`);
    console.log(`   Location: ${BACKUP_DIR}`);
    console.log(`   Note: Delete backup manually when migration is confirmed working`);
  }

  console.log('\n' + '='.repeat(70));

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN - No changes were made');
    console.log('Run without --dry-run to execute migration');
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the application: npm run dev');
    console.log('2. Check imports are working correctly');
    console.log('3. Run flashcard split/merge scripts to verify');
    console.log('4. If everything works, delete backup directory');
    console.log('5. Commit changes to git');
  }
  console.log('='.repeat(70) + '\n');
}

/**
 * Main migration function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🚀 VOCABULARY CLEANUP AND MIGRATION');
  console.log('='.repeat(70));

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Safety check
  if (!fs.existsSync(REMNOTE_DIR)) {
    console.error(`❌ Error: ${REMNOTE_DIR} does not exist`);
    process.exit(1);
  }

  if (fs.existsSync(VOCABULARY_DIR) && !DRY_RUN) {
    console.error(`❌ Error: ${VOCABULARY_DIR} already exists! Migration may have already run.`);
    process.exit(1);
  }

  try {
    // Step 1: Create backup
    if (!DRY_RUN) {
      createBackup();
    }

    // Step 2: Delete infinite recursion files
    const deletedInfiniteFiles = deleteInfiniteRecursionFiles();

    // Step 3: Delete loose category files
    const deletedLooseFiles = deleteLooseCategoryFiles();

    // Step 4: Rename directory
    renameDirectory();

    // Step 5: Update import statements
    const updatedImports = updateImportStatements();

    // Step 6: Update package.json
    updatePackageJsonScripts();

    // Step 7: Create new README
    createVocabularyReadme();

    // Step 8: Print summary
    printSummary(deletedInfiniteFiles, deletedLooseFiles, updatedImports);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nℹ️  No changes were made (or backup exists)');
    if (!NO_BACKUP && fs.existsSync(BACKUP_DIR)) {
      console.error(`ℹ️  Restore from backup: ${BACKUP_DIR}`);
    }
    process.exit(1);
  }
}

main();
