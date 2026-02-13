"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CatLoader } from "@/components/ui/CatLoader";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PacmanGame, PacmanGameRef } from "@/components/flashcards/PacmanGame";
import { useFlashcardPracticeData } from "../practice/useFlashcardPracticeData";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

function PacmanGameContent() {
  const router = useRouter();
  const gameRef = useRef<PacmanGameRef>(null);
  const [gameState, setGameState] = useState('menu');
  const {
    practiceFlashcards,
    isLoading,
    error,
  } = useFlashcardPracticeData({ maxCategories: 3 });

  const handleBack = () => {
    router.push("/dashboard/student/flashcards?refreshed=true");
  };

  const handleEndGame = () => {
    gameRef.current?.endGame();
  };

  const handleReviewWords = () => {
    gameRef.current?.reviewWords();
  };

  const handleGameStateChange = (state: string) => {
    setGameState(state);
  };

  if (isLoading) {
    return <CatLoader fullScreen message="Loading game..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Prefix Chomper 🎮"
        subtitle="Master German verb prefixes"
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
              onClick={handleReviewWords}
              variant="cyan"
              icon={<ActionButtonIcons.Eye />}
            >
              Review Words
            </ActionButton>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <PacmanGame
          ref={gameRef}
          flashcards={practiceFlashcards}
          onBack={handleBack}
          onGameStateChange={handleGameStateChange}
        />
      </div>
    </div>
  );
}

export default function PacmanGamePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CatLoader fullScreen message="Initializing game..." />}>
        <PacmanGameContent />
      </Suspense>
    </ToastProvider>
  );
}
