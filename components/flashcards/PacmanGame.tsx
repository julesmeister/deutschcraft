"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/Button";
import confetti from "canvas-confetti";

export interface PacmanGameRef {
  endGame: () => void;
}

// German verb prefixes
const PREFIXES = [
  "ab-", "an-", "auf-", "aus-", "be-", "bei-", "dar-", "durch-", "ein-",
  "ent-", "er-", "fest-", "ge-", "her-", "hin-", "mit-", "nach-", "über-", "um-", "unter-",
  "ver-", "vor-", "weg-", "zu-", "zurück-"
];

// Root verbs with their prefix combinations and meanings
const VERB_DATA: VerbEntry[] = [
  // schreiben
  { root: "schreiben", prefix: "ab-", meaning: "to copy (writing)", full: "abschreiben" },
  { root: "schreiben", prefix: "an-", meaning: "to write to someone", full: "anschreiben" },
  { root: "schreiben", prefix: "auf-", meaning: "to write down", full: "aufschreiben" },
  { root: "schreiben", prefix: "aus-", meaning: "to write out / finish writing", full: "ausschreiben" },
  { root: "schreiben", prefix: "be-", meaning: "to describe", full: "beschreiben" },
  { root: "schreiben", prefix: "ein-", meaning: "to register / enroll", full: "einschreiben" },
  { root: "schreiben", prefix: "um-", meaning: "to rewrite", full: "umschreiben" },
  { root: "schreiben", prefix: "unter-", meaning: "to sign", full: "unterschreiben" },
  { root: "schreiben", prefix: "vor-", meaning: "to prescribe", full: "vorschreiben" },
  { root: "schreiben", prefix: "zu-", meaning: "to attribute to", full: "zuschreiben" },

  // nehmen
  { root: "nehmen", prefix: "ab-", meaning: "to lose weight / decrease", full: "abnehmen" },
  { root: "nehmen", prefix: "an-", meaning: "to accept / assume", full: "annehmen" },
  { root: "nehmen", prefix: "auf-", meaning: "to record / pick up", full: "aufnehmen" },
  { root: "nehmen", prefix: "aus-", meaning: "to take out / except", full: "ausnehmen" },
  { root: "nehmen", prefix: "ein-", meaning: "to take in / occupy", full: "einnehmen" },
  { root: "nehmen", prefix: "ent-", meaning: "to take from / gather", full: "entnehmen" },
  { root: "nehmen", prefix: "mit-", meaning: "to take along", full: "mitnehmen" },
  { root: "nehmen", prefix: "über-", meaning: "to take over", full: "übernehmen" },
  { root: "nehmen", prefix: "vor-", meaning: "to intend / plan", full: "vornehmen" },
  { root: "nehmen", prefix: "zu-", meaning: "to gain weight / increase", full: "zunehmen" },

  // kommen
  { root: "kommen", prefix: "an-", meaning: "to arrive", full: "ankommen" },
  { root: "kommen", prefix: "auf-", meaning: "to come up / arise", full: "aufkommen" },
  { root: "kommen", prefix: "aus-", meaning: "to come from / get by", full: "auskommen" },
  { root: "kommen", prefix: "be-", meaning: "to receive / get", full: "bekommen" },
  { root: "kommen", prefix: "ein-", meaning: "to come in / arrive", full: "einkommen" },
  { root: "kommen", prefix: "ent-", meaning: "to escape", full: "entkommen" },
  { root: "kommen", prefix: "mit-", meaning: "to come along", full: "mitkommen" },
  { root: "kommen", prefix: "nach-", meaning: "to follow / come after", full: "nachkommen" },
  { root: "kommen", prefix: "um-", meaning: "to die / perish", full: "umkommen" },
  { root: "kommen", prefix: "vor-", meaning: "to occur / happen", full: "vorkommen" },
  { root: "kommen", prefix: "zu-", meaning: "to approach / come to", full: "zukommen" },
  { root: "kommen", prefix: "zurück-", meaning: "to come back", full: "zurückkommen" },

  // gehen
  { root: "gehen", prefix: "ab-", meaning: "to leave / depart", full: "abgehen" },
  { root: "gehen", prefix: "an-", meaning: "to approach / concern", full: "angehen" },
  { root: "gehen", prefix: "auf-", meaning: "to open / rise (sun)", full: "aufgehen" },
  { root: "gehen", prefix: "aus-", meaning: "to go out", full: "ausgehen" },
  { root: "gehen", prefix: "ein-", meaning: "to enter / shrink", full: "eingehen" },
  { root: "gehen", prefix: "ent-", meaning: "to escape / elude", full: "entgehen" },
  { root: "gehen", prefix: "mit-", meaning: "to go along", full: "mitgehen" },
  { root: "gehen", prefix: "nach-", meaning: "to follow / investigate", full: "nachgehen" },
  { root: "gehen", prefix: "über-", meaning: "to go over / transition", full: "übergehen" },
  { root: "gehen", prefix: "um-", meaning: "to handle / deal with", full: "umgehen" },
  { root: "gehen", prefix: "unter-", meaning: "to sink / perish", full: "untergehen" },
  { root: "gehen", prefix: "vor-", meaning: "to proceed / go ahead", full: "vorgehen" },
  { root: "gehen", prefix: "weg-", meaning: "to go away", full: "weggehen" },
  { root: "gehen", prefix: "zu-", meaning: "to approach / close", full: "zugehen" },

  // stellen
  { root: "stellen", prefix: "ab-", meaning: "to turn off / put down", full: "abstellen" },
  { root: "stellen", prefix: "an-", meaning: "to turn on / hire", full: "anstellen" },
  { root: "stellen", prefix: "auf-", meaning: "to set up / put up", full: "aufstellen" },
  { root: "stellen", prefix: "aus-", meaning: "to exhibit / display", full: "ausstellen" },
  { root: "stellen", prefix: "be-", meaning: "to order (goods)", full: "bestellen" },
  { root: "stellen", prefix: "dar-", meaning: "to represent / depict", full: "darstellen" },
  { root: "stellen", prefix: "ein-", meaning: "to adjust / hire", full: "einstellen" },
  { root: "stellen", prefix: "her-", meaning: "to produce / manufacture", full: "herstellen" },
  { root: "stellen", prefix: "um-", meaning: "to rearrange / convert", full: "umstellen" },
  { root: "stellen", prefix: "vor-", meaning: "to introduce / present", full: "vorstellen" },
  { root: "stellen", prefix: "zu-", meaning: "to deliver / assign", full: "zustellen" },

  // geben
  { root: "geben", prefix: "ab-", meaning: "to hand in / submit", full: "abgeben" },
  { root: "geben", prefix: "an-", meaning: "to state / indicate", full: "angeben" },
  { root: "geben", prefix: "auf-", meaning: "to give up / assign", full: "aufgeben" },
  { root: "geben", prefix: "aus-", meaning: "to spend / distribute", full: "ausgeben" },
  { root: "geben", prefix: "be-", meaning: "to give / bestow", full: "begeben" },
  { root: "geben", prefix: "ein-", meaning: "to enter (data)", full: "eingeben" },
  { root: "geben", prefix: "er-", meaning: "to result / yield", full: "ergeben" },
  { root: "geben", prefix: "nach-", meaning: "to give in / yield", full: "nachgeben" },
  { root: "geben", prefix: "über-", meaning: "to hand over", full: "übergeben" },
  { root: "geben", prefix: "um-", meaning: "to surround", full: "umgeben" },
  { root: "geben", prefix: "ver-", meaning: "to forgive", full: "vergeben" },
  { root: "geben", prefix: "vor-", meaning: "to pretend", full: "vorgeben" },
  { root: "geben", prefix: "zu-", meaning: "to admit", full: "zugeben" },

  // fallen
  { root: "fallen", prefix: "ab-", meaning: "to drop / slope down", full: "abfallen" },
  { root: "fallen", prefix: "an-", meaning: "to accrue / arise", full: "anfallen" },
  { root: "fallen", prefix: "auf-", meaning: "to be noticeable", full: "auffallen" },
  { root: "fallen", prefix: "aus-", meaning: "to be canceled / fail", full: "ausfallen" },
  { root: "fallen", prefix: "be-", meaning: "to befall", full: "befallen" },
  { root: "fallen", prefix: "ein-", meaning: "to invade / occur to", full: "einfallen" },
  { root: "fallen", prefix: "ent-", meaning: "to be omitted", full: "entfallen" },
  { root: "fallen", prefix: "ge-", meaning: "to please", full: "gefallen" },
  { root: "fallen", prefix: "um-", meaning: "to fall over", full: "umfallen" },
  { root: "fallen", prefix: "ver-", meaning: "to decay / expire", full: "verfallen" },
  { root: "fallen", prefix: "zu-", meaning: "to close (door)", full: "zufallen" },

  // halten
  { root: "halten", prefix: "ab-", meaning: "to hold off / deter", full: "abhalten" },
  { root: "halten", prefix: "an-", meaning: "to stop / persist", full: "anhalten" },
  { root: "halten", prefix: "auf-", meaning: "to stop / delay", full: "aufhalten" },
  { root: "halten", prefix: "aus-", meaning: "to endure / withstand", full: "aushalten" },
  { root: "halten", prefix: "be-", meaning: "to keep / retain", full: "behalten" },
  { root: "halten", prefix: "ein-", meaning: "to keep / comply with", full: "einhalten" },
  { root: "halten", prefix: "ent-", meaning: "to contain", full: "enthalten" },
  { root: "halten", prefix: "er-", meaning: "to receive / obtain", full: "erhalten" },
  { root: "halten", prefix: "fest-", meaning: "to hold tight / capture", full: "festhalten" },
  { root: "halten", prefix: "unter-", meaning: "to maintain / support", full: "unterhalten" },
  { root: "halten", prefix: "ver-", meaning: "to behave", full: "verhalten" },
  { root: "halten", prefix: "vor-", meaning: "to reproach", full: "vorhalten" },
  { root: "halten", prefix: "zu-", meaning: "to keep closed", full: "zuhalten" },

  // machen
  { root: "machen", prefix: "ab-", meaning: "to agree / arrange", full: "abmachen" },
  { root: "machen", prefix: "an-", meaning: "to turn on / light", full: "anmachen" },
  { root: "machen", prefix: "auf-", meaning: "to open", full: "aufmachen" },
  { root: "machen", prefix: "aus-", meaning: "to turn off / matter", full: "ausmachen" },
  { root: "machen", prefix: "mit-", meaning: "to participate", full: "mitmachen" },
  { root: "machen", prefix: "nach-", meaning: "to imitate", full: "nachmachen" },
  { root: "machen", prefix: "um-", meaning: "to redo / alter", full: "ummachen" },
  { root: "machen", prefix: "vor-", meaning: "to demonstrate", full: "vormachen" },
  { root: "machen", prefix: "weg-", meaning: "to remove", full: "wegmachen" },
  { root: "machen", prefix: "zu-", meaning: "to close", full: "zumachen" },

  // legen
  { root: "legen", prefix: "ab-", meaning: "to put down / take off", full: "ablegen" },
  { root: "legen", prefix: "an-", meaning: "to put on / invest", full: "anlegen" },
  { root: "legen", prefix: "auf-", meaning: "to hang up / impose", full: "auflegen" },
  { root: "legen", prefix: "aus-", meaning: "to lay out / interpret", full: "auslegen" },
  { root: "legen", prefix: "bei-", meaning: "to enclose / add", full: "beilegen" },
  { root: "legen", prefix: "ein-", meaning: "to insert / pickle", full: "einlegen" },
  { root: "legen", prefix: "er-", meaning: "to settle / handle", full: "erledigen" },
  { root: "legen", prefix: "fest-", meaning: "to determine / fix", full: "festlegen" },
  { root: "legen", prefix: "hin-", meaning: "to lay down", full: "hinlegen" },
  { root: "legen", prefix: "nach-", meaning: "to add more", full: "nachlegen" },
  { root: "legen", prefix: "über-", meaning: "to consider", full: "überlegen" },
  { root: "legen", prefix: "um-", meaning: "to reroute / transfer", full: "umlegen" },
  { root: "legen", prefix: "unter-", meaning: "to underlay", full: "unterlegen" },
  { root: "legen", prefix: "ver-", meaning: "to misplace", full: "verlegen" },
  { root: "legen", prefix: "vor-", meaning: "to present / submit", full: "vorlegen" },
  { root: "legen", prefix: "zu-", meaning: "to gain / add", full: "zulegen" },
];

interface VerbEntry {
  root: string;
  prefix: string;
  meaning: string;
  full: string;
}

interface PacmanGameProps {
  flashcards: any[]; // Not used in prefix mode, kept for compatibility
  onBack: () => void;
  onGameStateChange?: (state: string) => void;
}

interface FloatingPrefix {
  id: string;
  prefix: string;
  lane: number;
  x: number;
  speed: number;
  isCorrect: boolean;
}

interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  maxStreak: number;
}

const LANE_COUNT = 5;
const PACMAN_X = 8;
const PREFIX_SPAWN_X = 105;
const BASE_SPEED = 0.15;
const SPEED_INCREMENT = 0.008;
const MAX_PREFIXES = 6;

export const PacmanGame = forwardRef<PacmanGameRef, PacmanGameProps>(function PacmanGame(
  { onBack, onGameStateChange },
  ref
) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'summary'>('menu');
  const [pacmanLane, setPacmanLane] = useState(Math.floor(LANE_COUNT / 2));
  const [floatingPrefixes, setFloatingPrefixes] = useState<FloatingPrefix[]>([]);
  const [currentVerb, setCurrentVerb] = useState<VerbEntry | null>(null);
  const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
  const [level, setLevel] = useState(1);
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(true);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showWordReveal, setShowWordReveal] = useState(false);
  const [revealedVerb, setRevealedVerb] = useState<VerbEntry | null>(null);
  const [collisionPhase, setCollisionPhase] = useState<'start' | 'moving' | 'combined' | null>(null);

  // End game function - can be called from parent via ref
  const endGame = useCallback(() => {
    setGameState('summary');
  }, []);

  // Expose endGame to parent via ref
  useImperativeHandle(ref, () => ({
    endGame,
  }), [endGame]);

  // Notify parent of game state changes
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  const gameLoopRef = useRef<number>();
  const usedVerbIds = useRef<Set<string>>(new Set());
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const prefixCountRef = useRef(0); // Track how many prefixes are on screen
  const showWordRevealRef = useRef(false); // Track word reveal state for effects

  // Pacman mouth animation
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setPacmanMouthOpen(prev => !prev);
    }, 200);
    return () => clearInterval(interval);
  }, [gameState]);

  // Get random verb that hasn't been used recently
  const getRandomVerb = useCallback(() => {
    const available = VERB_DATA.filter(v => !usedVerbIds.current.has(v.full));
    if (available.length === 0) {
      usedVerbIds.current.clear();
      return VERB_DATA[Math.floor(Math.random() * VERB_DATA.length)];
    }
    const verb = available[Math.floor(Math.random() * available.length)];
    usedVerbIds.current.add(verb.full);
    if (usedVerbIds.current.size > Math.min(20, VERB_DATA.length / 2)) {
      const firstId = usedVerbIds.current.values().next().value;
      usedVerbIds.current.delete(firstId);
    }
    return verb;
  }, []);

  // Get wrong prefixes for current verb
  const getWrongPrefixes = useCallback((correctPrefix: string): string[] => {
    return PREFIXES.filter(p => p !== correctPrefix);
  }, []);

  // Spawn a new prefix in a lane that's available
  const spawnPrefix = useCallback(() => {
    if (!currentVerb) return;
    if (prefixCountRef.current >= MAX_PREFIXES) return;

    setFloatingPrefixes(prev => {
      // Find lanes that don't have a prefix near the right side (x > 70)
      const occupiedLanes = new Set(
        prev.filter(p => p.x > 70).map(p => p.lane)
      );

      const availableLanes = Array.from({ length: LANE_COUNT }, (_, i) => i)
        .filter(lane => !occupiedLanes.has(lane));

      if (availableLanes.length === 0) return prev; // All lanes occupied near spawn

      // Pick a random available lane
      const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

      // Speed increases slightly with level
      const speed = BASE_SPEED + (level - 1) * SPEED_INCREMENT;

      // 35% chance to spawn correct prefix
      const isCorrect = Math.random() < 0.35;
      const wrongPrefixes = getWrongPrefixes(currentVerb.prefix);
      const prefix = isCorrect
        ? currentVerb.prefix
        : wrongPrefixes[Math.floor(Math.random() * wrongPrefixes.length)];

      const newPrefix: FloatingPrefix = {
        id: `${prefix}-${Date.now()}-${Math.random()}`,
        prefix,
        lane,
        x: PREFIX_SPAWN_X,
        speed,
        isCorrect: prefix === currentVerb.prefix,
      };

      prefixCountRef.current = prev.length + 1;
      return [...prev, newPrefix];
    });
  }, [currentVerb, level, getWrongPrefixes]);

  // Fire confetti
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.2, y: 0.5 },
      colors: ['#FACC15', '#22C55E', '#3B82F6', '#A855F7'],
    });
  }, []);

  // Check collision with Pacman
  const checkCollision = useCallback((prefix: FloatingPrefix) => {
    const pacmanXEnd = PACMAN_X + 8;
    return prefix.x <= pacmanXEnd && prefix.x > PACMAN_X - 2 && prefix.lane === pacmanLane;
  }, [pacmanLane]);

  // Handle catching a prefix
  const handleCatch = useCallback((prefix: FloatingPrefix) => {
    if (prefix.isCorrect && currentVerb) {
      // Correct prefix caught! Start word reveal animation
      setShowCorrectFlash(true);
      setTimeout(() => setShowCorrectFlash(false), 500);

      const streakBonus = Math.floor(stats.streak / 3) * 25;
      const points = 100 + streakBonus;

      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      }));

      // Level up every 5 correct
      if ((stats.correct + 1) % 5 === 0) {
        setLevel(l => l + 1);
      }

      // Clear all prefixes and start word reveal
      setFloatingPrefixes([]);
      prefixCountRef.current = 0;
      setRevealedVerb(currentVerb);
      setShowWordReveal(true);
      showWordRevealRef.current = true;
      setCollisionPhase('start');

      // Start moving after a brief moment
      setTimeout(() => {
        setCollisionPhase('moving');
      }, 50);

      // After words collide, show combined word and confetti
      setTimeout(() => {
        setCollisionPhase('combined');
        fireConfetti();
      }, 900);

      // After showing the combined word, move to next verb
      setTimeout(() => {
        setShowWordReveal(false);
        showWordRevealRef.current = false;
        setCollisionPhase(null);
        setRevealedVerb(null);
        setCurrentVerb(getRandomVerb());
      }, 2800);
    } else {
      // Wrong prefix caught - flash and reset streak
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 300);
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
    }
  }, [stats, fireConfetti, getRandomVerb, currentVerb]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setFloatingPrefixes(prev => {
        const updated: FloatingPrefix[] = [];
        let caughtPrefix: FloatingPrefix | null = null;

        for (const prefix of prev) {
          const newX = prefix.x - prefix.speed;

          // Check if caught by Pacman
          if (checkCollision({ ...prefix, x: newX })) {
            caughtPrefix = prefix;
            continue; // Remove this prefix
          }

          // Check if went off screen
          if (newX < -15) {
            continue; // Remove this prefix
          }

          updated.push({ ...prefix, x: newX });
        }

        // Update the count ref
        prefixCountRef.current = updated.length;

        // Handle caught prefix
        if (caughtPrefix) {
          setTimeout(() => handleCatch(caughtPrefix!), 0);
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, checkCollision, handleCatch]);

  // Spawn prefixes at regular intervals
  useEffect(() => {
    if (gameState !== 'playing' || !currentVerb) return;

    // Don't spawn during word reveal
    if (showWordRevealRef.current) return;

    // Spawn first prefix immediately
    spawnPrefix();

    // Then spawn more at staggered intervals
    const spawnInterval = Math.max(800 - (level * 50), 400);
    const intervalId = setInterval(() => {
      if (!showWordRevealRef.current) {
        spawnPrefix();
      }
    }, spawnInterval);

    return () => clearInterval(intervalId);
  }, [gameState, currentVerb, spawnPrefix, level]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setPacmanLane(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setPacmanLane(prev => Math.min(LANE_COUNT - 1, prev + 1));
        } else if (e.key === 'Escape') {
          setGameState('paused');
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === ' ') {
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setStats({ score: 0, correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setLevel(1);
    setPacmanLane(Math.floor(LANE_COUNT / 2));
    setFloatingPrefixes([]);
    prefixCountRef.current = 0;
    usedVerbIds.current.clear();
    setCurrentVerb(getRandomVerb());
  };

  // Render Pacman (facing RIGHT)
  const renderPacman = () => {
    const laneHeight = 100 / LANE_COUNT;
    const topPosition = pacmanLane * laneHeight + laneHeight / 2;
    const mouthAngle = pacmanMouthOpen ? 25 : 5;

    return (
      <div
        className="absolute transition-all duration-100 ease-out z-20"
        style={{
          left: `${PACMAN_X}%`,
          top: `${topPosition}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="relative w-12 h-12 md:w-16 md:h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Pacman body - pie shape facing right */}
            <path
              d={`M50,50 L${50 + 45 * Math.cos(mouthAngle * Math.PI / 180)},${50 - 45 * Math.sin(mouthAngle * Math.PI / 180)} A45,45 0 1,0 ${50 + 45 * Math.cos(mouthAngle * Math.PI / 180)},${50 + 45 * Math.sin(mouthAngle * Math.PI / 180)} Z`}
              fill="#FACC15"
            />
            {/* Eye */}
            <circle cx="55" cy="25" r="6" fill="#000" />
          </svg>
        </div>
      </div>
    );
  };

  // Render floating prefixes
  const renderPrefixes = () => {
    const laneHeight = 100 / LANE_COUNT;

    return floatingPrefixes.map(prefix => {
      const topPosition = prefix.lane * laneHeight + laneHeight / 2;

      return (
        <div
          key={prefix.id}
          className="absolute transition-none z-10"
          style={{
            left: `${prefix.x}%`,
            top: `${topPosition}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="px-3 py-2 rounded-lg font-bold text-sm md:text-base shadow-lg whitespace-nowrap bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            {prefix.prefix}
          </div>
        </div>
      );
    });
  };

  // Render lane guides
  const renderLanes = () => {
    const lanes = [];
    for (let i = 0; i < LANE_COUNT; i++) {
      const topPosition = ((i + 1) / LANE_COUNT) * 100;
      lanes.push(
        <div
          key={i}
          className="absolute left-0 right-0 border-b border-gray-700/30"
          style={{ top: `${topPosition}%` }}
        />
      );
    }
    return lanes;
  };

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="text-7xl mb-4">🟡</div>
          <h2 className="text-3xl font-black text-white mb-2">Prefix Chomper</h2>
          <p className="text-gray-400 mb-6">
            Catch the correct German prefix to complete the verb!
          </p>

          <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-white mb-2">How to Play:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Use <span className="text-yellow-400">Arrow Keys</span> or <span className="text-yellow-400">W/S</span> to move up/down</li>
              <li>Read the meaning shown on screen</li>
              <li>Catch the <span className="text-green-400">correct prefix</span> to form the verb</li>
              <li>Avoid the <span className="text-gray-400">wrong prefixes</span>!</li>
            </ul>
          </div>

          <div className="text-gray-400 text-sm mb-4">
            {VERB_DATA.length} verb combinations to learn
          </div>

          <Button onClick={startGame} variant="primary" className="w-full">
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  // Summary screen
  if (gameState === 'summary') {
    const accuracy = stats.correct + stats.incorrect > 0
      ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
      : 0;

    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-black text-yellow-400">{stats.score}</div>
              <div className="text-gray-400 text-sm">Score</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-black text-green-400">{stats.correct}</div>
              <div className="text-gray-400 text-sm">Correct</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-black text-cyan-400">{stats.maxStreak}</div>
              <div className="text-gray-400 text-sm">Best Streak</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-black text-purple-400">{accuracy}%</div>
              <div className="text-gray-400 text-sm">Accuracy</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={startGame} variant="primary" className="w-full">
              Play Again
            </Button>
            <Button onClick={onBack} variant="secondary" className="w-full">
              Back to Flashcards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Paused screen
  if (gameState === 'paused') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="bg-gray-800 rounded-2xl p-8">
          <div className="text-6xl mb-4">⏸️</div>
          <h2 className="text-3xl font-black text-white mb-6">Paused</h2>

          <div className="space-y-3">
            <Button onClick={() => setGameState('playing')} variant="primary" className="w-full">
              Resume
            </Button>
            <Button onClick={startGame} variant="secondary" className="w-full">
              Restart
            </Button>
            <Button onClick={onBack} variant="ghost" className="w-full">
              Quit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div>
      {/* Stats bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-4">
          <div className="text-gray-600 text-sm">
            Level {level}
          </div>
          <div className="text-gray-600 text-sm">
            ✓ {stats.correct} | ✗ {stats.incorrect}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stats.streak > 0 && (
            <div className="text-orange-500 font-bold">
              🔥 {stats.streak}
            </div>
          )}
          <div className="text-yellow-500 font-bold text-xl">
            {stats.score} pts
          </div>
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className={`relative bg-gray-800 rounded-2xl overflow-hidden transition-all duration-200 ${
          showCorrectFlash ? 'ring-4 ring-green-500' : ''
        } ${showWrongFlash ? 'ring-4 ring-red-500' : ''}`}
        style={{ height: '400px' }}
      >
        {/* Background meaning display */}
        {currentVerb && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-20">
              <div className="text-4xl md:text-6xl font-black text-white mb-2">
                ____{currentVerb.root}
              </div>
              <div className="text-xl md:text-2xl text-gray-300">
                {currentVerb.meaning}
              </div>
            </div>
          </div>
        )}

        {/* Lane guides */}
        {renderLanes()}

        {/* Floating prefixes */}
        {renderPrefixes()}

        {/* Pacman */}
        {renderPacman()}

        {/* Current target info */}
        {currentVerb && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">Find prefix for:</div>
              <div className="text-white font-bold">{currentVerb.meaning}</div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-right">
              <div className="text-xs text-gray-400">Root verb:</div>
              <div className="text-yellow-400 font-bold">{currentVerb.root}</div>
            </div>
          </div>
        )}

        {/* Pause hint */}
        <div className="absolute bottom-2 right-2 text-gray-600 text-xs">
          ESC to pause
        </div>

        {/* Word Reveal Overlay */}
        {showWordReveal && revealedVerb && (
          <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-30">
            {(collisionPhase === 'start' || collisionPhase === 'moving') ? (
              // Words moving toward each other
              <div className="relative w-full h-20 flex items-center justify-center">
                <div
                  className="absolute text-3xl md:text-5xl font-black text-green-400 transition-all duration-700 ease-out"
                  style={{
                    transform: collisionPhase === 'start'
                      ? 'translateX(-150px)'
                      : 'translateX(-10px)'
                  }}
                >
                  {revealedVerb.prefix.replace('-', '')}
                </div>
                <div
                  className="absolute text-3xl md:text-5xl font-black text-yellow-400 transition-all duration-700 ease-out"
                  style={{
                    transform: collisionPhase === 'start'
                      ? 'translateX(150px)'
                      : 'translateX(60px)'
                  }}
                >
                  {revealedVerb.root}
                </div>
              </div>
            ) : (
              // Combined word with meaning
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-black text-white mb-4 animate-pulse">
                  <span className="text-green-400">{revealedVerb.prefix.replace('-', '')}</span>
                  <span className="text-yellow-400">{revealedVerb.root}</span>
                </div>
                <div className="text-xl md:text-2xl text-gray-300 animate-fade-in-up">
                  {revealedVerb.meaning}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 flex justify-center gap-4 md:hidden">
        <button
          onTouchStart={() => setPacmanLane(prev => Math.max(0, prev - 1))}
          className="w-16 h-16 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-xl flex items-center justify-center text-gray-700 text-2xl"
        >
          ↑
        </button>
        <button
          onTouchStart={() => setPacmanLane(prev => Math.min(LANE_COUNT - 1, prev + 1))}
          className="w-16 h-16 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-xl flex items-center justify-center text-gray-700 text-2xl"
        >
          ↓
        </button>
      </div>

      {/* Desktop controls hint */}
      <div className="hidden md:block text-center text-gray-500 text-sm mt-4">
        Use Arrow Keys or W/S to move Pacman
      </div>
    </div>
  );
});
