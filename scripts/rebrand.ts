#!/usr/bin/env tsx
/**
 * ============================================================================
 * REBRANDING AUTOMATION SCRIPT
 * ============================================================================
 *
 * This script automates the process of rebranding the entire application by
 * updating all brand references in the codebase, documentation, and configuration.
 *
 * WHAT THIS SCRIPT DOES:
 * 1. Updates lib/brand-config.ts with new brand values
 * 2. Updates package.json with new package name and database scripts
 * 3. Updates core application files (layout.tsx, urlHelpers.ts, etc.)
 * 4. Updates all documentation files in docs/
 * 5. Updates CORS configuration files
 * 6. Updates UI components (Navbar, Footer, Toast, etc.)
 * 7. Optionally renames the project folder
 *
 * WHAT THIS SCRIPT DOES NOT DO:
 * - Update external services (Cloudflare R2, Turso, Vercel, Firebase)
 * - Update environment variables (.env files)
 * - Update DNS records
 * - Transfer data between databases
 * - Update OAuth provider settings
 *
 * USAGE:
 *   Basic rebranding:
 *     npm run rebrand -- --name "NewBrand" --domain "newbrand.com"
 *
 *   Full rebranding with custom options:
 *     npm run rebrand -- --name "MyApp" --domain "myapp.io" --folder "myapp-web" --tagline "Your Custom Tagline"
 *
 *   Preview changes without applying (dry-run):
 *     npm run rebrand -- --dry-run --name "NewBrand" --domain "newbrand.com"
 *
 *   Rebrand and rename folder:
 *     npm run rebrand -- --name "NewBrand" --domain "newbrand.com" --rename-folder
 *
 * COMMAND LINE OPTIONS:
 *   --name          (REQUIRED) New brand name (e.g., "MyApp")
 *   --domain        (REQUIRED) New domain without protocol (e.g., "myapp.com")
 *   --folder        (optional) New folder name (defaults to kebab-case of name + "-web-v2")
 *   --bucket        (optional) New R2 bucket name (defaults to kebab-case of name)
 *   --database      (optional) New database name (defaults to folder name)
 *   --tagline       (optional) New tagline/slogan
 *   --description   (optional) New description for SEO
 *   --dry-run       (optional) Preview changes without applying them
 *   --rename-folder (optional) Rename the project folder (requires confirmation)
 *
 * AFTER RUNNING THIS SCRIPT:
 * 1. Review changes: git diff
 * 2. Update .env files with new values
 * 3. Create new Cloudflare R2 bucket with new name
 * 4. Create new Turso database: turso db create {newname}
 * 5. Update Vercel environment variables
 * 6. Update Firebase project settings
 * 7. Update Google OAuth authorized domains
 * 8. Update DNS records to point to new domain
 * 9. Test locally: npm run dev
 * 10. Commit changes: git add . && git commit -m "Rebrand to {NewName}"
 *
 * ============================================================================
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/**
 * ============================================================================
 * TYPE DEFINITIONS
 * ============================================================================
 */

/**
 * Interface for rebranding options
 * Contains all configurable parameters for the rebranding process
 */
interface RebrandOptions {
  /** New brand name (e.g., "MyApp") */
  name: string;
  /** New domain without protocol (e.g., "myapp.com") */
  domain: string;
  /** New folder name (e.g., "myapp-web-v2") */
  folder: string;
  /** New R2 bucket name (e.g., "myapp") */
  bucket: string;
  /** New database name (e.g., "myapp-web-v2") */
  database: string;
  /** New tagline (optional) */
  tagline?: string;
  /** New description (optional) */
  description?: string;
  /** Preview mode - don't actually write changes */
  dryRun: boolean;
  /** Whether to rename the project folder */
  renameFolder: boolean;
}

/**
 * Current brand values to search for and replace
 * These values are hardcoded and represent the default brand
 */
const CURRENT_BRAND = {
  name: "Testmanship",
  domain: "testmanship.com",
  folder: "testmanship-web-v2",
  bucket: "testmanship",
  database: "testmanship-web-v2",
} as const;

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Parse command line arguments into RebrandOptions
 *
 * Reads process.argv and extracts all command line flags and their values.
 *
 * @returns Partial<RebrandOptions> containing parsed arguments
 *
 * Examples:
 *   --name "MyApp" → { name: "MyApp" }
 *   --dry-run → { dryRun: true }
 */
function parseArgs(): Partial<RebrandOptions> {
  const args = process.argv.slice(2);
  const options: Partial<RebrandOptions> = {
    dryRun: false,
    renameFolder: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--name":
        options.name = nextArg;
        i++; // Skip next arg since we consumed it
        break;
      case "--domain":
        options.domain = nextArg;
        i++;
        break;
      case "--folder":
        options.folder = nextArg;
        i++;
        break;
      case "--bucket":
        options.bucket = nextArg;
        i++;
        break;
      case "--database":
        options.database = nextArg;
        i++;
        break;
      case "--tagline":
        options.tagline = nextArg;
        i++;
        break;
      case "--description":
        options.description = nextArg;
        i++;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--rename-folder":
        options.renameFolder = true;
        break;
    }
  }

  return options;
}

/**
 * Convert a string to kebab-case
 *
 * Useful for generating folder names, package names, and bucket names.
 *
 * @param str - Input string to convert
 * @returns Kebab-cased string
 *
 * Examples:
 *   "MyApp" → "myapp"
 *   "My Great App" → "my-great-app"
 *   "Test@App#123" → "test-app-123"
 */
function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-|-$/g, "");        // Remove leading/trailing dashes
}

/**
 * Validate and normalize rebranding options
 *
 * Ensures all required fields are present and generates default values
 * for optional fields based on the brand name.
 *
 * @param options - Partial options from command line
 * @returns Complete RebrandOptions with all fields filled
 * @throws Process exits if required fields are missing
 */
function validateOptions(options: Partial<RebrandOptions>): RebrandOptions {
  // Validate required fields
  if (!options.name) {
    console.error("❌ Error: --name is required");
    console.log("\nUsage: npm run rebrand -- --name \"NewBrand\" --domain \"newbrand.com\"");
    console.log("\nExample: npm run rebrand -- --name \"MyApp\" --domain \"myapp.io\"");
    process.exit(1);
  }

  if (!options.domain) {
    console.error("❌ Error: --domain is required");
    console.log("\nUsage: npm run rebrand -- --name \"NewBrand\" --domain \"newbrand.com\"");
    console.log("\nExample: npm run rebrand -- --name \"MyApp\" --domain \"myapp.io\"");
    process.exit(1);
  }

  // Validate domain format (no protocol, no trailing slash)
  if (options.domain.includes("://") || options.domain.endsWith("/")) {
    console.error("❌ Error: Domain should not include protocol or trailing slash");
    console.log(`   Invalid: ${options.domain}`);
    console.log(`   Valid: ${options.domain.replace(/https?:\/\//, "").replace(/\/$/, "")}`);
    process.exit(1);
  }

  // Generate default values for optional fields
  const kebabName = kebabCase(options.name);

  return {
    name: options.name,
    domain: options.domain,
    folder: options.folder || `${kebabName}-web-v2`,
    bucket: options.bucket || kebabName,
    database: options.database || options.folder || `${kebabName}-web-v2`,
    tagline: options.tagline,
    description: options.description,
    dryRun: options.dryRun || false,
    renameFolder: options.renameFolder || false,
  };
}

/**
 * Update a single file with a list of find-and-replace operations
 *
 * Reads the file, applies all replacements, and writes back (if not dry-run).
 * Reports whether the file was modified.
 *
 * @param filePath - Relative path to file from project root
 * @param replacements - Array of {from, to} replacement pairs
 * @param dryRun - If true, don't actually write changes
 * @returns true if file was modified, false otherwise
 */
function updateFile(
  filePath: string,
  replacements: Array<{ from: string | RegExp; to: string }>,
  dryRun: boolean
): boolean {
  const absolutePath = path.resolve(process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(absolutePath, "utf-8");
  let modified = false;

  // Apply all replacements
  for (const { from, to } of replacements) {
    const regex = typeof from === "string" ? new RegExp(escapeRegExp(from), "g") : from;
    if (regex.test(content)) {
      content = content.replace(regex, to);
      modified = true;
    }
  }

  // Write changes if modified
  if (modified) {
    if (dryRun) {
      console.log(`   📝 Would update: ${filePath}`);
    } else {
      fs.writeFileSync(absolutePath, content, "utf-8");
      console.log(`   ✅ Updated: ${filePath}`);
    }
    return true;
  }

  return false;
}

/**
 * Escape special regex characters in a string
 *
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * ============================================================================
 * FILE UPDATE FUNCTIONS
 * ============================================================================
 *
 * Each function updates a specific category of files.
 * Functions are organized by concern (config, docs, UI, etc.)
 */

/**
 * Update lib/brand-config.ts with new brand values
 *
 * This is the most important file to update as it's the source of truth
 * for all brand configuration throughout the application.
 *
 * Updates:
 * - name, productName
 * - domain, productionUrl
 * - r2BucketName, databaseName
 * - folderName, packageName
 * - companyName, copyright
 * - tagline, description (if provided)
 */
function updateBrandConfig(options: RebrandOptions): void {
  console.log("\n📝 Updating brand configuration...");

  const replacements = [
    { from: `name: "${CURRENT_BRAND.name}"`, to: `name: "${options.name}"` },
    { from: `productName: "${CURRENT_BRAND.name} Web V2"`, to: `productName: "${options.name} Web V2"` },
    { from: `domain: "${CURRENT_BRAND.domain}"`, to: `domain: "${options.domain}"` },
    { from: `productionUrl: "https://${CURRENT_BRAND.domain}"`, to: `productionUrl: "https://${options.domain}"` },
    { from: `r2BucketName: "${CURRENT_BRAND.bucket}"`, to: `r2BucketName: "${options.bucket}"` },
    { from: `databaseName: "${CURRENT_BRAND.database}"`, to: `databaseName: "${options.database}"` },
    { from: `folderName: "${CURRENT_BRAND.folder}"`, to: `folderName: "${options.folder}"` },
    { from: `packageName: "${CURRENT_BRAND.folder}"`, to: `packageName: "${options.folder}"` },
    { from: `companyName: "${CURRENT_BRAND.name}"`, to: `companyName: "${options.name}"` },
    { from: new RegExp(`© \\d{4} ${CURRENT_BRAND.name}`), to: `© ${new Date().getFullYear()} ${options.name}` },
    // Contact email
    { from: `email: "support@${CURRENT_BRAND.domain}"`, to: `email: "support@${options.domain}"` },
    // GitHub URL
    { from: `github: "https://github.com/julesmeister/${CURRENT_BRAND.folder}"`, to: `github: "https://github.com/julesmeister/${options.folder}"` },
    // Social media handles
    { from: `twitter: "@${CURRENT_BRAND.name.toLowerCase()}"`, to: `twitter: "@${options.name.toLowerCase()}"` },
    { from: `facebook: "${CURRENT_BRAND.name.toLowerCase()}"`, to: `facebook: "${options.name.toLowerCase()}"` },
    { from: `instagram: "${CURRENT_BRAND.name.toLowerCase()}"`, to: `instagram: "${options.name.toLowerCase()}"` },
  ];

  // Add optional replacements if provided
  if (options.tagline) {
    replacements.push({
      from: /tagline: ".*?"/,
      to: `tagline: "${options.tagline}"`,
    });
  }

  if (options.description) {
    replacements.push({
      from: /description: ".*?"/,
      to: `description: "${options.description}"`,
    });
  }

  updateFile("lib/brand-config.ts", replacements, options.dryRun);
}

/**
 * Update package.json with new package name and database scripts
 *
 * Updates:
 * - "name" field
 * - "db:shell" script
 * - "db:status" script
 */
function updatePackageJson(options: RebrandOptions): void {
  console.log("\n📦 Updating package.json...");

  const replacements = [
    { from: `"name": "${CURRENT_BRAND.folder}"`, to: `"name": "${options.folder}"` },
    { from: `"db:shell": "turso db shell ${CURRENT_BRAND.database}"`, to: `"db:shell": "turso db shell ${options.database}"` },
    { from: `"db:status": "turso db show ${CURRENT_BRAND.database}"`, to: `"db:status": "turso db show ${options.database}"` },
  ];

  updateFile("package.json", replacements, options.dryRun);
}

/**
 * Update core application files
 *
 * These files are critical to the application's functionality and
 * must be updated for the app to work with the new brand.
 *
 * Files updated:
 * - app/layout.tsx (already uses brand-config, but good to check)
 * - lib/utils/urlHelpers.ts (already uses brand-config)
 * - CLAUDE.md (project instructions for AI assistants)
 * - README.md (project documentation)
 * - check_db.ts (database verification script)
 */
function updateCoreFiles(options: RebrandOptions): void {
  console.log("\n📄 Updating core application files...");

  const filesToUpdate = [
    "CLAUDE.md",
    "README.md",
    "check_db.ts",
  ];

  for (const file of filesToUpdate) {
    const replacements = [
      { from: CURRENT_BRAND.name, to: options.name },
      { from: `${CURRENT_BRAND.name} Web V2`, to: `${options.name} Web V2` },
      { from: CURRENT_BRAND.domain, to: options.domain },
      { from: CURRENT_BRAND.folder, to: options.folder },
      { from: CURRENT_BRAND.bucket, to: options.bucket },
      { from: CURRENT_BRAND.database, to: options.database },
      // Case variations
      { from: CURRENT_BRAND.name.toLowerCase(), to: options.name.toLowerCase() },
      { from: CURRENT_BRAND.name.toUpperCase(), to: options.name.toUpperCase() },
    ];

    updateFile(file, replacements, options.dryRun);
  }
}

/**
 * Update CORS configuration files
 *
 * Updates all CORS-related documentation and configuration files
 * with the new domain name.
 */
function updateCorsFiles(options: RebrandOptions): void {
  console.log("\n🔐 Updating CORS configuration files...");

  const corsFiles = [
    "CORS-SETUP-GUIDE.md",
    "CORS-QUICK-FIX.md",
  ];

  for (const file of corsFiles) {
    const replacements = [
      { from: CURRENT_BRAND.domain, to: options.domain },
      { from: CURRENT_BRAND.bucket, to: options.bucket },
      { from: CURRENT_BRAND.folder, to: options.folder },
    ];

    updateFile(file, replacements, options.dryRun);
  }
}

/**
 * Update UI component files
 *
 * Updates components that display the brand name to users.
 * These files should ideally import from brand-config, but we update
 * them directly for immediate effect.
 *
 * Files updated:
 * - components/ui/Navbar.tsx
 * - components/ui/Footer.tsx
 * - components/ui/toast/Toast.tsx
 * - app/dashboard/layout/NavbarLogo.tsx
 * - components/sections/TestimonialsSection.tsx
 */
function updateUIComponents(options: RebrandOptions): void {
  console.log("\n🎨 Updating UI components...");

  const uiFiles = [
    "components/ui/Navbar.tsx",
    "components/ui/Footer.tsx",
    "components/ui/toast/Toast.tsx",
    "app/dashboard/layout/NavbarLogo.tsx",
    "components/sections/TestimonialsSection.tsx",
  ];

  for (const file of uiFiles) {
    const replacements = [
      { from: CURRENT_BRAND.name, to: options.name },
      { from: `© 2025 ${CURRENT_BRAND.name}`, to: `© ${new Date().getFullYear()} ${options.name}` },
    ];

    updateFile(file, replacements, options.dryRun);
  }
}

/**
 * Update utility files
 *
 * Updates utility files that may have brand-specific constants.
 */
function updateUtilityFiles(options: RebrandOptions): void {
  console.log("\n🔧 Updating utility files...");

  const utilityFiles = [
    "lib/utils/accountHistory.ts",
    "scripts/verify-r2-setup.ts",
  ];

  for (const file of utilityFiles) {
    const replacements = [
      { from: CURRENT_BRAND.name.toLowerCase(), to: options.name.toLowerCase() },
      { from: CURRENT_BRAND.bucket, to: options.bucket },
    ];

    updateFile(file, replacements, options.dryRun);
  }
}

/**
 * Update documentation files
 *
 * Updates all markdown documentation in the docs/ directory.
 * This includes guides, technical docs, and archived documentation.
 */
function updateDocumentationFiles(options: RebrandOptions): void {
  console.log("\n📚 Updating documentation files...");

  const docFiles = [
    "docs/README.md",
    "docs/PLAYGROUND.md",
    "docs/SOCIAL_MEDIA_FEATURE.md",
    "docs/SOCIAL_MEDIA_TURSO.md",
    "docs/guides/GETTING_STARTED.md",
    "docs/guides/STUDENT.md",
    "docs/guides/DATABASE_SETUP.md",
    "docs/guides/FLASHCARDS_SYSTEM.md",
    "docs/guides/ROLE_BASED_FEATURES.md",
    "docs/guides/SOUND.md",
    "docs/technical/MODEL_GUIDE.md",
    "docs/technical/PAGINATION-PATTERN.md",
    "docs/technical/COMPONENTS.md",
    "turso/README.md",
    "turso/MIGRATION_CHECKLIST.md",
  ];

  for (const file of docFiles) {
    const replacements = [
      { from: CURRENT_BRAND.name, to: options.name },
      { from: `${CURRENT_BRAND.name} Web V2`, to: `${options.name} Web V2` },
      { from: CURRENT_BRAND.folder, to: options.folder },
      { from: CURRENT_BRAND.domain, to: options.domain },
      { from: CURRENT_BRAND.database, to: options.database },
    ];

    updateFile(file, replacements, options.dryRun);
  }
}

/**
 * ============================================================================
 * FOLDER RENAMING
 * ============================================================================
 */

/**
 * Rename the project folder if requested
 *
 * This is a potentially destructive operation that:
 * 1. Checks if we're in a git repository
 * 2. Warns the user about implications
 * 3. Waits for confirmation (5 seconds to cancel)
 * 4. Renames the folder
 * 5. Reports the new location
 *
 * After folder rename, user must:
 * - cd into new directory
 * - Update IDE workspace
 * - Update git remote URLs (if applicable)
 * - Restart terminal/dev server
 */
function renameFolderIfRequested(options: RebrandOptions): void {
  if (!options.renameFolder) {
    console.log("\n📁 Folder rename skipped (use --rename-folder to enable)");
    return;
  }

  const currentDir = process.cwd();
  const parentDir = path.dirname(currentDir);
  const currentFolderName = path.basename(currentDir);
  const newFolderPath = path.join(parentDir, options.folder);

  // Check if folder name already matches
  if (currentFolderName === options.folder) {
    console.log("\n📁 Folder name already matches target, skipping rename");
    return;
  }

  // Check if target folder already exists
  if (fs.existsSync(newFolderPath)) {
    console.error(`\n❌ Error: Target folder already exists: ${newFolderPath}`);
    console.log("   Please delete or rename the existing folder first.");
    process.exit(1);
  }

  console.log("\n📁 Renaming project folder...");
  console.log(`   From: ${currentDir}`);
  console.log(`   To:   ${newFolderPath}`);

  if (options.dryRun) {
    console.log("   📝 Would rename folder (dry-run mode)");
    return;
  }

  try {
    // Check if we're in a git repo
    try {
      execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
      console.log("\n⚠️  Warning: This is a git repository.");
      console.log("   After renaming, you'll need to:");
      console.log("   1. Update your git remote URL (if applicable)");
      console.log("   2. Update any absolute paths in your IDE/tools");
      console.log("   3. Restart your development server");
    } catch {
      // Not a git repo, that's fine
    }

    console.log("\n⚠️  This will rename the folder and you'll need to cd into the new location.");
    console.log("   Press Ctrl+C to cancel, or wait 5 seconds to continue...");

    // Wait 5 seconds for user to cancel
    try {
      execSync("timeout 5 2>nul || sleep 5", { stdio: "inherit" });
    } catch (error: any) {
      if (error.killed || error.signal === "SIGINT") {
        console.log("\n❌ Folder rename cancelled by user");
        process.exit(0);
      }
    }

    // Perform the rename
    fs.renameSync(currentDir, newFolderPath);
    console.log("   ✅ Folder renamed successfully!");
    console.log(`\n📍 New location: ${newFolderPath}`);
    console.log(`   Run: cd "${newFolderPath}"`);
  } catch (error: any) {
    console.error(`\n❌ Error renaming folder: ${error.message}`);
    process.exit(1);
  }
}

/**
 * ============================================================================
 * SUMMARY & REPORTING
 * ============================================================================
 */

/**
 * Print a summary of what will be changed or what was changed
 *
 * Shows before/after values for all brand properties and lists
 * the next steps the user needs to take.
 */
function printSummary(options: RebrandOptions): void {
  console.log("\n" + "=".repeat(70));
  console.log("✨ REBRANDING SUMMARY");
  console.log("=".repeat(70));

  // Brand changes
  console.log("\n📋 Brand Changes:");
  console.log(`   Name:       ${CURRENT_BRAND.name} → ${options.name}`);
  console.log(`   Domain:     ${CURRENT_BRAND.domain} → ${options.domain}`);
  console.log(`   Folder:     ${CURRENT_BRAND.folder} → ${options.folder}`);
  console.log(`   R2 Bucket:  ${CURRENT_BRAND.bucket} → ${options.bucket}`);
  console.log(`   Database:   ${CURRENT_BRAND.database} → ${options.database}`);

  if (options.tagline) {
    console.log(`   Tagline:    ${options.tagline}`);
  }

  if (options.description) {
    console.log(`   Description: ${options.description.substring(0, 60)}...`);
  }

  console.log("\n" + "=".repeat(70));

  if (options.dryRun) {
    console.log("\n💡 DRY RUN MODE - No files were modified");
    console.log("   Remove --dry-run flag to apply changes:");
    console.log(`   npm run rebrand -- --name "${options.name}" --domain "${options.domain}"`);
    return;
  }

  console.log("\n✅ REBRANDING COMPLETE!");

  console.log("\n📋 NEXT STEPS:");
  console.log("   1. Review changes: git diff");
  console.log("   2. Update .env files:");
  console.log(`      - NEXT_PUBLIC_DOMAIN=${options.domain}`);
  console.log(`      - Update R2 and database URLs`);
  console.log("\n   3. Create new Cloudflare R2 bucket:");
  console.log(`      - Name: ${options.bucket}`);
  console.log("      - Copy files from old bucket");
  console.log(`      - Update CORS settings for ${options.domain}`);
  console.log("\n   4. Create new Turso database:");
  console.log(`      turso db create ${options.database}`);
  console.log(`      turso db show ${options.database} --url`);
  console.log(`      turso db tokens create ${options.database}`);
  console.log("\n   5. Update Vercel:");
  console.log("      - Project name and environment variables");
  console.log(`      - Add domain: ${options.domain}`);
  console.log("\n   6. Update Firebase (if used):");
  console.log("      - Create new project or update existing");
  console.log("      - Update lib/firebase.ts with new project ID");
  console.log("\n   7. Update Google OAuth:");
  console.log(`      - Add authorized domain: ${options.domain}`);
  console.log(`      - Update callback URL: https://${options.domain}/api/auth/callback/google`);
  console.log("\n   8. Update DNS records:");
  console.log(`      - Point ${options.domain} to your hosting (Vercel)`);
  console.log("\n   9. Test locally:");
  console.log("      npm run dev");
  console.log("\n   10. Commit and deploy:");
  console.log(`      git add .`);
  console.log(`      git commit -m "Rebrand to ${options.name}"`);
  console.log(`      git push`);

  if (options.renameFolder) {
    console.log("\n⚠️  FOLDER RENAMED:");
    console.log("   - Update your IDE workspace settings");
    console.log("   - Update any bookmark/shortcut paths");
    console.log("   - Update git remote URL if needed");
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

/**
 * ============================================================================
 * MAIN EXECUTION
 * ============================================================================
 */

/**
 * Main function - coordinates the entire rebranding process
 *
 * Flow:
 * 1. Parse command line arguments
 * 2. Validate options
 * 3. Show summary and wait for confirmation
 * 4. Update brand config
 * 5. Update package.json
 * 6. Update core files
 * 7. Update CORS files
 * 8. Update UI components
 * 9. Update utilities
 * 10. Update documentation
 * 11. Rename folder (if requested)
 * 12. Show final summary and next steps
 */
function main(): void {
  console.log("🎨 AUTOMATED REBRANDING SCRIPT");
  console.log("================================\n");

  // Parse and validate arguments
  const args = parseArgs();
  const options = validateOptions(args);

  // Show summary before proceeding
  printSummary(options);

  // Confirmation step (unless dry-run)
  if (!options.dryRun) {
    console.log("\n⚠️  WARNING: This will modify files in your project.");
    console.log("   Make sure you have committed any pending changes.");
    console.log("   Starting in 3 seconds... (Press Ctrl+C to cancel)\n");

    try {
      execSync("timeout 3 2>nul || sleep 3", { stdio: "inherit" });
    } catch (error: any) {
      if (error.killed || error.signal === "SIGINT") {
        console.log("\n❌ Rebranding cancelled by user");
        process.exit(0);
      }
    }
  }

  // Execute rebranding steps
  console.log("\n🚀 Starting rebranding process...");

  updateBrandConfig(options);
  updatePackageJson(options);
  updateCoreFiles(options);
  updateCorsFiles(options);
  updateUIComponents(options);
  updateUtilityFiles(options);
  updateDocumentationFiles(options);
  renameFolderIfRequested(options);

  // Show final summary
  printSummary(options);
}

// Execute main function
main();
