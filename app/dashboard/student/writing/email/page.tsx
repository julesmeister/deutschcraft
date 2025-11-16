'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmailTemplateInstructions } from '@/components/writing/EmailTemplateInstructions';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { EmailTemplateSelector } from '@/components/writing/EmailTemplateSelector';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { EMAIL_TEMPLATES, EmailTemplate, getTemplatesByLevel } from '@/lib/data/emailTemplates';

function EmailWritingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.A2);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailContent, setEmailContent] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && Object.values(CEFRLevel).includes(levelParam as CEFRLevel)) {
      setLevel(levelParam as CEFRLevel);
    }
  }, [searchParams]);

  useEffect(() => {
    const words = emailContent.body.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [emailContent.body]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEmailContent({
      to: template.recipient,
      subject: template.subject,
      body: '',
    });
    setWordCount(0);
  };

  const handleBack = () => {
    if (selectedTemplate) {
      setSelectedTemplate(null);
      setEmailContent({ to: '', subject: '', body: '' });
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
      alert(`Your email needs at least ${selectedTemplate.minWords} words. You have ${wordCount}.`);
      return;
    }

    setIsSaving(true);
    // TODO: Submit to Firestore and get AI feedback
    setTimeout(() => {
      setIsSaving(false);
      alert('Email submitted successfully! Generating feedback...');
    }, 1500);
  };

  const filteredTemplates = getTemplatesByLevel(level);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={selectedTemplate ? selectedTemplate.title : 'Email Writing 📧'}
        subtitle={selectedTemplate ? `${CEFRLevelInfo[level].displayName} • ${selectedTemplate.difficulty}` : 'Practice professional and personal emails'}
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
          <div className="lg:max-w-6xl mx-auto">
            <div className="px-6 md:px-0 py-4 md:py-0">
              <EmailTemplateInstructions template={selectedTemplate} />
            </div>
            <EmailWritingForm
              template={selectedTemplate}
              emailContent={emailContent}
              wordCount={wordCount}
              onChange={setEmailContent}
            />
          </div>
        ) : (
          <div className="px-6">
            <EmailTemplateSelector
              templates={filteredTemplates}
              onSelect={handleTemplateSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailWritingContent />
    </Suspense>
  );
}
