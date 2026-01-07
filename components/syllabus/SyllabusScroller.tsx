"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
  icon?: string;
}

interface SyllabusScrollerProps {
  sections: Section[];
}

export function SyllabusScroller({ sections }: SyllabusScrollerProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Default to first section if at top
      if (window.scrollY < 100 && sections.length > 0) {
        setActiveSection(sections[0].id);
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, height } = element.getBoundingClientRect();
          // Element is active if its top is near viewport top (within offset)
          // or if we are inside it
          if (top < 300 && top + height > 100) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-100/50">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`flex flex-col items-center gap-3 px-2 py-4 rounded-xl text-sm font-semibold transition-all group relative w-12 ${
            activeSection === section.id
              ? "bg-gray-900 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="text-xl">{section.icon}</span>
          <span
            className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide"
            style={{ textOrientation: "mixed" }}
          >
            {section.label}
          </span>
        </button>
      ))}
    </div>
  );
}
