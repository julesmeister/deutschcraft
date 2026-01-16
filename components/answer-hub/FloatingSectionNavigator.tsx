"use client";

import { Check, MessageSquare, BookOpen, Search } from "lucide-react";

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface FloatingSectionNavigatorProps {
  onScrollToSection: (sectionId: string) => void;
}

export function FloatingSectionNavigator({
  onScrollToSection,
}: FloatingSectionNavigatorProps) {
  const sections: Section[] = [
    {
      id: "exercise",
      label: "Exercise",
      icon: <Check className="w-3 h-3" />,
    },
    {
      id: "student-answers",
      label: "Student Answers",
      icon: <BookOpen className="w-3 h-3" />,
    },
    {
      id: "discussion",
      label: "Discussion",
      icon: <MessageSquare className="w-3 h-3" />,
    },
    {
      id: "dictionary",
      label: "Dictionary",
      icon: <Search className="w-3 h-3" />,
    },
  ];

  return (
    <div className="fixed right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 hidden lg:flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onScrollToSection(section.id)}
          className="group relative w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-200 text-gray-600 hover:text-white"
          title={section.label}
        >
          {section.icon}

          {/* Tooltip on hover */}
          <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {section.label}
          </span>
        </button>
      ))}
    </div>
  );
}
