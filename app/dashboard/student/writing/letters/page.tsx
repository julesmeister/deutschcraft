'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LetterTemplateSelector } from '@/components/writing/LetterTemplateSelector';
import { LetterTemplateInstructions } from '@/components/writing/LetterTemplateInstructions';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { LETTER_TEMPLATES, LetterTemplate } from '@/lib/data/letterTemplates';

function LettersWritingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.B1);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && Object.values(CEFRLevel).includes(levelParam as CEFRLevel)) {
      setLevel(levelParam as CEFRLevel);
    }
  }, [searchParams]);

  useEffect(() => {
    const words = letterContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [letterContent]);

  const handleTemplateSelect = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setLetterContent('');
    setWordCount(0);
  };

  const handleBack = () => {
    if (selectedTemplate) {
      setSelectedTemplate(null);
      setLetterContent('');
    } else {
      router.push('/dashboard/student/writing');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // TODO: Save to Firestore
    setTimeout(() => {
      setIsSaving(false);
      alert('Draft saved successfully!');
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    if (wordCount < selectedTemplate.minWords) {
      alert(`Your letter needs at least ${selectedTemplate.minWords} words. You have ${wordCount}.`);
      return;
    }

    setIsSaving(true);
    // TODO: Submit to Firestore and get feedback
    setTimeout(() => {
      setIsSaving(false);
      alert('Letter submitted successfully! Generating feedback...');
    }, 1500);
  };

  const filteredTemplates = LETTER_TEMPLATES.filter(t => t.level === level);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={selectedTemplate ? selectedTemplate.title : 'Letter Writing 💼'}
        subtitle={
          selectedTemplate
            ? `${CEFRLevelInfo[level].displayName} • ${selectedTemplate.difficulty}`
            : 'Practice formal and informal letters'
        }
        backButton={{
          label: selectedTemplate ? 'Back to Templates' : 'Back to Writing Hub',
          onClick: handleBack
        }}
        actions={
          selectedTemplate && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || wordCount === 0}
                className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-12 rounded-xl bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || wordCount === 0}
                className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          )
        }
      />

      <div className="container mx-auto px-0 md:px-6 py-0 md:py-8">
        {selectedTemplate ? (
          /* Letter Writing Interface */
          <div className="lg:max-w-6xl mx-auto">
            <div className="px-6 md:px-0 py-4 md:py-0">
              <LetterTemplateInstructions template={selectedTemplate} />
            </div>
            <div className="mt-0 md:mt-6">
              <LetterWritingArea
                template={selectedTemplate}
                content={letterContent}
                wordCount={wordCount}
                onChange={setLetterContent}
              />
            </div>
          </div>
        ) : (
          /* Template Selection */
          <div className="px-6">
            <LetterTemplateSelector
              templates={filteredTemplates}
              onSelect={handleTemplateSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LettersWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LettersWritingContent />
    </Suspense>
  );
}
