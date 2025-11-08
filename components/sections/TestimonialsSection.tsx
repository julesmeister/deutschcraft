'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Alexy Queen',
      label: 'Happy Student',
      image: '👩‍🎓',
      title: 'Highly recommend Testmanship!',
      quote: 'After using Testmanship, I can confidently say it was one of the most effective German learning experiences.',
    },
    {
      name: 'Jofra Archer',
      label: 'Happy Student',
      image: '👨‍💼',
      title: 'Best German learning platform!',
      quote: 'Best German learning platform I have ever used. From A1 to B2 in under a year!',
    },
    {
      name: 'Sarah Miller',
      label: 'Happy Student',
      image: '👩‍💻',
      title: 'Amazing progress tracking!',
      quote: 'The AI flashcards and progress tracking kept me motivated every single day. Passed B2 in 6 months!',
    },
    {
      name: 'Michael Chen',
      label: 'Happy Student',
      image: '👨‍🎓',
      title: 'Perfect for busy professionals!',
      quote: 'Testmanship fits perfectly into my busy schedule. Learning German has never been this efficient.',
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < testimonials.length - 2 ? prev + 1 : 0));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 2);

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Piku-style colored box */}
          <div className="lg:col-span-6">
            <div className="w-100 mt-30 p-8 rounded-3xl relative bg-piku-mint">
              <h3 className="text-6xl font-black text-gray-900 mb-6 max-w-[85%]" style={{ lineHeight: '1.25em' }}>What Our Students Say</h3>
              <div className="row mt-4">
                <div className="col-12">
                  <p className="text-2xl text-gray-900" style={{ lineHeight: '1.777em' }}>Real success stories from learners who achieved fluency with our AI-powered platform.</p>
                </div>
              </div>
              <Image
                src="/images/shape_43.svg"
                alt=""
                width={50}
                height={50}
                className="absolute right-8 top-[32px]"
              />
            </div>
          </div>

          {/* Right Column - Yellow Rounded Container */}
          <div className="lg:col-span-6">
            <div className="bg-piku-yellow-light p-6 rounded-3xl">
              <div className="flex gap-4">
                {/* Testimonials */}
                <div className="flex-1 space-y-4">
                  {visibleTestimonials.map((testimonial, i) => (
                    <div
                      key={currentIndex + i}
                      className="bg-white p-5 rounded-2xl"
                    >
                      {/* Image/Name on left, Quote icon on right */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-piku-purple-dark to-piku-cyan flex items-center justify-center text-xl">
                              {testimonial.image}
                            </div>
                          </div>
                          <div>
                            <a className="font-bold text-sm text-gray-900 block hover:text-piku-purple-dark transition-colors">
                              {testimonial.name}
                            </a>
                            <p className="text-gray-600 text-xs font-medium">
                              {testimonial.label}
                            </p>
                          </div>
                        </div>
                        <div className="text-piku-purple-dark/25 text-3xl font-serif leading-none">
                          "
                        </div>
                      </div>

                      {/* Title */}
                      <span className="block font-semibold text-sm text-gray-900 mb-2">
                        {testimonial.title}
                      </span>

                      {/* Quote - italic */}
                      <p className="text-gray-700 text-xs leading-5 italic mb-3">
                        "{testimonial.quote}"
                      </p>

                      {/* 5 Stars */}
                      <ul className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <li key={j}>
                            <svg className="w-3.5 h-3.5 text-piku-gold" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <div className="flex flex-col gap-3 justify-center">
                  <button
                    onClick={handlePrev}
                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-piku-purple-dark text-gray-900 hover:text-white rounded-full transition-all duration-300"
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-piku-purple-dark text-gray-900 hover:text-white rounded-full transition-all duration-300"
                    aria-label="Next testimonial"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
