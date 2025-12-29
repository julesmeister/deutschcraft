-- Migration: 038_migrate_pricing_data
-- Description: Create config table if not exists and insert default pricing data
-- Created: 2025-12-29

-- Ensure config table exists
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- Insert default course pricing if not exists
INSERT OR IGNORE INTO config (key, value)
VALUES (
  'course-pricing',
  '{
    "levels": {
      "A1": {"flashcardCount": 417, "syllabusWeeks": 12, "basePrice": 2499, "description": "Perfect for absolute beginners"},
      "A2": {"flashcardCount": 433, "syllabusWeeks": 16, "basePrice": 3999, "description": "Build on your basics"},
      "B1": {"flashcardCount": 1026, "syllabusWeeks": 20, "basePrice": 4999, "description": "Reach conversational fluency"},
      "B2": {"flashcardCount": 640, "syllabusWeeks": 24, "basePrice": 6499, "description": "Master complex topics"},
      "C1": {"flashcardCount": 69, "syllabusWeeks": 28, "basePrice": 7499, "description": "Near-native proficiency"},
      "C2": {"flashcardCount": 20, "syllabusWeeks": 32, "basePrice": 8499, "description": "Complete mastery"}
    },
    "currency": "PHP",
    "currencySymbol": "₱",
    "updatedAt": 1703808000000,
    "updatedBy": "system"
  }'
);
