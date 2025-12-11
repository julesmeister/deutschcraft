/**
 * Ensure B1 irregular verbs are unique across all levels
 * Automatically removes duplicates and adds replacements
 */

import * as fs from 'fs';
import * as path from 'path';

const LEVELS_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const B1_SPLIT_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split/b1');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags: string[];
  _meta?: any;
}

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// Comprehensive list of B1-appropriate irregular verbs to choose from
const CANDIDATE_VERBS = [
  { german: "backen", english: "to bake (bäckt/backt, backte/buk, gebacken)" },
  { german: "bergen", english: "to salvage / to rescue (birgt, barg, geborgen)" },
  { german: "bersten", english: "to burst (birst, barst, geborsten)" },
  { german: "biegen", english: "to bend (biegt, bog, gebogen)" },
  { german: "bitten", english: "to ask / to request (bittet, bat, gebeten)" },
  { german: "blasen", english: "to blow (bläst, blies, geblasen)" },
  { german: "braten", english: "to fry / to roast (brät, briet, gebraten)" },
  { german: "brechen", english: "to break (bricht, brach, gebrochen)" },
  { german: "dringen", english: "to penetrate / to urge (dringt, drang, gedrungen)" },
  { german: "empfangen", english: "to receive (empfängt, empfing, empfangen)" },
  { german: "empfehlen", english: "to recommend (empfiehlt, empfahl, empfohlen)" },
  { german: "fangen", english: "to catch (fängt, fing, gefangen)" },
  { german: "fechten", english: "to fence / to fight (ficht, focht, gefochten)" },
  { german: "flechten", english: "to braid / to weave (flicht, flocht, geflochten)" },
  { german: "fliegen", english: "to fly (fliegt, flog, geflogen)" },
  { german: "fliehen", english: "to flee (flieht, floh, geflohen)" },
  { german: "frieren", english: "to freeze (friert, fror, gefroren)" },
  { german: "gären", english: "to ferment (gärt, gor/gärte, gegoren/gegärt)" },
  { german: "gebären", english: "to give birth (gebiert/gebärt, gebar, geboren)" },
  { german: "glimmen", english: "to glow / to smolder (glimmt, glomm, geglommen)" },
  { german: "graben", english: "to dig (gräbt, grub, gegraben)" },
  { german: "hängen", english: "to hang (hängt, hing, gehangen)" },
  { german: "hauen", english: "to chop / to hit (haut, hieb, gehauen)" },
  { german: "heben", english: "to lift / to raise (hebt, hob, gehoben)" },
  { german: "klimmen", english: "to climb (klimmt, klomm, geklommen)" },
  { german: "kneifen", english: "to pinch (kneift, kniff, gekniffen)" },
  { german: "kriechen", english: "to crawl / to creep (kriecht, kroch, gekrochen)" },
  { german: "laden", english: "to load / to invite (lädt, lud, geladen)" },
  { german: "laufen", english: "to run (läuft, lief, gelaufen)" },
  { german: "leiden", english: "to suffer (leidet, litt, gelitten)" },
  { german: "leihen", english: "to lend / to borrow (leiht, lieh, geliehen)" },
  { german: "mahlen", english: "to grind (mahlt, mahlte, gemahlen)" },
  { german: "messen", english: "to measure (misst, maß, gemessen)" },
  { german: "preisen", english: "to praise (preist, pries, gepriesen)" },
  { german: "quellen", english: "to gush / to swell (quillt, quoll, gequollen)" },
  { german: "raten", english: "to advise / to guess (rät, riet, geraten)" },
  { german: "reiben", english: "to rub (reibt, rieb, gerieben)" },
  { german: "reiten", english: "to ride (reitet, ritt, geritten)" },
  { german: "rennen", english: "to run (rennt, rannte, gerannt)" },
  { german: "riechen", english: "to smell (riecht, roch, gerochen)" },
  { german: "ringen", english: "to wrestle / to struggle (ringt, rang, gerungen)" },
  { german: "rinnen", english: "to flow / to trickle (rinnt, rann, geronnen)" },
  { german: "rufen", english: "to call / to shout (ruft, rief, gerufen)" },
  { german: "saufen", english: "to drink (alcohol) (säuft, soff, gesoffen)" },
  { german: "saugen", english: "to suck (saugt, sog/saugte, gesogen/gesaugt)" },
  { german: "schaffen", english: "to create (schafft, schuf, geschaffen)" },
  { german: "scheiden", english: "to separate / to divorce (scheidet, schied, geschieden)" },
  { german: "scheinen", english: "to shine / to seem (scheint, schien, geschienen)" },
  { german: "schelten", english: "to scold (schilt, schalt, gescholten)" },
  { german: "scheren", english: "to shear / to bother (schert, schor, geschoren)" },
  { german: "schieben", english: "to push (schiebt, schob, geschoben)" },
  { german: "schießen", english: "to shoot (schießt, schoss, geschossen)" },
  { german: "schinden", english: "to flay / to toil (schindet, schund, geschunden)" },
  { german: "schlafen", english: "to sleep (schläft, schlief, geschlafen)" },
  { german: "schlagen", english: "to hit / to beat (schlägt, schlug, geschlagen)" },
  { german: "schleichen", english: "to sneak / to creep (schleicht, schlich, geschlichen)" },
  { german: "schleifen", english: "to grind / to drag (schleift, schliff, geschliffen)" },
  { german: "schlingen", english: "to wind / to devour (schlingt, schlang, geschlungen)" },
  { german: "schmeißen", english: "to throw / to toss (schmeißt, schmiss, geschmissen)" },
  { german: "schneiden", english: "to cut (schneidet, schnitt, geschnitten)" },
  { german: "schreien", english: "to scream / to shout (schreit, schrie, geschrien)" },
  { german: "schreiten", english: "to stride / to step (schreitet, schritt, geschritten)" },
  { german: "schwellen", english: "to swell (schwillt, schwoll, geschwollen)" },
  { german: "schwimmen", english: "to swim (schwimmt, schwamm, geschwommen)" },
  { german: "schwinden", english: "to diminish / to fade (schwindet, schwand, geschwunden)" },
  { german: "schwingen", english: "to swing (schwingt, schwang, geschwungen)" },
  { german: "singen", english: "to sing (singt, sang, gesungen)" },
  { german: "sinken", english: "to sink (sinkt, sank, gesunken)" },
  { german: "sinnen", english: "to ponder / to contemplate (sinnt, sann, gesonnen)" },
  { german: "speien", english: "to spit (speit, spie, gespie(e)n)" },
  { german: "spinnen", english: "to spin / to be crazy (spinnt, spann, gesponnen)" },
  { german: "sprechen", english: "to speak (spricht, sprach, gesprochen)" },
  { german: "sprießen", english: "to sprout (sprießt, spross, gesprossen)" },
  { german: "springen", english: "to jump (springt, sprang, gesprungen)" },
  { german: "stechen", english: "to sting / to prick (sticht, stach, gestochen)" },
  { german: "stehlen", english: "to steal (stiehlt, stahl, gestohlen)" },
  { german: "steigen", english: "to climb / to rise (steigt, stieg, gestiegen)" },
  { german: "sterben", english: "to die (stirbt, starb, gestorben)" },
  { german: "stinken", english: "to stink (stinkt, stank, gestunken)" },
  { german: "stoßen", english: "to push / to bump (stößt, stieß, gestoßen)" },
  { german: "streichen", english: "to paint / to delete (streicht, strich, gestrichen)" },
  { german: "streiten", english: "to argue / to quarrel (streitet, stritt, gestritten)" },
  { german: "tragen", english: "to carry / to wear (trägt, trug, getragen)" },
  { german: "treffen", english: "to meet / to hit (trifft, traf, getroffen)" },
  { german: "treiben", english: "to drive / to do sports (treibt, trieb, getrieben)" },
  { german: "treten", english: "to step / to kick (tritt, trat, getreten)" },
  { german: "triefen", english: "to drip (trieft, troff/triefte, getroffen/getrieft)" },
  { german: "trinken", english: "to drink (trinkt, trank, getrunken)" },
  { german: "trügen", english: "to deceive (trügt, trog, getrogen)" },
  { german: "verbieten", english: "to forbid (verbietet, verbot, verboten)" },
  { german: "verderben", english: "to spoil / to ruin (verdirbt, verdarb, verdorben)" },
  { german: "verdrießen", english: "to annoy / to vex (verdrießt, verdross, verdrossen)" },
  { german: "vergessen", english: "to forget (vergisst, vergaß, vergessen)" },
  { german: "verlieren", english: "to lose (verliert, verlor, verloren)" },
  { german: "verzeihen", english: "to forgive / to pardon (verzeiht, verzieh, verziehen)" },
  { german: "wachsen", english: "to grow (wächst, wuchs, gewachsen)" },
  { german: "waschen", english: "to wash (wäscht, wusch, gewaschen)" },
  { german: "weben", english: "to weave (webt, wob/webte, gewoben/gewebt)" },
  { german: "weichen", english: "to yield / to give way (weicht, wich, gewichen)" },
  { german: "weisen", english: "to show / to point (weist, wies, gewiesen)" },
  { german: "wenden", english: "to turn (wendet, wandte/wendete, gewandt/gewendet)" },
  { german: "werben", english: "to advertise / to recruit (wirbt, warb, geworben)" },
  { german: "werfen", english: "to throw (wirft, warf, geworfen)" },
  { german: "wiegen", english: "to weigh (wiegt, wog, gewogen)" },
  { german: "winden", english: "to wind / to twist (windet, wand, gewunden)" },
  { german: "wringen", english: "to wring (wringt, wrang, gewrungen)" },
  { german: "ziehen", english: "to pull / to move (zieht, zog, gezogen)" },
  { german: "zwingen", english: "to force / to compel (zwingt, zwang, gezwungen)" },
];

function loadCategoryFile(filename: string): CategoryFile {
  const filePath = path.join(B1_SPLIT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function saveCategoryFile(filename: string, data: CategoryFile) {
  const filePath = path.join(B1_SPLIT_DIR, filename);
  data.totalCards = data.flashcards.length;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function checkIfExistsInOtherLevels(verb: string): string[] {
  const foundInLevels: string[] = [];
  for (const level of ['a1', 'a2', 'b2', 'c1', 'c2']) {
    const filePath = path.join(LEVELS_DIR, `${level}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Match exact verb, accounting for potential whitespace variations
      const regex = new RegExp(`"german"\\s*:\\s*"${verb}"`, 'i');
      if (regex.test(content)) {
        foundInLevels.push(level.toUpperCase());
      }
    }
  }
  return foundInLevels;
}

function generateId(german: string): string {
  const clean = german.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const random = Math.random().toString(36).substring(2, 8);
  return `b1-irregular-${clean}-${random}`;
}

async function main() {
  console.log('🔧 Ensuring B1 Irregular Verbs are Unique\n');
  console.log('='.repeat(50));

  // Load irregular verbs
  const irregularVerbs = loadCategoryFile('irregular-verbs.json');
  console.log(`\n📂 Current irregular verbs: ${irregularVerbs.flashcards.length}`);

  // Check for duplicates
  const duplicates: Array<{ card: Flashcard; levels: string[] }> = [];
  irregularVerbs.flashcards.forEach(card => {
    const levels = checkIfExistsInOtherLevels(card.german);
    if (levels.length > 0) {
      duplicates.push({ card, levels });
    }
  });

  if (duplicates.length > 0) {
    console.log(`\n❌ Found ${duplicates.length} duplicates:`);
    duplicates.forEach(({ card, levels }) => {
      console.log(`   ${card.german}: ${levels.join(', ')}`);
    });

    // Remove duplicates
    const duplicateGerman = duplicates.map(d => d.card.german);
    irregularVerbs.flashcards = irregularVerbs.flashcards.filter(
      card => !duplicateGerman.includes(card.german)
    );

    console.log(`\n✅ Removed ${duplicates.length} duplicates`);
    console.log(`   Remaining: ${irregularVerbs.flashcards.length} verbs`);

    // Find unique replacements
    console.log(`\n🔍 Finding ${duplicates.length} unique replacements...`);
    const replacements: typeof CANDIDATE_VERBS = [];

    for (const candidate of CANDIDATE_VERBS) {
      if (replacements.length >= duplicates.length) break;

      // Check if already in B1
      const alreadyInB1 = irregularVerbs.flashcards.some(
        card => card.german === candidate.german
      );
      if (alreadyInB1) continue;

      // Check if in other levels
      const levels = checkIfExistsInOtherLevels(candidate.german);
      if (levels.length === 0) {
        replacements.push(candidate);
        console.log(`   ✅ ${candidate.german} - unique!`);
      }
    }

    // Add replacements
    replacements.forEach(verb => {
      const card: Flashcard = {
        id: generateId(verb.german),
        german: verb.german,
        english: verb.english,
        category: 'Irregular Verbs',
        level: 'B1',
        tags: ['irregular-verbs', 'B1'],
        _meta: {
          source: 'B1 Irregular Verbs Unique Verification 2025',
          lineNumber: irregularVerbs.flashcards.length,
          hierarchy: ['B1', 'Irregular Verbs', verb.german]
        }
      };
      irregularVerbs.flashcards.push(card);
      console.log(`   ➕ Added: ${verb.german}`);
    });
  } else {
    console.log('\n✅ No duplicates found! All verbs are unique.');
  }

  saveCategoryFile('irregular-verbs.json', irregularVerbs);

  console.log('\n' + '='.repeat(50));
  console.log('✨ Done!');
  console.log(`\n📊 Final count: ${irregularVerbs.flashcards.length} unique irregular verbs`);
}

main().catch(console.error);
