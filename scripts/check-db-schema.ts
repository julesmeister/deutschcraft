import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');
const db = new Database(DB_PATH, { readonly: true });

// Get table schema
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='dictionary'").get();
console.log('📋 Dictionary table schema:\n');
console.log(schema);

// Get column info
const columns = db.prepare("PRAGMA table_info(dictionary)").all();
console.log('\n📊 Columns:\n');
columns.forEach((col: any) => {
  console.log(`  ${col.name} (${col.type})`);
});

// Get sample row
const sample = db.prepare("SELECT * FROM dictionary LIMIT 1").get();
console.log('\n📝 Sample row:\n');
console.log(sample);

db.close();
