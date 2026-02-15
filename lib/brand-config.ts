/**
 * ============================================================================
 * BRAND CONFIGURATION
 * ============================================================================
 *
 * Centralized brand identity configuration for the entire application.
 * This file serves as the single source of truth for all brand-related
 * constants, URLs, and configuration values.
 *
 * WHY THIS EXISTS:
 * - Prevents hardcoded brand names scattered throughout the codebase
 * - Makes rebranding as simple as updating one file
 * - Enables white-labeling and multi-tenant deployments
 * - Ensures consistency across all components, docs, and configs
 *
 * HOW TO USE:
 * 1. Import the config: import { brandConfig } from '@/lib/brand-config'
 * 2. Use values: brandConfig.name, brandConfig.domain, etc.
 * 3. Use helper functions: getBrandUrl('/about'), getCorsOrigins(), etc.
 *
 * HOW TO REBRAND:
 * Option 1 (Automatic):
 *   npm run rebrand -- --name "NewBrand" --domain "newbrand.com"
 *
 * Option 2 (Manual):
 *   1. Update values in this file
 *   2. Update references in documentation files manually
 *   3. Update external services (Cloudflare R2, Turso DB, Vercel, Firebase)
 *
 * EXTERNAL SERVICES TO UPDATE AFTER REBRANDING:
 * - Cloudflare R2: Rename bucket or create new bucket with new name
 * - Turso Database: Create new database with new name
 * - Vercel: Update project name and environment variables
 * - Firebase: Update project ID and configuration
 * - Google OAuth: Update authorized domains
 * - DNS Records: Point new domain to hosting
 *
 * ============================================================================
 */

export const brandConfig = {
  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CORE BRAND IDENTITY
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Brand Name
   *
   * The primary brand name displayed throughout the application.
   *
   * Used in:
   * - UI components (Navbar, Footer, Logos)
   * - Page titles and meta tags
   * - Email templates
   * - Authentication screens
   * - Error messages
   *
   * Examples:
   * - "Testmanship" → appears as "Welcome to Testmanship"
   * - Used in: components/ui/Navbar.tsx, components/ui/Footer.tsx
   */
  name: "DeutschCraft",

  /**
   * Product Name (with version/variant identifier)
   *
   * The full product name including version or variant information.
   * Used in technical contexts where specificity is important.
   *
   * Used in:
   * - Documentation titles
   * - package.json name field
   * - Technical references
   * - API responses
   * - Admin dashboards
   *
   * Examples:
   * - "Testmanship Web V2" (current version)
   * - Could be "Testmanship Pro" or "Testmanship Enterprise"
   */
  productName: "DeutschCraft Web V2",

  /**
   * Tagline / Slogan
   *
   * A short, catchy phrase that describes the value proposition.
   *
   * Used in:
   * - Landing page hero section
   * - Meta descriptions
   * - Social media shares
   * - Browser tab titles (combined with brand name)
   *
   * Examples:
   * - "Learn German Together"
   * - Appears as: "Testmanship - Learn German Together"
   */
  tagline: "Learn German Together",

  /**
   * Full Description
   *
   * A comprehensive description of what the platform does.
   * Used for SEO and social media sharing.
   *
   * Used in:
   * - <meta name="description"> tags
   * - OpenGraph description tags
   * - Twitter Card descriptions
   * - About pages
   * - Marketing materials
   *
   * Best practices:
   * - Keep between 120-160 characters for optimal SEO
   * - Include primary keywords naturally
   * - End with a call to action or benefit statement
   */
  description: "A German language learning platform with AI-powered flashcards, interactive exercises, and personalized learning paths from A1 to C2 levels.",

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * DOMAIN & URL CONFIGURATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Primary Domain (without protocol)
   *
   * The main domain where the application is hosted.
   * Should NOT include https:// or www.
   *
   * Used in:
   * - CORS configuration
   * - Canonical URL generation
   * - Sitemap generation
   * - OAuth redirect URIs
   * - Email links
   *
   * Examples:
   * - "testmanship.com" ✓
   * - "https://testmanship.com" ✗ (don't include protocol)
   * - "www.testmanship.com" ✗ (don't include www)
   */
  domain: "deutschcraft.com",

  /**
   * Production URL (with protocol)
   *
   * The full URL where the application is deployed in production.
   * Must include https:// protocol.
   *
   * Used in:
   * - OpenGraph URL tags
   * - API callback URLs
   * - Redirect URLs after authentication
   * - Absolute URL generation
   * - External integrations
   *
   * Format: https://{domain}
   * No trailing slash!
   */
  productionUrl: "https://deutschcraft.com",

  /**
   * Development URL
   *
   * The URL used for local development and testing.
   *
   * Used in:
   * - Local development environment
   * - CORS whitelist for localhost
   * - Testing OAuth flows locally
   *
   * Note: Port 3000 is Next.js default. Change if using different port.
   */
  developmentUrl: "http://localhost:3000",

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CLOUD STORAGE & DATABASE
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Cloudflare R2 Bucket Name
   *
   * The name of the R2 bucket used for storing media files (audio, images).
   *
   * Used in:
   * - lib/utils/urlHelpers.ts (URL transformations)
   * - CORS configuration documents
   * - Upload services
   * - Media CDN configuration
   *
   * Location: Cloudflare Dashboard → R2 → Buckets
   *
   * After rebranding:
   * 1. Create new R2 bucket with new name
   * 2. Copy files from old bucket to new bucket
   * 3. Update CORS settings for new bucket
   * 4. Update this value
   */
  r2BucketName: "testmanship",

  /**
   * Database Name (Turso/PostgreSQL)
   *
   * The name of the Turso database used for primary data storage.
   *
   * Used in:
   * - package.json database scripts (db:shell, db:status)
   * - Database connection configuration
   * - Migration scripts
   * - Backup scripts
   * - Documentation
   *
   * Location: Turso CLI → turso db list
   *
   * After rebranding:
   * 1. Create new Turso database: turso db create {newname}
   * 2. Get URL: turso db show {newname} --url
   * 3. Generate token: turso db tokens create {newname}
   * 4. Update environment variables
   * 5. Run migrations on new database
   */
  databaseName: "testmanship-web-v2",

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * PROJECT STRUCTURE
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Project Folder Name
   *
   * The name of the root project directory on the filesystem.
   *
   * Used in:
   * - File path references in scripts
   * - Documentation examples
   * - IDE workspace configuration
   * - Git repository name
   *
   * Convention: kebab-case with version identifier
   * Example: "testmanship-web-v2", "myapp-web", "brandname-platform"
   *
   * Note: Use --rename-folder flag with rebrand script to rename directory
   */
  folderName: "deutschcraft",

  /**
   * NPM Package Name
   *
   * The package name used in package.json.
   *
   * Used in:
   * - package.json "name" field
   * - Lock file references
   * - Build output directories
   *
   * Convention: Same as folderName (kebab-case)
   *
   * After rebranding:
   * - Automatically updated by rebrand script
   * - May need to run: npm install to regenerate lock file
   */
  packageName: "deutschcraft",

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * CONTACT INFORMATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Contact Information
   *
   * Official contact details for support and collaboration.
   */
  contact: {
    /**
     * Support Email
     * Used in: Footer, Contact forms, Error messages, mailto: links
     */
    email: "support@deutschcraft.com",

    /**
     * GitHub Repository
     * Used in: Footer, Documentation, Contributing guides
     * Format: Full HTTPS URL to repository
     */
    github: "https://github.com/julesmeister/deutschcraft",
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * SOCIAL MEDIA
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Social Media Handles
   *
   * Used in: Footer social links, OpenGraph tags, Marketing pages
   *
   * Note: Store only the handle/username, not the full URL
   * URLs are constructed in components as needed
   */
  social: {
    /** Twitter/X handle (without @) */
    twitter: "@deutschcraft",

    /** Facebook page name */
    facebook: "deutschcraft",

    /** Instagram handle (without @) */
    instagram: "deutschcraft",
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * LEGAL INFORMATION
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Legal Information
   *
   * Used in: Footer, Terms of Service, Privacy Policy
   */
  legal: {
    /**
     * Company/Owner Name
     * The legal entity that owns and operates the platform
     */
    companyName: "DeutschCraft",

    /**
     * Copyright Notice
     * Automatically includes current year via new Date().getFullYear()
     *
     * Used in: Footer, License files, Documentation
     */
    copyright: `© ${new Date().getFullYear()} Testmanship. All rights reserved.`,
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * FEATURE FLAGS (for white-labeling and customization)
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Feature Flags
   *
   * Enable/disable features based on deployment scenario.
   * Useful for white-labeling or multi-tenant setups.
   */
  features: {
    /**
     * Show Branding
     * When false, hides brand logos and names for white-label deployments
     */
    showBranding: true,

    /**
     * Custom Theme
     * When true, allows tenants to customize colors and styles
     */
    customTheme: false,

    /**
     * Multi-Tenant Mode
     * When true, enables features for hosting multiple brands
     */
    multiTenant: false,
  },
} as const;

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 *
 * Utility functions for working with brand configuration.
 * These functions provide convenient ways to generate URLs, CORS origins,
 * and other brand-specific values.
 */

/**
 * Get Brand-Specific URL
 *
 * Generates a full URL by combining the appropriate base URL
 * (production or development) with the provided path.
 *
 * @param path - Optional path to append (e.g., "/about", "/api/users")
 * @returns Full URL with protocol and domain
 *
 * @example
 * getBrandUrl() // "https://testmanship.com" (in production)
 * getBrandUrl("/about") // "https://testmanship.com/about"
 * getBrandUrl("api/users") // "https://testmanship.com/api/users"
 *
 * Usage:
 * - Generating canonical URLs for SEO
 * - Creating absolute URLs for emails
 * - Building API callback URLs
 */
export const getBrandUrl = (path: string = ""): string => {
  const baseUrl = process.env.NODE_ENV === "production"
    ? brandConfig.productionUrl
    : brandConfig.developmentUrl;

  return path ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}` : baseUrl;
};

/**
 * Get CORS-Allowed Origins
 *
 * Returns an array of all origins that should be whitelisted for CORS.
 * Includes both www and non-www variants, plus localhost for development.
 *
 * @returns Array of allowed origin URLs
 *
 * @example
 * getCorsOrigins()
 * // [
 * //   "https://testmanship.com",
 * //   "https://www.testmanship.com",
 * //   "http://localhost:3000"
 * // ]
 *
 * Usage:
 * - Cloudflare R2 CORS configuration
 * - API middleware CORS headers
 * - NextAuth configuration
 * - WebSocket connection validation
 */
export const getCorsOrigins = (): string[] => {
  return [
    brandConfig.productionUrl,
    `https://www.${brandConfig.domain}`,
    brandConfig.developmentUrl,
    "http://localhost:3000",
    "http://localhost:3001", // Alternative dev port
  ];
};

/**
 * Get R2 Bucket URL Pattern (as RegEx)
 *
 * Returns a regular expression that matches S3 API URLs for the brand's
 * R2 bucket. Used for URL transformation in media handling.
 *
 * @returns RegExp matching R2 bucket URLs
 *
 * @example
 * const pattern = getR2BucketPattern();
 * const isR2Url = pattern.test(url);
 *
 * // Matches:
 * // https://abc123.r2.cloudflarestorage.com/testmanship/audio/file.mp3
 *
 * Usage:
 * - lib/utils/urlHelpers.ts for URL transformations
 * - Media upload services
 * - URL validation
 */
export const getR2BucketPattern = (): RegExp => {
  return new RegExp(
    `https://[^/]+\\.r2\\.cloudflarestorage\\.com/${brandConfig.r2BucketName}`
  );
};

/**
 * Get Public R2 Domain
 *
 * Returns the public R2 domain used for serving media files.
 * This is the public URL that doesn't require authentication.
 *
 * @returns Public R2 domain URL
 *
 * @example
 * getPublicR2Domain()
 * // "https://pub-2ec6ce63ab194efea6a0ba73aeaab0eb.r2.dev"
 *
 * Usage:
 * - Transforming private S3 URLs to public URLs
 * - Serving audio files to users
 * - Image optimization
 *
 * Note: Override with NEXT_PUBLIC_R2_PUBLIC_URL environment variable
 * for custom domains (e.g., "https://cdn.testmanship.com")
 */
export const getPublicR2Domain = (): string => {
  return process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "https://pub-2ec6ce63ab194efea6a0ba73aeaab0eb.r2.dev";
};

/**
 * Get Storage Key Prefix
 *
 * Returns a prefixed key for localStorage/sessionStorage to avoid conflicts.
 *
 * @param key - The storage key name
 * @returns Prefixed storage key
 *
 * @example
 * getStorageKey("user_preferences")
 * // "testmanship_user_preferences"
 *
 * Usage:
 * - localStorage keys
 * - sessionStorage keys
 * - IndexedDB database names
 */
export const getStorageKey = (key: string): string => {
  const prefix = brandConfig.name.toLowerCase();
  return `${prefix}_${key}`;
};

/**
 * Get Firebase Project ID
 *
 * Returns the Firebase project ID derived from the brand name.
 *
 * @returns Firebase project ID
 *
 * @example
 * getFirebaseProjectId()
 * // "testmanship-ac721"
 *
 * Note: This should match your actual Firebase project ID.
 * Update lib/firebase.ts if you rebrand.
 */
export const getFirebaseProjectId = (): string => {
  // Firebase project IDs typically append a random suffix
  // Update this if you rebrand and create a new Firebase project
  return "testmanship-ac721";
};

/**
 * ============================================================================
 * TYPE EXPORTS
 * ============================================================================
 */

/**
 * Type definition for the brand configuration object
 * Useful for type-safe access and autocomplete
 */
export type BrandConfig = typeof brandConfig;
