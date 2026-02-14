"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { AlertDialog } from "@/components/ui/Dialog";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useWritingSubmissionHandlers } from "@/lib/hooks/useWritingSubmissionHandlers";
import { useWritingWordDetection } from "@/lib/hooks/useWritingWordDetection";
import { WritingWorkspace, EmailField } from "@/components/writing/WritingWorkspace";
import { FormalLetterHeader, InformalLetterHeader, LetterHeaderValues } from "@/components/writing/LetterWritingArea";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { SavedWordDetection } from "@/components/writing/SavedWordDetection";
import { CEFRLevel } from "@/lib/models/cefr";
import { motion } from "framer-motion";

type WritingMode = "plain" | "email" | "letter-formal" | "letter-informal";

const WRITING_MODES: { value: WritingMode; label: string; icon: string }[] = [
  { value: "plain", label: "Plain", icon: "📝" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "letter-formal", label: "Formal Letter", icon: "✉️" },
  { value: "letter-informal", label: "Informal Letter", icon: "💌" },
];

export default function FreestylePage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();

  // Topic & settings
  const [topic, setTopic] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>("plain");

  // Writing state
  const [writingText, setWritingText] = useState("");
  const [emailContent, setEmailContent] = useState({ to: "", subject: "", body: "" });
  const [letterFields, setLetterFields] = useState<LetterHeaderValues>({});

  // Word detection
  const { detectedWords, detectWords, confirmUsedWords, clearDetectedWords } =
    useWritingWordDetection();

  // Compute word count based on mode
  const activeText = writingMode === "email" ? emailContent.body : writingText;
  const wordCount = activeText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Submission handlers (freestyle = no selected exercise)
  const submissionHandlers = useWritingSubmissionHandlers({
    selectedLevel: "B1" as CEFRLevel,
    selectedTranslation: null,
    selectedCreative: null,
    selectedEmail: null,
    selectedLetter: null,
    writingText: activeText,
    userEmail: session?.user?.email,
  });

  const hasContent = activeText.trim().length > 0 && topic.trim().length > 0;

  const buildStructuredFields = () => {
    switch (writingMode) {
      case "email":
        return {
          ...(emailContent.to && { emailTo: emailContent.to }),
          ...(emailContent.subject && { emailSubject: emailContent.subject }),
        };
      case "letter-formal":
        return {
          ...(letterFields.sender && { letterSender: letterFields.sender }),
          ...(letterFields.date && { letterDate: letterFields.date }),
          ...(letterFields.recipient && { letterRecipient: letterFields.recipient }),
          ...(letterFields.subject && { letterSubject: letterFields.subject }),
          ...(letterFields.greeting && { letterGreeting: letterFields.greeting }),
        };
      case "letter-informal":
        return {
          ...(letterFields.date && { letterDate: letterFields.date }),
          ...(letterFields.greeting && { letterGreeting: letterFields.greeting }),
        };
      default:
        return undefined;
    }
  };

  const freestyleFields = {
    exerciseTitle: topic,
    exerciseType: "freestyle" as const,
    isPublic,
    writingMode,
    ...(buildStructuredFields() && { structuredFields: buildStructuredFields() }),
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      return;
    }
    await submissionHandlers.handleSubmit(freestyleFields);
    await detectWords(session?.user?.email, activeText);
  };

  const handleConfirmUsedWords = async (wordIds: string[]) => {
    await confirmUsedWords(session?.user?.email, wordIds);
  };

  // Build additional fields based on writing mode
  const additionalFields = (() => {
    switch (writingMode) {
      case "email":
        return (
          <>
            <EmailField
              label="To (An)"
              value={emailContent.to}
              onChange={(v) => setEmailContent({ ...emailContent, to: v })}
              placeholder="Recipient name or title"
            />
            <EmailField
              label="Subject (Betreff)"
              value={emailContent.subject}
              onChange={(v) => setEmailContent({ ...emailContent, subject: v })}
              placeholder="Email subject"
            />
          </>
        );
      case "letter-formal":
        return <FormalLetterHeader values={letterFields} onChange={setLetterFields} />;
      case "letter-informal":
        return <InformalLetterHeader values={letterFields} onChange={setLetterFields} />;
      default:
        return undefined;
    }
  })();

  const placeholder = (() => {
    switch (writingMode) {
      case "email":
        return "Start writing your email here...";
      case "letter-formal":
        return "Write the body of your formal letter here...\n\nStart with your main message after the greeting above.";
      case "letter-informal":
        return "Write your letter here...\n\nShare your news, ask questions, and be conversational.";
      default:
        return "Beginne hier zu schreiben...";
    }
  })();

  const instructions = (
    <>
      {/* Topic Input */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What will you write about?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-colors"
        />
      </div>

      {/* Public / Private Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isPublic ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => setIsPublic(!isPublic)}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isPublic ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-gray-700">
            {isPublic ? "Public" : "Private"} submission
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-[52px]">
          {isPublic
            ? "Other students can see your writing"
            : "Only your teacher will see this"}
        </p>
      </div>

      {/* Writing Mode Selector */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Writing Format
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WRITING_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setWritingMode(mode.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                writingMode === mode.value
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tips based on mode */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          {writingMode === "plain" && (
            <>
              <li>Write freely about your chosen topic</li>
              <li>Focus on expressing your ideas clearly</li>
              <li>Try to use varied vocabulary</li>
            </>
          )}
          {writingMode === "email" && (
            <>
              <li>Use appropriate greetings and closings</li>
              <li>Keep paragraphs short and focused</li>
              <li>Be clear and concise</li>
            </>
          )}
          {writingMode === "letter-formal" && (
            <>
              <li>Use complete address blocks</li>
              <li>Include date and place</li>
              <li>Use formal language (Sie)</li>
              <li>End with &quot;Mit freundlichen Gr&uuml;&szlig;en&quot;</li>
            </>
          )}
          {writingMode === "letter-informal" && (
            <>
              <li>Start with a friendly greeting</li>
              <li>Use informal language (du)</li>
              <li>Be natural and conversational</li>
              <li>End warmly (Liebe Gr&uuml;&szlig;e)</li>
            </>
          )}
        </ul>
      </div>
    </>
  );

  const topIndicator = (
    <div className="text-sm font-medium">
      <span className={wordCount < 50 ? "text-amber-600" : "text-emerald-600"}>
        {wordCount}
      </span>
      <span className="text-gray-400 mx-1">words</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Freestyle Writing"
        subtitle={topic ? topic : "Write about any topic you like"}
        backButton={{
          label: "Back to Writing Exercises",
          onClick: () => router.push("/dashboard/student/writing"),
        }}
        actions={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() => submissionHandlers.handleSaveDraft(freestyleFields)}
              disabled={submissionHandlers.isSaving || !hasContent}
              variant="gray"
              icon={<ActionButtonIcons.Save />}
            >
              {submissionHandlers.isSaving ? "Saving..." : "Draft"}
            </ActionButton>
            <ActionButton
              onClick={handleSubmit}
              disabled={submissionHandlers.isSaving || !hasContent}
              variant="purple"
              icon={<ActionButtonIcons.Check />}
            >
              Submit
            </ActionButton>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="lg:container lg:mx-auto">
          <WritingWorkspace
            value={writingMode === "email" ? emailContent.body : writingText}
            onChange={
              writingMode === "email"
                ? (v) => setEmailContent({ ...emailContent, body: v })
                : setWritingText
            }
            placeholder={placeholder}
            topIndicator={topIndicator}
            additionalFields={additionalFields}
            instructions={instructions}
          />

          {detectedWords.length > 0 && (
            <SavedWordDetection
              detectedWords={detectedWords}
              onConfirm={handleConfirmUsedWords}
              onDismiss={clearDetectedWords}
            />
          )}
        </div>
      </motion.div>

      <AlertDialog
        open={submissionHandlers.dialogState.isOpen}
        onClose={submissionHandlers.closeDialog}
        title={submissionHandlers.dialogState.title}
        message={submissionHandlers.dialogState.message}
      />

      <FloatingRedemittelWidget currentLevel={"B1" as CEFRLevel} />
    </div>
  );
}
