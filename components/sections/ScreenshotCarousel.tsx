"use client";

import Image from "next/image";

const ROW_1 = [
  { src: "/images/Dashboard.png", alt: "Student Dashboard" },
  { src: "/images/Flashcards 1.png", alt: "Vocabulary Flashcards" },
  { src: "/images/Playground.png", alt: "Live Classroom" },
  { src: "/images/Grammatik 1.png", alt: "Grammar Practice" },
  { src: "/images/Writings 1.png", alt: "Writing Exercises" },
  { src: "/images/Social.png", alt: "Social Feed" },
  { src: "/images/Answer Hub 1.png", alt: "Answer Hub" },
  { src: "/images/Dictionary.png", alt: "Dictionary" },
];

const ROW_2 = [
  { src: "/images/Achievements.png", alt: "Achievements" },
  { src: "/images/Multiple Choice.png", alt: "Der Die Das Game" },
  { src: "/images/Flashcards 2.png", alt: "Flashcard Categories" },
  { src: "/images/Grammatik 2.png", alt: "Grammar Rules" },
  { src: "/images/Writings 2.png", alt: "Writing Review" },
  { src: "/images/Audio 1.png", alt: "Audio Lessons" },
  { src: "/images/Syllabus.png", alt: "Course Syllabus" },
  { src: "/images/Letter.png", alt: "Letter Writing" },
];

function MarqueeRow({
  images,
  reverse = false,
}: {
  images: typeof ROW_1;
  reverse?: boolean;
}) {
  // Duplicate images for seamless loop
  const items = [...images, ...images];

  return (
    <div className="relative overflow-hidden px-2 py-6">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

      <div
        className={`flex gap-4 sm:gap-6 w-max ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {items.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="flex-shrink-0 w-[280px] sm:w-[360px] md:w-[440px] rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={880}
              height={550}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScreenshotCarousel() {
  return (
    <section className="py-12 md:py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 mb-8 md:mb-12">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 text-center mb-3 md:mb-4"
          style={{ lineHeight: "1.2em" }}
        >
          See It in Action
        </h2>
        <p className="text-base md:text-lg text-gray-600 text-center max-w-2xl mx-auto">
          A peek inside the DeutschCraft learning experience — from flashcards
          and grammar drills to live classrooms and social practice.
        </p>
      </div>

      <div className="space-y-0">
        <MarqueeRow images={ROW_1} />
        <MarqueeRow images={ROW_2} reverse />
      </div>
    </section>
  );
}
