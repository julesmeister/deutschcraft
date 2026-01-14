/**
 * URL Helper Utilities
 * Helper functions for handling URLs, specifically for Cloudflare R2
 */

import { brandConfig, getR2BucketPattern, getPublicR2Domain } from "@/lib/brand-config";

/**
 * Transforms an R2 S3 API URL to a Public Development URL
 * This is necessary because the S3 API URL requires authentication,
 * while the Public URL allows public access (if enabled).
 *
 * @param url The original URL (potentially an S3 API URL)
 * @returns The playable Public URL
 */
export function getPlayableUrl(url: string): string {
  if (!url) return "";

  // Transform R2 S3 API URL to Public URL
  // S3 Pattern: https://<account_id>.r2.cloudflarestorage.com/<bucket_name>/<file_path>
  // Public Pattern: https://pub-<id>.r2.dev/<file_path>

  // Check if it's an R2 S3 URL for the brand's bucket
  if (url.includes(`.r2.cloudflarestorage.com/${brandConfig.r2BucketName}`)) {
    // Get the configured public URL from environment variables or use default
    const publicUrl =
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL || getPublicR2Domain();

    // Replace the S3 domain with the Public URL
    return url.replace(getR2BucketPattern(), publicUrl);
  }

  return url;
}
