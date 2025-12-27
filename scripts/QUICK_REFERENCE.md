# Verb Analysis Tools - Quick Reference

**Last Updated:** 2025-12-28

---

## 🚀 Quick Start

### Run Analysis
```bash
# Analyze current verb distribution and find issues
node scripts/smart-verb-rearrange.js
```

**Output:**
- Verb counts by level
- Duplicate detection
- Suggested rearrangements with reasons

---

## 🔧 Common Tasks

### Check for Duplicates
```bash
node scripts/smart-verb-rearrange.js | grep -A 30 "DUPLICATE"
```

### View Current Statistics
```bash
node scripts/smart-verb-rearrange.js | grep -A 10 "STATISTICS"
```

### Fix Duplicates (if any found)
```bash
# Dry run first
node scripts/apply-verb-fixes.js

# Apply fixes
node scripts/apply-verb-fixes.js --live
```

---

## 🎯 Selective Rearrangements

### Preview Moves by Type
```bash
# Preview B1 → A2 moves
node scripts/apply-rearrangements.js --filter "B1 → A2"

# Preview A2 → A1 moves
node scripts/apply-rearrangements.js --filter "A2 → A1"

# Preview B2 → A2 moves
node scripts/apply-rearrangements.js --filter "B2 → A2"
```

### Apply Moves by Type
```bash
# Apply specific move type
node scripts/apply-rearrangements.js --live --filter "B1 → A2"
```

---

## 📊 Analysis Report

### View JSON Report
```bash
cat scripts/smart-verb-analysis.json
```

**Structure:**
```json
{
  "timestamp": "2025-12-28T...",
  "summary": {
    "totalVerbs": 1458,
    "byLevel": { "A1": 103, "A2": 449, ... },
    "duplicates": 0,
    "suggestedRearrangements": 31
  },
  "duplicates": [...],
  "suggestions": [
    {
      "verb": "zugeben",
      "english": "to admit",
      "currentLevel": "B1",
      "suggestedLevel": "A2",
      "reason": "Base verb 'geben' is A1-level",
      "confidence": "HIGH"
    }
  ],
  "verbsByLevel": { ... }
}
```

---

## 🛠️ Maintenance

### After Adding New Verbs
```bash
# 1. Run analysis to check for issues
node scripts/smart-verb-rearrange.js

# 2. Fix any duplicates
node scripts/apply-verb-fixes.js --live

# 3. Review suggestions and apply if appropriate
node scripts/apply-rearrangements.js --filter "B1 → A2"
```

### Verify Clean State
```bash
# Should show "✅ No duplicates found!"
node scripts/smart-verb-rearrange.js | grep "DUPLICATE" -A 5
```

---

## 📁 File Locations

### Vocabulary Files
```
lib/data/vocabulary/split/
├── a1/
│   ├── basic-verbs.json
│   ├── irregular-verbs.json
│   ├── modal-verbs.json
│   ├── reflexive-verbs.json
│   └── ...
├── a2/
│   ├── common-verbs.json
│   ├── separable-verbs.json
│   ├── irregular-verbs.json
│   └── ...
└── b1/, b2/, c1/, c2/
```

### Scripts
```
scripts/
├── smart-verb-rearrange.js       ⭐ Main analysis
├── apply-rearrangements.js       🔧 Move verbs
├── apply-verb-fixes.js           🔧 Fix duplicates
├── smart-verb-analysis.json      📊 Latest report
├── FINAL_VERB_SUMMARY.md         📝 Complete docs
└── QUICK_REFERENCE.md            📖 This file
```

---

## 🎓 Understanding the Analysis

### Complexity Scoring
- **0-25:** A1 level (basic, high frequency)
- **26-40:** A2 level (common, everyday)
- **41-60:** B1 level (intermediate)
- **61-75:** B2 level (upper intermediate)
- **76-85:** C1 level (advanced)
- **86-100:** C2 level (mastery)

### Factors That Increase Complexity
- Separable prefix: +15 points
- Reflexive form: +10 points
- Inseparable prefix: +20 points
- Length > 10 chars: +10 points
- Compound structure: +15 points

### Frequency Overrides Complexity
- Top 50 verbs → A1 (regardless of features)
- Top 200 verbs → A2 (if not in top 50)

---

## 🔍 Example Workflows

### Workflow 1: Monthly Maintenance
```bash
# 1. Run analysis
node scripts/smart-verb-rearrange.js > monthly_report.txt

# 2. Check for duplicates
grep "DUPLICATE" monthly_report.txt

# 3. Fix if needed
node scripts/apply-verb-fixes.js --live

# 4. Review suggestions
grep "SUGGESTED" monthly_report.txt -A 20
```

### Workflow 2: After Bulk Import
```bash
# 1. Check what changed
node scripts/smart-verb-rearrange.js

# 2. Identify problematic level (e.g., B1 too large)
# If B1 > 750 verbs, move some to A2

# 3. Apply selective moves
node scripts/apply-rearrangements.js --live --filter "B1 → A2"

# 4. Verify result
node scripts/smart-verb-rearrange.js | grep "STATISTICS" -A 10
```

### Workflow 3: Custom Analysis
```bash
# Extract all A1 verbs to review
node -e "
const report = require('./scripts/smart-verb-analysis.json');
const a1Verbs = report.verbsByLevel.A1;
console.log(JSON.stringify(a1Verbs, null, 2));
" > a1_verbs.json
```

---

## ⚠️ Important Notes

### Do NOT Auto-Apply Everything
- **Frequency ≠ Pedagogical order**
- Example: "lesen" (to read) is top 200, but stays at A1
- Always review suggestions before applying

### Separable Verbs Follow Base Verbs
- If "geben" is A1 → "angeben" should be A2
- If "nehmen" is A1 → "vornehmen" should be A2
- This pattern is reliable and can be auto-applied

### Literary/Formal Verbs Stay High
- "sich zutragen" is literary → stays C2
- "sich erdreisten" is formal → stays C2
- Even if base verb is simple

---

## 🎯 Quality Checks

### Before Committing Changes
```bash
# 1. No duplicates
node scripts/smart-verb-rearrange.js | grep "No duplicates"

# 2. Reasonable distribution
# A1: ~100, A2: ~400-450, B1: ~700-750, B2: ~130

# 3. All files valid JSON
for file in lib/data/vocabulary/split/*/*.json; do
  node -e "require('$file')" || echo "Invalid: $file"
done
```

### After Major Changes
```bash
# Create backup first
cp -r lib/data/vocabulary/split lib/data/vocabulary/split_backup_$(date +%Y%m%d)

# Run changes
node scripts/apply-rearrangements.js --live

# Verify
node scripts/smart-verb-rearrange.js

# If issues, restore backup
# rm -rf lib/data/vocabulary/split
# mv lib/data/vocabulary/split_backup_YYYYMMDD lib/data/vocabulary/split
```

---

## 📞 Support

**Documentation:**
- `FINAL_VERB_SUMMARY.md` - Complete project summary
- `smart-verb-analysis.json` - Latest analysis data
- This file - Quick reference

**Re-run Analysis:**
```bash
node scripts/smart-verb-rearrange.js
```

**Common Issues:**
1. **"File not found"** → Run from project root
2. **"JSON parse error"** → Check file format
3. **"Too many suggestions"** → Filter by type

---

*Last analyzed: 2025-12-28*
*Status: ✅ Clean (0 duplicates, logical distribution)*
