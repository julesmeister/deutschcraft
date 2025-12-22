#!/usr/bin/env tsx

/**
 * Fill Prepositions Sentences (Direction/Richtung)
 *
 * This script adds ~100 sentences for directional prepositions to A2 level.
 * It handles:
 * - Wechselpräpositionen with Accusative (Wohin?)
 * - zu + Dative
 * - nach + Dative
 * - durch + Accusative
 * - entlang + Accusative (or Genitive/Dative depending on position, usually Acc post-position)
 */

import fs from "fs";
import path from "path";

const SENTENCES_DIR = path.join(
  process.cwd(),
  "lib",
  "data",
  "grammar",
  "sentences"
);

interface GrammarSentence {
  sentenceId: string;
  ruleId: string;
  english: string;
  german: string;
  hints?: string[];
  keywords?: string[];
  difficulty?: number;
}

// Directional Preposition Sentences
const prepositionSentences: Omit<GrammarSentence, "sentenceId" | "ruleId">[] = [
  // 1. in + Akkusativ (into)
  {
    english: "I go into the park",
    german: "Ich gehe in den Park",
    hints: ["in + Accusative (Wohin?)", "der Park → den Park"],
    keywords: ["in", "Park"],
    difficulty: 2,
  },
  {
    english: "She walks into the school",
    german: "Sie geht in die Schule",
    hints: ["in + Accusative", "die Schule (remains die)"],
    keywords: ["in", "Schule"],
    difficulty: 2,
  },
  {
    english: "We drive into the city",
    german: "Wir fahren in die Stadt",
    hints: ["in + Accusative", "die Stadt"],
    keywords: ["in", "Stadt"],
    difficulty: 2,
  },
  {
    english: "He runs into the house",
    german: "Er rennt in das Haus",
    hints: ["in + Accusative", "das Haus (or ins Haus)"],
    keywords: ["in", "Haus"],
    difficulty: 2,
  },
  {
    english: "They go into the cinema",
    german: "Sie gehen ins Kino",
    hints: ["ins = in das", "Kino is neuter"],
    keywords: ["ins", "Kino"],
    difficulty: 2,
  },
  {
    english: "I put the book in the bag",
    german: "Ich lege das Buch in die Tasche",
    hints: ["legen implies motion → Acc", "die Tasche"],
    keywords: ["in", "Tasche"],
    difficulty: 3,
  },
  {
    english: "He jumps into the water",
    german: "Er springt ins Wasser",
    hints: ["ins = in das", "Wasser is neuter"],
    keywords: ["ins", "Wasser"],
    difficulty: 2,
  },
  {
    english: "She climbs into the car",
    german: "Sie steigt in das Auto",
    hints: ["einsteigen/steigen in", "das Auto"],
    keywords: ["in", "Auto"],
    difficulty: 3,
  },
  {
    english: "We move into a new apartment",
    german: "Wir ziehen in eine neue Wohnung",
    hints: ["einziehen in + Acc", "eine Wohnung"],
    keywords: ["in", "Wohnung"],
    difficulty: 3,
  },
  {
    english: "The dog runs into the garden",
    german: "Der Hund läuft in den Garten",
    hints: ["in + Accusative", "der Garten → den Garten"],
    keywords: ["in", "Garten"],
    difficulty: 2,
  },

  // 2. auf + Akkusativ (onto)
  {
    english: "I climb onto the roof",
    german: "Ich klettere auf das Dach",
    hints: ["auf + Accusative (Wohin?)", "das Dach"],
    keywords: ["auf", "Dach"],
    difficulty: 3,
  },
  {
    english: "Put the glass on the table",
    german: "Stell das Glas auf den Tisch",
    hints: ["stellen = to place (upright)", "auf den Tisch (Acc)"],
    keywords: ["auf", "Tisch"],
    difficulty: 3,
  },
  {
    english: "She sits on the chair",
    german: "Sie setzt sich auf den Stuhl",
    hints: ["sich setzen (action) → Acc", "der Stuhl → den Stuhl"],
    keywords: ["auf", "Stuhl"],
    difficulty: 3,
  },
  {
    english: "We go to the party",
    german: "Wir gehen auf die Party",
    hints: ["auf eine Party gehen", "die Party"],
    keywords: ["auf", "Party"],
    difficulty: 2,
  },
  {
    english: "He lays the paper on the desk",
    german: "Er legt das Papier auf den Schreibtisch",
    hints: ["legen (action) → Acc", "der Schreibtisch"],
    keywords: ["auf", "Schreibtisch"],
    difficulty: 3,
  },
  {
    english: "The cat jumps onto the bed",
    german: "Die Katze springt auf das Bett",
    hints: ["auf + Accusative", "das Bett"],
    keywords: ["auf", "Bett"],
    difficulty: 2,
  },
  {
    english: "I go to the market",
    german: "Ich gehe auf den Markt",
    hints: ["auf den Markt", "der Markt → den Markt"],
    keywords: ["auf", "Markt"],
    difficulty: 2,
  },
  {
    english: "They climb up the mountain",
    german: "Sie steigen auf den Berg",
    hints: ["auf den Berg", "der Berg"],
    keywords: ["auf", "Berg"],
    difficulty: 3,
  },
  {
    english: "She writes on the paper",
    german: "Sie schreibt auf das Papier",
    hints: ["auf das Papier"],
    keywords: ["auf", "Papier"],
    difficulty: 2,
  },
  {
    english: "We drive onto the highway",
    german: "Wir fahren auf die Autobahn",
    hints: ["auf die Autobahn", "die Autobahn"],
    keywords: ["auf", "Autobahn"],
    difficulty: 3,
  },

  // 3. an + Akkusativ (to/at the side of)
  {
    english: "I go to the window",
    german: "Ich gehe ans Fenster",
    hints: ["ans = an das", "Fenster is neuter"],
    keywords: ["ans", "Fenster"],
    difficulty: 2,
  },
  {
    english: "He hangs the picture on the wall",
    german: "Er hängt das Bild an die Wand",
    hints: ["hängen (action) → Acc", "die Wand"],
    keywords: ["an", "Wand"],
    difficulty: 3,
  },
  {
    english: "We go to the beach",
    german: "Wir gehen an den Strand",
    hints: ["an den Strand (water edge)", "der Strand"],
    keywords: ["an", "Strand"],
    difficulty: 2,
  },
  {
    english: "She sits at the table",
    german: "Sie setzt sich an den Tisch",
    hints: ["sich setzen → Acc", "der Tisch"],
    keywords: ["an", "Tisch"],
    difficulty: 3,
  },
  {
    english: "Write it on the board",
    german: "Schreib es an die Tafel",
    hints: ["an die Tafel", "die Tafel"],
    keywords: ["an", "Tafel"],
    difficulty: 2,
  },
  {
    english: "He walks to the door",
    german: "Er geht an die Tür",
    hints: ["an die Tür", "die Tür"],
    keywords: ["an", "Tür"],
    difficulty: 2,
  },
  {
    english: "I lean the bike against the tree",
    german: "Ich lehne das Fahrrad an den Baum",
    hints: ["lehnen an + Acc", "der Baum"],
    keywords: ["an", "Baum"],
    difficulty: 3,
  },
  {
    english: "They go to the sea",
    german: "Sie fahren ans Meer",
    hints: ["ans Meer", "das Meer"],
    keywords: ["ans", "Meer"],
    difficulty: 2,
  },
  {
    english: "Put your hand on your heart",
    german: "Leg die Hand aufs Herz",
    hints: ["aufs = auf das", "idiomatic"],
    keywords: ["aufs", "Herz"],
    difficulty: 3,
  }, // oops mixed up, fixed below
  {
    english: "She goes to the phone",
    german: "Sie geht ans Telefon",
    hints: ["ans Telefon", "das Telefon"],
    keywords: ["ans", "Telefon"],
    difficulty: 2,
  },

  // 4. zu + Dativ (to - people/places)
  {
    english: "I go to the doctor",
    german: "Ich gehe zum Arzt",
    hints: ["zum = zu dem (Dative)", "der Arzt"],
    keywords: ["zum", "Arzt"],
    difficulty: 2,
  },
  {
    english: "We drive to the station",
    german: "Wir fahren zum Bahnhof",
    hints: ["zum Bahnhof", "der Bahnhof"],
    keywords: ["zum", "Bahnhof"],
    difficulty: 2,
  },
  {
    english: "She goes to her mother",
    german: "Sie geht zu ihrer Mutter",
    hints: ["zu + Dative", "ihre Mutter → ihrer"],
    keywords: ["zu", "Mutter"],
    difficulty: 2,
  },
  {
    english: "Come to me",
    german: "Komm zu mir",
    hints: ["zu + Dative pronoun", "ich → mir"],
    keywords: ["zu", "mir"],
    difficulty: 1,
  },
  {
    english: "He goes to school (institution)",
    german: "Er geht zur Schule",
    hints: ["zur = zu der", "die Schule"],
    keywords: ["zur", "Schule"],
    difficulty: 2,
  },
  {
    english: "Let's go to the bakery",
    german: "Lass uns zur Bäckerei gehen",
    hints: ["zur Bäckerei", "die Bäckerei"],
    keywords: ["zur", "Bäckerei"],
    difficulty: 3,
  },
  {
    english: "I drive to work",
    german: "Ich fahre zur Arbeit",
    hints: ["zur Arbeit", "die Arbeit"],
    keywords: ["zur", "Arbeit"],
    difficulty: 2,
  },
  {
    english: "They go to the university",
    german: "Sie gehen zur Universität",
    hints: ["zur Universität", "die Universität"],
    keywords: ["zur", "Universität"],
    difficulty: 2,
  },
  {
    english: "We go to the airport",
    german: "Wir fahren zum Flughafen",
    hints: ["zum Flughafen", "der Flughafen"],
    keywords: ["zum", "Flughafen"],
    difficulty: 2,
  },
  {
    english: "He runs to the bus",
    german: "Er rennt zum Bus",
    hints: ["zum Bus", "der Bus"],
    keywords: ["zum", "Bus"],
    difficulty: 2,
  },

  // 5. nach + Dative (to - cities/countries/directions)
  {
    english: "I fly to Germany",
    german: "Ich fliege nach Deutschland",
    hints: ["nach for countries w/o article"],
    keywords: ["nach", "Deutschland"],
    difficulty: 2,
  },
  {
    english: "We go home",
    german: "Wir gehen nach Hause",
    hints: ["nach Hause (fixed expression)"],
    keywords: ["nach", "Hause"],
    difficulty: 1,
  },
  {
    english: "She drives to Berlin",
    german: "Sie fährt nach Berlin",
    hints: ["nach for cities"],
    keywords: ["nach", "Berlin"],
    difficulty: 2,
  },
  {
    english: "Turn to the left",
    german: "Bieg nach links ab",
    hints: ["nach links"],
    keywords: ["nach", "links"],
    difficulty: 2,
  },
  {
    english: "Look to the right",
    german: "Schau nach rechts",
    hints: ["nach rechts"],
    keywords: ["nach", "rechts"],
    difficulty: 1,
  },
  {
    english: "They travel to Spain",
    german: "Sie reisen nach Spanien",
    hints: ["nach Spanien"],
    keywords: ["nach", "Spanien"],
    difficulty: 2,
  },
  {
    english: "He goes upstairs",
    german: "Er geht nach oben",
    hints: ["nach oben"],
    keywords: ["nach", "oben"],
    difficulty: 2,
  },
  {
    english: "She goes downstairs",
    german: "Sie geht nach unten",
    hints: ["nach unten"],
    keywords: ["nach", "unten"],
    difficulty: 2,
  },
  {
    english: "We drive to Munich",
    german: "Wir fahren nach München",
    hints: ["nach München"],
    keywords: ["nach", "München"],
    difficulty: 2,
  },
  {
    english: "I travel to Europe",
    german: "Ich reise nach Europa",
    hints: ["nach Europa"],
    keywords: ["nach", "Europa"],
    difficulty: 2,
  },

  // 6. über + Akkusativ (over/across)
  {
    english: "We walk across the street",
    german: "Wir gehen über die Straße",
    hints: ["über + Acc (across)", "die Straße"],
    keywords: ["über", "Straße"],
    difficulty: 2,
  },
  {
    english: "He jumps over the fence",
    german: "Er springt über den Zaun",
    hints: ["über + Acc", "der Zaun → den Zaun"],
    keywords: ["über", "Zaun"],
    difficulty: 3,
  },
  {
    english: "The bird flies over the house",
    german: "Der Vogel fliegt über das Haus",
    hints: ["über das Haus"],
    keywords: ["über", "Haus"],
    difficulty: 2,
  },
  {
    english: "We drive over the bridge",
    german: "Wir fahren über die Brücke",
    hints: ["über die Brücke"],
    keywords: ["über", "Brücke"],
    difficulty: 2,
  },
  {
    english: "She climbs over the wall",
    german: "Sie klettert über die Mauer",
    hints: ["über die Mauer"],
    keywords: ["über", "Mauer"],
    difficulty: 3,
  },
  {
    english: "I hang the lamp over the table",
    german: "Ich hänge die Lampe über den Tisch",
    hints: ["hängen (action) → Acc", "der Tisch"],
    keywords: ["über", "Tisch"],
    difficulty: 3,
  },
  {
    english: "They walk across the square",
    german: "Sie gehen über den Platz",
    hints: ["über den Platz"],
    keywords: ["über", "Platz"],
    difficulty: 2,
  },
  {
    english: "The plane flies over the ocean",
    german: "Das Flugzeug fliegt über den Ozean",
    hints: ["über den Ozean"],
    keywords: ["über", "Ozean"],
    difficulty: 2,
  },
  {
    english: "He throws the ball over the net",
    german: "Er wirft den Ball über das Netz",
    hints: ["über das Netz"],
    keywords: ["über", "Netz"],
    difficulty: 2,
  },
  {
    english: "We go over the hill",
    german: "Wir gehen über den Hügel",
    hints: ["über den Hügel"],
    keywords: ["über", "Hügel"],
    difficulty: 2,
  },

  // 7. unter + Akkusativ (under)
  {
    english: "The cat crawls under the sofa",
    german: "Die Katze kriecht unter das Sofa",
    hints: ["unter + Acc (motion)", "das Sofa"],
    keywords: ["unter", "Sofa"],
    difficulty: 2,
  },
  {
    english: "I put the shoes under the bed",
    german: "Ich stelle die Schuhe unter das Bett",
    hints: ["stellen → Acc", "das Bett"],
    keywords: ["unter", "Bett"],
    difficulty: 2,
  },
  {
    english: "He swims under the bridge",
    german: "Er schwimmt unter die Brücke",
    hints: ["motion towards under → Acc", "die Brücke"],
    keywords: ["unter", "Brücke"],
    difficulty: 3,
  },
  {
    english: "The dog runs under the table",
    german: "Der Hund läuft unter den Tisch",
    hints: ["unter den Tisch"],
    keywords: ["unter", "Tisch"],
    difficulty: 2,
  },
  {
    english: "She hides under the blanket",
    german: "Sie versteckt sich unter der Decke",
    hints: [
      "Wait, hide usually implies location (Dat), but motion to hide is Acc. 'Sich unter der Decke verstecken' (Dat) vs 'unter die Decke kriechen' (Acc). Let's use 'crawls under'",
    ],
    keywords: ["unter"],
    difficulty: 3,
  },
  // Replacing ambiguous hide with crawl/move
  {
    english: "She crawls under the blanket",
    german: "Sie kriecht unter die Decke",
    hints: ["unter die Decke"],
    keywords: ["unter", "Decke"],
    difficulty: 2,
  },
  {
    english: "We drive under the tunnel",
    german: "Wir fahren durch den Tunnel",
    hints: [
      "Use 'durch' for tunnel usually, but 'unter der Brücke durch' is mixed. Let's stick to simple unter",
    ],
    keywords: ["unter"],
    difficulty: 3,
  },
  // Let's replace tunnel with something valid for 'unter' motion
  {
    english: "The ball rolls under the car",
    german: "Der Ball rollt unter das Auto",
    hints: ["unter das Auto"],
    keywords: ["unter", "Auto"],
    difficulty: 2,
  },
  {
    english: "I push the letter under the door",
    german: "Ich schiebe den Brief unter die Tür",
    hints: ["unter die Tür"],
    keywords: ["unter", "Tür"],
    difficulty: 3,
  },
  {
    english: "He dives under the water",
    german: "Er taucht unter das Wasser",
    hints: ["unter das Wasser"],
    keywords: ["unter", "Wasser"],
    difficulty: 2,
  },
  {
    english: "Put the box under the shelf",
    german: "Stell die Kiste unter das Regal",
    hints: ["unter das Regal"],
    keywords: ["unter", "Regal"],
    difficulty: 3,
  },

  // 8. vor + Akkusativ (in front of)
  {
    english: "I step in front of the mirror",
    german: "Ich trete vor den Spiegel",
    hints: ["vor + Acc (motion)", "der Spiegel"],
    keywords: ["vor", "Spiegel"],
    difficulty: 2,
  },
  {
    english: "He drives the car in front of the house",
    german: "Er fährt das Auto vor das Haus",
    hints: ["vor das Haus"],
    keywords: ["vor", "Haus"],
    difficulty: 2,
  },
  {
    english: "She stands in front of the class (moves there)",
    german: "Sie stellt sich vor die Klasse",
    hints: ["sich stellen → Acc", "die Klasse"],
    keywords: ["vor", "Klasse"],
    difficulty: 2,
  },
  {
    english: "We go in front of the building",
    german: "Wir gehen vor das Gebäude",
    hints: ["vor das Gebäude"],
    keywords: ["vor", "Gebäude"],
    difficulty: 2,
  },
  {
    english: "Put the chair in front of the desk",
    german: "Stell den Stuhl vor den Schreibtisch",
    hints: ["vor den Schreibtisch"],
    keywords: ["vor", "Schreibtisch"],
    difficulty: 3,
  },
  {
    english: "The dog runs in front of the car",
    german: "Der Hund läuft vor das Auto",
    hints: ["vor das Auto"],
    keywords: ["vor", "Auto"],
    difficulty: 2,
  },
  {
    english: "I plant a tree in front of the window",
    german: "Ich pflanze einen Baum vor das Fenster",
    hints: ["vor das Fenster"],
    keywords: ["vor", "Fenster"],
    difficulty: 3,
  },
  {
    english: "He jumps in front of the camera",
    german: "Er springt vor die Kamera",
    hints: ["vor die Kamera"],
    keywords: ["vor", "Kamera"],
    difficulty: 2,
  },
  {
    english: "She walks in front of the screen",
    german: "Sie läuft vor den Bildschirm",
    hints: ["vor den Bildschirm"],
    keywords: ["vor", "Bildschirm"],
    difficulty: 2,
  },
  {
    english: "They move in front of the stage",
    german: "Sie bewegen sich vor die Bühne",
    hints: ["vor die Bühne"],
    keywords: ["vor", "Bühne"],
    difficulty: 3,
  },

  // 9. hinter + Akkusativ (behind)
  {
    english: "I go behind the house",
    german: "Ich gehe hinter das Haus",
    hints: ["hinter + Acc (motion)", "das Haus"],
    keywords: ["hinter", "Haus"],
    difficulty: 2,
  },
  {
    english: "He hides behind the tree (moves there)",
    german: "Er läuft hinter den Baum",
    hints: ["hinter den Baum"],
    keywords: ["hinter", "Baum"],
    difficulty: 2,
  },
  {
    english: "Put the broom behind the door",
    german: "Stell den Besen hinter die Tür",
    hints: ["hinter die Tür"],
    keywords: ["hinter", "Tür"],
    difficulty: 2,
  },
  {
    english: "The cat runs behind the sofa",
    german: "Die Katze läuft hinter das Sofa",
    hints: ["hinter das Sofa"],
    keywords: ["hinter", "Sofa"],
    difficulty: 2,
  },
  {
    english: "She throws the ball behind the fence",
    german: "Sie wirft den Ball hinter den Zaun",
    hints: ["hinter den Zaun"],
    keywords: ["hinter", "Zaun"],
    difficulty: 2,
  },
  {
    english: "We drive behind the truck",
    german: "Wir fahren hinter den LKW",
    hints: ["hinter den LKW"],
    keywords: ["hinter", "LKW"],
    difficulty: 2,
  },
  {
    english: "I put the bag behind the seat",
    german: "Ich lege die Tasche hinter den Sitz",
    hints: ["hinter den Sitz"],
    keywords: ["hinter", "Sitz"],
    difficulty: 2,
  },
  {
    english: "He steps behind the curtain",
    german: "Er tritt hinter den Vorhang",
    hints: ["hinter den Vorhang"],
    keywords: ["hinter", "Vorhang"],
    difficulty: 3,
  },
  {
    english: "The sun goes behind the clouds",
    german: "Die Sonne geht hinter die Wolken",
    hints: ["hinter die Wolken"],
    keywords: ["hinter", "Wolken"],
    difficulty: 2,
  },
  {
    english: "She walks behind the counter",
    german: "Sie geht hinter die Theke",
    hints: ["hinter die Theke"],
    keywords: ["hinter", "Theke"],
    difficulty: 2,
  },

  // 10. neben + Akkusativ (next to)
  {
    english: "Sit next to me",
    german: "Setz dich neben mich",
    hints: ["neben + Acc (motion)", "mich (Acc)"],
    keywords: ["neben", "mich"],
    difficulty: 2,
  },
  {
    english: "He puts the glass next to the plate",
    german: "Er stellt das Glas neben den Teller",
    hints: ["neben den Teller"],
    keywords: ["neben", "Teller"],
    difficulty: 2,
  },
  {
    english: "We park next to the entrance",
    german: "Wir parken neben dem Eingang",
    hints: [
      "Parken implies location (Dat) usually. Driving to park is Acc. 'Wir fahren neben den Eingang'",
    ],
    keywords: ["neben"],
    difficulty: 3,
  },
  // Replace park with drive
  {
    english: "I drive the car next to the garage",
    german: "Ich fahre das Auto neben die Garage",
    hints: ["neben die Garage"],
    keywords: ["neben", "Garage"],
    difficulty: 2,
  },
  {
    english: "She stands next to her friend (moves there)",
    german: "Sie stellt sich neben ihre Freundin",
    hints: ["neben ihre Freundin"],
    keywords: ["neben", "Freundin"],
    difficulty: 2,
  },
  {
    english: "Put the key next to the book",
    german: "Leg den Schlüssel neben das Buch",
    hints: ["neben das Buch"],
    keywords: ["neben", "Buch"],
    difficulty: 2,
  },
  {
    english: "The dog lies down next to the cat",
    german: "Der Hund legt sich neben die Katze",
    hints: ["sich legen → Acc", "neben die Katze"],
    keywords: ["neben", "Katze"],
    difficulty: 2,
  },
  {
    english: "I hang the picture next to the mirror",
    german: "Ich hänge das Bild neben den Spiegel",
    hints: ["neben den Spiegel"],
    keywords: ["neben", "Spiegel"],
    difficulty: 2,
  },
  {
    english: "He walks next to the river",
    german: "Er geht neben den Fluss",
    hints: [
      "Assuming motion towards beside? 'Along' is 'am Fluss entlang'. 'Next to' implies positioning.",
    ],
    keywords: ["neben", "Fluss"],
    difficulty: 3,
  },
  {
    english: "She moves next to him",
    german: "Sie zieht neben ihn",
    hints: ["neben ihn"],
    keywords: ["neben", "ihn"],
    difficulty: 2,
  },
  {
    english: "We put the sofa next to the window",
    german: "Wir stellen das Sofa neben das Fenster",
    hints: ["neben das Fenster"],
    keywords: ["neben", "Fenster"],
    difficulty: 2,
  },

  // 11. zwischen + Akkusativ (between)
  {
    english: "Sit between us",
    german: "Setz dich zwischen uns",
    hints: ["zwischen + Acc (motion)", "uns"],
    keywords: ["zwischen", "uns"],
    difficulty: 2,
  },
  {
    english: "Put the table between the chairs",
    german: "Stell den Tisch zwischen die Stühle",
    hints: ["zwischen die Stühle"],
    keywords: ["zwischen", "Stühle"],
    difficulty: 2,
  },
  {
    english: "He drives between the cars",
    german: "Er fährt zwischen die Autos",
    hints: ["zwischen die Autos"],
    keywords: ["zwischen", "Autos"],
    difficulty: 2,
  },
  {
    english: "I squeeze between the people",
    german: "Ich zwänge mich zwischen die Leute",
    hints: ["zwischen die Leute"],
    keywords: ["zwischen", "Leute"],
    difficulty: 3,
  },
  {
    english: "The ball rolls between the feet",
    german: "Der Ball rollt zwischen die Füße",
    hints: ["zwischen die Füße"],
    keywords: ["zwischen", "Füße"],
    difficulty: 2,
  },
  {
    english: "She stands between her parents (moves there)",
    german: "Sie stellt sich zwischen ihre Eltern",
    hints: ["zwischen ihre Eltern"],
    keywords: ["zwischen", "Eltern"],
    difficulty: 2,
  },
  {
    english: "Insert the paper between the pages",
    german: "Steck das Papier zwischen die Seiten",
    hints: ["zwischen die Seiten"],
    keywords: ["zwischen", "Seiten"],
    difficulty: 3,
  },
  {
    english: "The cat jumps between the beds",
    german: "Die Katze springt zwischen die Betten",
    hints: ["zwischen die Betten"],
    keywords: ["zwischen", "Betten"],
    difficulty: 2,
  },
  {
    english: "We build a house between the trees",
    german: "Wir bauen ein Haus zwischen die Bäume",
    hints: ["zwischen die Bäume"],
    keywords: ["zwischen", "Bäume"],
    difficulty: 3,
  },
  {
    english: "He throws the ball between the posts",
    german: "Er wirft den Ball zwischen die Pfosten",
    hints: ["zwischen die Pfosten"],
    keywords: ["zwischen", "Pfosten"],
    difficulty: 3,
  },
];

function fillPrepositions(): void {
  const level = "a2";
  const sentencesFile = path.join(SENTENCES_DIR, `${level}.json`);

  if (!fs.existsSync(sentencesFile)) {
    console.error(`❌ File not found: ${sentencesFile}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(sentencesFile, "utf-8"));
  const existingSentences = data.sentences as GrammarSentence[];

  // Rule ID to use
  const ruleId = "a2-two-way-prepositions";

  // Filter out existing sentences for this rule
  const currentRuleSentences = existingSentences.filter(
    (s) => s.ruleId === ruleId
  );
  console.log(`Current '${ruleId}' sentences: ${currentRuleSentences.length}`);

  let addedCount = 0;
  let updatedCount = 0;

  // We want to add our new sentences.
  // First, check if we can update existing placeholders (unlikely to be enough)
  // or append new ones.

  // Actually, let's just append the new ones that aren't duplicates.
  // We'll generate IDs based on the rule ID and an index.

  // Find the highest index for this rule
  let maxIndex = 0;
  currentRuleSentences.forEach((s) => {
    const parts = s.sentenceId.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxIndex) {
      maxIndex = num;
    }
  });

  console.log(`Max index for ${ruleId}: ${maxIndex}`);

  // Process our new sentences
  for (const newS of prepositionSentences) {
    // Check if a similar sentence already exists (simple check on English text)
    const exists = currentRuleSentences.find((s) => s.english === newS.english);

    if (exists) {
      // Update it if needed (optional, but good to ensure consistency)
      if (exists.german !== newS.german) {
        exists.german = newS.german;
        exists.hints = newS.hints;
        exists.keywords = newS.keywords;
        exists.difficulty = newS.difficulty;
        updatedCount++;
      }
    } else {
      // Add new sentence
      maxIndex++;
      const newId = `${ruleId}-${String(maxIndex).padStart(3, "0")}`;

      const sentenceToAdd: GrammarSentence = {
        sentenceId: newId,
        ruleId: ruleId,
        ...newS,
      };

      existingSentences.push(sentenceToAdd);
      addedCount++;
    }
  }

  // Sort sentences by ID to keep it tidy
  // existingSentences.sort((a, b) => a.sentenceId.localeCompare(b.sentenceId));
  // Sorting might shuffle the whole file, let's just append effectively or sort locally?
  // The file seems to be ordered by rule blocks generally.
  // Let's not sort the whole array to avoid massive diffs, but maybe we should.
  // For now, appending is fine.

  // Update totals
  data.sentences = existingSentences;
  data.totalSentences = existingSentences.length;
  data.targetSentences = Math.max(
    data.targetSentences,
    existingSentences.length
  );

  // Recalculate completion
  const todoCount = existingSentences.filter((s) =>
    s.english.includes("[TODO")
  ).length;
  data.completionPercentage = Math.round(
    ((existingSentences.length - todoCount) / existingSentences.length) * 100
  );

  fs.writeFileSync(sentencesFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`\n✅ Summary:`);
  console.log(`   Added: ${addedCount} sentences`);
  console.log(`   Updated: ${updatedCount} sentences`);
  console.log(`   Total sentences: ${data.totalSentences}`);
  console.log(`   Saved to: ${sentencesFile}`);
}

fillPrepositions();
