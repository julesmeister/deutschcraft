"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface MigrationStats {
  users?: number;
  batches?: number;
  tasks?: number;
  submissions?: number;
  progress?: number;
  vocabulary?: number;
  flashcards?: number;
  flashcardProgress?: number;
  writingProgress?: number;
  writingStats?: number;
  writingSubmissions?: number;
  reviewQuizzes?: number;
  studentAnswers?: number;
  total?: number;
}

export function DatabaseMigrationTab() {
  const toast = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrateConfirm, setShowMigrateConfirm] = useState(false);
  const [showProgressConfirm, setShowProgressConfirm] = useState(false);
  const [showUsersConfirm, setShowUsersConfirm] = useState(false);
  const [migrationStats, setMigrationStats] = useState<MigrationStats>({});

  // Direct migration (Firestore → Turso)
  const handleDirectMigration = async (scope: string = "ai_reviews") => {
    console.log('[Migration] Starting migration with scope:', scope);
    setShowMigrateConfirm(false);
    setShowProgressConfirm(false);
    setShowUsersConfirm(false);
    setIsMigrating(true);

    try {
      const scopeName =
        scope === "progress"
          ? "Progress Data"
          : scope === "users_names"
          ? "Users"
          : "AI Corrections";
      console.log('[Migration] Showing toast for:', scopeName);
      toast.info(
        `Starting ${scopeName} migration... This may take a few minutes.`
      );

      const response = await fetch("/api/database/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Migration failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setMigrationStats(result.stats || {});

      toast.success(
        `${scopeName} migrated successfully! ${
          result.stats?.total || 0
        } records processed.`
      );
    } catch (error) {
      console.error("Migration error:", error);

      // Extract clean error message without stack trace
      let errorMessage = "Failed to migrate data";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Show detailed error with title and description
      toast.error("Migration Failed", {
        description: errorMessage,
        duration: 10000, // 10 seconds for errors
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Database Migration
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Migrate data from Firebase Firestore to Turso (SQLite). This process
          will copy existing data to the new database.
        </p>

        {/* Warning about migration order */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Important: Migration Order
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  <strong>Step 1:</strong> Migrate Users first (required for foreign key constraints)
                  <br />
                  <strong>Step 2:</strong> Then migrate Progress Data or AI Reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Migrate Users */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              Step 1: Migrate Users
            </h4>
            <ActionButton
              icon={<ActionButtonIcons.Refresh />}
              onClick={() => {
                console.log('[Migration] Users button clicked');
                setShowUsersConfirm(true);
              }}
              disabled={isMigrating}
              variant="mint"
            >
              {isMigrating ? "Migrating..." : "Migrate Users"}
            </ActionButton>
          </div>

          {/* Step 2: Migrate Data */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Step 2: Migrate Writing Data (Progress, Stats, Quizzes, Answers)
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <ActionButton
                icon={<ActionButtonIcons.Refresh />}
                onClick={() => {
                  console.log('[Migration] Progress button clicked');
                  setShowProgressConfirm(true);
                }}
                disabled={isMigrating}
                variant="cyan"
              >
                {isMigrating ? "Migrating..." : "Migrate Progress Data"}
              </ActionButton>

              <ActionButton
                icon={<ActionButtonIcons.Refresh />}
                onClick={() => setShowMigrateConfirm(true)}
                disabled={isMigrating}
                variant="purple"
              >
                {isMigrating ? "Migrating..." : "Migrate AI Reviews"}
              </ActionButton>
            </div>
          </div>

          {Object.keys(migrationStats).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Last Migration Results:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {migrationStats.submissions !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submissions:</span>
                    <span className="font-mono">
                      {migrationStats.submissions}
                    </span>
                  </div>
                )}
                {migrationStats.progress !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Progress:</span>
                    <span className="font-mono">{migrationStats.progress}</span>
                  </div>
                )}
                {migrationStats.flashcardProgress !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Flashcard Progress:</span>
                    <span className="font-mono">
                      {migrationStats.flashcardProgress}
                    </span>
                  </div>
                )}
                {migrationStats.writingProgress !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Writing Progress:</span>
                    <span className="font-mono">
                      {migrationStats.writingProgress}
                    </span>
                  </div>
                )}
                {migrationStats.writingStats !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Writing Stats:</span>
                    <span className="font-mono">
                      {migrationStats.writingStats}
                    </span>
                  </div>
                )}
                {migrationStats.reviewQuizzes !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Review Quizzes:</span>
                    <span className="font-mono">
                      {migrationStats.reviewQuizzes}
                    </span>
                  </div>
                )}
                {migrationStats.studentAnswers !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Student Answers:</span>
                    <span className="font-mono">
                      {migrationStats.studentAnswers}
                    </span>
                  </div>
                )}
                {migrationStats.writingSubmissions !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Writing Submissions:</span>
                    <span className="font-mono">
                      {migrationStats.writingSubmissions}
                    </span>
                  </div>
                )}
                {migrationStats.users !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Users:</span>
                    <span className="font-mono">
                      {migrationStats.users}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-medium">
                  <span>Total Records:</span>
                  <span>
                    {(migrationStats.progress || 0) +
                      (migrationStats.flashcardProgress || 0) +
                      (migrationStats.writingProgress || 0) +
                      (migrationStats.writingStats || 0) +
                      (migrationStats.reviewQuizzes || 0) +
                      (migrationStats.studentAnswers || 0) +
                      (migrationStats.users || 0) +
                      (migrationStats.writingSubmissions || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showMigrateConfirm}
        onClose={() => setShowMigrateConfirm(false)}
        onConfirm={() => handleDirectMigration("ai_reviews")}
        title="Migrate AI Reviews?"
        message="This will copy AI corrections and reviews from Firestore to Turso. Existing records with the same ID will be updated. This process may take a few minutes."
        confirmText="Start Migration"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={showProgressConfirm}
        onClose={() => {
          console.log('[Migration] Progress confirm dialog closed');
          setShowProgressConfirm(false);
        }}
        onConfirm={() => {
          console.log('[Migration] Progress confirm clicked');
          handleDirectMigration("progress");
        }}
        title="Migrate Progress Data?"
        message="This will copy all writing-related data from Firestore to Turso: writing submissions, writing progress, writing stats, review quizzes, student answers, and daily progress. Existing records will be updated (not deleted). Note: Flashcard progress is currently skipped."
        confirmText="Start Migration"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={showUsersConfirm}
        onClose={() => {
          console.log('[Migration] Users confirm dialog closed');
          setShowUsersConfirm(false);
        }}
        onConfirm={() => {
          console.log('[Migration] Users confirm clicked');
          handleDirectMigration("users_names");
        }}
        title="Migrate Users?"
        message="This will copy all user data (names, emails, roles) from Firestore to Turso. This MUST be done before migrating progress data due to foreign key constraints."
        confirmText="Start Migration"
        cancelText="Cancel"
      />
    </div>
  );
}
