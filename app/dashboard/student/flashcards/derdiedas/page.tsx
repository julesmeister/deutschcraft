"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CatLoader } from "@/components/ui/CatLoader";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DerDieDasGame, DerDieDasGameRef } from "@/components/flashcards/DerDieDasGame";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

function DerDieDasGameContent() {
  const router = useRouter();
  const gameRef = useRef<DerDieDasGameRef>(null);
  const [gameState, setGameState] = useState('menu');

  const handleBack = () => {
    router.push("/dashboard/student/flashcards?refreshed=true");
  };

  const handleEndGame = () => {
    gameRef.current?.endGame();
  };

  const handleReviewEndings = () => {
    gameRef.current?.reviewEndings();
  };

  const handleGameStateChange = (state: string) => {
    setGameState(state);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Der Die Das 🎯"
        subtitle="Master German noun gender by ending"
        backButton={{
          label: "Back to Flashcards",
          onClick: handleBack,
        }}
        actions={
          gameState === 'playing' ? (
            <ActionButton
              onClick={handleEndGame}
              variant="red"
              icon={<ActionButtonIcons.X />}
            >
              End Game
            </ActionButton>
          ) : gameState === 'menu' || gameState === 'paused' || gameState === 'summary' ? (
            <ActionButton
              onClick={handleReviewEndings}
              variant="cyan"
              icon={<ActionButtonIcons.Eye />}
            >
              Review Endings
            </ActionButton>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <DerDieDasGame
          ref={gameRef}
          onBack={handleBack}
          onGameStateChange={handleGameStateChange}
        />
      </div>
    </div>
  );
}

export default function DerDieDasGamePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CatLoader fullScreen message="Initializing game..." />}>
        <DerDieDasGameContent />
      </Suspense>
    </ToastProvider>
  );
}
