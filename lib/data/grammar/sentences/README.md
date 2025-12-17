# Grammar Practice Sentences

This directory contains practice sentences for grammar rules at each CEFR level.

## Structure

Each level has its own JSON file (a1.json, a2.json, etc.) containing practice sentences for all grammar rules at that level.

## Sentence Format

```json
{
  "sentenceId": "a1-articles-definite-001",
  "ruleId": "a1-articles-definite",
  "english": "The man is tall",
  "german": "Der Mann ist groß",
  "hints": ["Use 'der' for masculine nouns", "groß = tall"],
  "keywords": ["der", "Mann", "groß"],
  "difficulty": 3
}
```

### Fields

- **sentenceId**: Unique ID format: `{level}-{rule-slug}-{number}`
- **ruleId**: Must match a rule ID from `lib/data/grammar/levels/{level}.json`
- **english**: English sentence to translate (prompt for student)
- **german**: Correct German translation (answer)
- **hints** (optional): Array of hints to help students
- **keywords** (optional): Key vocabulary in the sentence
- **difficulty** (1-10): Difficulty rating

## How to Add Sentences

### Required: 20 sentences per grammar rule

For each grammar rule in `lib/data/grammar/levels/{level}.json`, create **20 practice sentences**.

### Example for A1

A1 has 26 grammar rules, so we need:
- **26 rules × 20 sentences = 520 total sentences for A1**

### Current Progress

- ✅ **a1-articles-definite**: 3/20 sentences (TEMPLATE - needs 17 more)
- ⬜ **a1-articles-indefinite**: 0/20 sentences
- ⬜ **a1-present-tense-regular**: 0/20 sentences
- ⬜ **a1-present-tense-sein**: 0/20 sentences
- ⬜ **a1-present-tense-haben**: 0/20 sentences
- ⬜ **a1-word-order-basic**: 0/20 sentences
- ⬜ **a1-nominative-case**: 0/20 sentences
- ⬜ **a1-accusative-case**: 0/20 sentences
- ... (18 more rules)

### Tips for Creating Sentences

1. **Start simple, gradually increase difficulty**
   - Sentences 1-5: Very basic (difficulty 2-3)
   - Sentences 6-15: Medium (difficulty 4-6)
   - Sentences 16-20: Harder (difficulty 7-8)

2. **Use varied vocabulary**
   - Don't repeat the same nouns/verbs
   - Cover different contexts (home, work, hobbies, etc.)

3. **Keep sentences practical**
   - Use real-world phrases students would actually say
   - Avoid overly complex or academic language

4. **Provide helpful hints**
   - Point out the grammar rule being practiced
   - Highlight tricky words or constructions

5. **Match the CEFR level**
   - A1: Very simple, present tense, basic vocabulary
   - B1: More complex, past tense, subordinate clauses
   - C1: Sophisticated, subjunctive, idiomatic expressions

## Automation Ideas

Consider creating a script to:
1. Read all grammar rules from `levels/*.json`
2. Generate sentence templates with proper IDs
3. Use AI to generate practice sentences (review manually!)

## File Naming

- `a1.json` - A1 level sentences
- `a2.json` - A2 level sentences
- `b1.json` - B1 level sentences
- `b2.json` - B2 level sentences
- `c1.json` - C1 level sentences
- `c2.json` - C2 level sentences
