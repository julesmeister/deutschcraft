"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CatLoader } from "@/components/ui/CatLoader";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PrepositionCasesGame, PrepositionCasesGameRef } from "@/components/flashcards/PrepositionCasesGame";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

function PrepositionCasesGameContent() {
  const router = useRouter();
  const gameRef = useRef<PrepositionCasesGameRef>(null);
  const [gameState, setGameState] = useState('menu');

  const handleBack = () => {
    router.push("/dashboard/student/flashcards?refreshed=true");
  };

  const handleEndGame = () => {
    gameRef.current?.endGame();
  };

  const handleReviewPrepositions = () => {
    gameRef.current?.reviewPrepositions();
  };

  const handleGameStateChange = (state: string) => {
    setGameState(state);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Preposition Cases 🔤"
        subtitle="Master which case each German preposition takes"
        backButton={{
          label: "Back to Flashcards",
          onClick: handleBack,
        }}
        actions={
          gameState === 'playing' || gameState === 'quiz' ? (
            <ActionButton
              onClick={handleEndGame}
              variant="red"
              icon={<ActionButtonIcons.X />}
            >
              End Game
            </ActionButton>
          ) : gameState === 'menu' || gameState === 'paused' || gameState === 'summary' ? (
            <ActionButton
              onClick={handleReviewPrepositions}
              variant="cyan"
              icon={<ActionButtonIcons.Eye />}
            >
              Review Prepositions
            </ActionButton>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <PrepositionCasesGame
          ref={gameRef}
          onBack={handleBack}
          onGameStateChange={handleGameStateChange}
        />
      </div>
    </div>
  );
}

export default function PrepositionCasesGamePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CatLoader fullScreen message="Initializing game..." />}>
        <PrepositionCasesGameContent />
      </Suspense>
    </ToastProvider>
  );
}
