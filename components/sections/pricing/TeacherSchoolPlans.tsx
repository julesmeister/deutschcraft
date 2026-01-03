import {
  ScrollStagger,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

const PLANS = [
  {
    name: "Teacher",
    price: "₱1,499",
    color: "border-piku-orange-accent",
    features: [
      "Manage unlimited students",
      "Custom assignments",
      "Analytics dashboard",
      "Priority support",
    ],
  },
  {
    name: "School",
    price: "₱4,999",
    color: "border-piku-pink-hot",
    features: [
      "Up to 50 students",
      "Admin controls",
      "Custom branding",
      "Dedicated support",
      "Bulk licensing",
    ],
  },
];

export function TeacherSchoolPlans() {
  return (
    <div className="max-w-6xl mx-auto mt-8 md:mt-16">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
        For Teachers & Schools
      </h3>
      <ScrollStagger staggerDelay={0.15} variant="slideUp">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {PLANS.map((plan, i) => (
            <StaggerItem key={i} variant="slideUp">
              <div
                className={`bg-white p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border-2 sm:border-4 ${plan.color} transition-all hover:-translate-y-2 hover:shadow-xl h-full`}
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600">
                    /month
                  </span>
                </div>
                <button className="theme-btn group w-full inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-sm sm:text-[15px] py-2 pl-6 sm:pl-8 pr-2 rounded-md mb-4 sm:mb-6 hover:scale-105 transition-transform">
                  <span className="btn-text relative z-10 transition-colors duration-300">
                    Start Free Trial
                  </span>
                  <span className="btn-icon relative z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </button>
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </div>
      </ScrollStagger>
    </div>
  );
}
