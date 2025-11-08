'use client';

import Image from 'next/image';

export function HowItWorksSection() {
  const features = [
    {
      title: 'AI-Powered Flashcards',
      description: 'Personalized learning with AI-generated practice questions tailored to your level. Smart spaced repetition algorithm optimizes your learning schedule for maximum retention.',
      image: '/images/13.jpg',
      textColor: 'text-white',
      icon: '🤖',
    },
    {
      title: 'Writing Evaluation',
      description: 'Get detailed feedback on your writing exercises from peers and teachers with corrections and suggestions.',
      image: '/images/14.jpg',
      textColor: 'text-white',
      icon: '✍️',
    },
    {
      title: 'Student Tracking',
      description: 'Review performance, track exercises, and see teacher feedback.',
      image: '/images/15.jpg',
      textColor: 'text-white',
      icon: '📈',
    },
    {
      title: 'Teacher Dashboard',
      description: 'Evaluate submissions, provide corrections, and monitor progress.',
      image: '/images/09.jpg',
      textColor: 'text-white',
      icon: '👨‍🏫',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-piku-purple-dark text-sm font-bold mb-3 uppercase tracking-wider">
            Our Features
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            View Our Handpicked Learning Features
          </h2>
        </div>

        {/* SEOZ-style expanding cards on hover */}
        <div className="flex gap-2 h-[500px]">
          {features.map((feature, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-in-out flex-1 hover:flex-[3] group/card"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/60 transition-colors duration-300" />
              </div>

              {/* Vertical title - not hovered */}
              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover/card:opacity-0 transition-opacity duration-150 z-10">
                <h4 className={`${feature.textColor} font-black text-xl whitespace-nowrap transform -rotate-90 origin-center drop-shadow-lg`}>
                  {feature.title}
                </h4>
              </div>

              {/* Horizontal content - hovered */}
              <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 delay-150 p-8 flex flex-col justify-center z-10">
                <div className="text-7xl mb-6 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 delay-150">
                  {feature.icon}
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 delay-200">
                  <h4 className="text-2xl font-black text-gray-900 mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
