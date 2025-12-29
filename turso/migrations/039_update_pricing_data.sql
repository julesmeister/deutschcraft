-- Migration: 039_update_pricing_data
-- Description: Update pricing data with correct flashcard counts
-- Created: 2025-12-29

INSERT INTO config (key, value)
VALUES (
  'course-pricing',
  '{
    "levels": {
      "A1": {"flashcardCount": 585, "syllabusWeeks": 12, "basePrice": 2499, "description": "Perfect for absolute beginners"},
      "A2": {"flashcardCount": 1124, "syllabusWeeks": 16, "basePrice": 3999, "description": "Build on your basics"},
      "B1": {"flashcardCount": 1524, "syllabusWeeks": 20, "basePrice": 4999, "description": "Reach conversational fluency"},
      "B2": {"flashcardCount": 573, "syllabusWeeks": 24, "basePrice": 6499, "description": "Master complex topics"},
      "C1": {"flashcardCount": 116, "syllabusWeeks": 28, "basePrice": 7499, "description": "Near-native proficiency"},
      "C2": {"flashcardCount": 72, "syllabusWeeks": 32, "basePrice": 8499, "description": "Complete mastery"}
    },
    "currency": "PHP",
    "currencySymbol": "₱",
    "updatedAt": 1735468800000,
    "updatedBy": "system"
  }'
)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value;
