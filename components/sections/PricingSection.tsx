'use client';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-sm font-medium mb-4">
            PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose your plan
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: 'Student', price: '€9', color: 'border-piku-teal', features: ['All levels A1-C2', 'Unlimited flashcards', 'Progress tracking'] },
            { name: 'Teacher', price: '€29', color: 'border-piku-orange-accent', features: ['Manage students', 'Custom assignments', 'Analytics dashboard', 'Priority support'] },
            { name: 'School', price: '€99', color: 'border-piku-pink-hot', features: ['Up to 50 students', 'Admin controls', 'Custom branding', 'Dedicated support'] },
          ].map((plan, i) => (
            <div key={i} className={`bg-white p-8 rounded-2xl border-4 ${plan.color} hover:shadow-2xl transition-all hover:-translate-y-2`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <button className="theme-btn group w-full inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-[15px] py-2 pl-8 pr-2 rounded-md mb-6">
                <span className="btn-text relative z-10 transition-colors duration-300">Start Free Trial</span>
                <span className="btn-icon relative z-10 w-12 h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
