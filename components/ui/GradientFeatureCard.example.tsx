/**
 * GradientFeatureCard Examples
 * Usage examples for the GradientFeatureCard component
 */

import { GradientFeatureCard } from './GradientFeatureCard';
import { Workflow, CheckCircle, CreditCard, Users, Award, TrendingUp } from 'lucide-react';

export function GradientFeatureCardExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Example 1: Basic Card with Stats */}
      <div>
        <h3 className="text-xl font-bold mb-4">Example 1: About Us Card</h3>
        <GradientFeatureCard
          title="About Us"
          description="Over the past decade, we've distributed more than 45,000 copies of our administrative themes, all of which have been effectively utilized by businesses ranging from small-scale enterprises to multinational corporations."
          buttonText="Join Us"
          onButtonClick={() => alert('Join Us clicked!')}
          stats={[
            {
              icon: Workflow,
              iconColor: 'blue',
              value: '1,994+',
              label: 'Projects',
            },
            {
              icon: CheckCircle,
              iconColor: 'green',
              value: '1,962',
              label: 'Completed',
            },
            {
              icon: CreditCard,
              iconColor: 'red',
              value: '98M+',
              label: 'Payment',
            },
          ]}
        />
      </div>

      {/* Example 2: Purple Gradient */}
      <div>
        <h3 className="text-xl font-bold mb-4">Example 2: Purple Gradient</h3>
        <GradientFeatureCard
          title="Learning Platform"
          description="Join thousands of students mastering German with our AI-powered learning platform. Track your progress, practice with interactive exercises, and achieve fluency faster."
          buttonText="Start Learning"
          buttonHref="/dashboard/student"
          gradient="linear-gradient(135deg, #6366f1 0%, #4338ca 100%)"
          overlayOpacity={60}
          stats={[
            {
              icon: Users,
              iconColor: 'purple',
              value: '12,450+',
              label: 'Students',
            },
            {
              icon: Award,
              iconColor: 'yellow',
              value: '4.9/5',
              label: 'Rating',
            },
            {
              icon: TrendingUp,
              iconColor: 'green',
              value: '98%',
              label: 'Success Rate',
            },
          ]}
        />
      </div>

      {/* Example 3: Blue Gradient, No Stats */}
      <div>
        <h3 className="text-xl font-bold mb-4">Example 3: Simple Card (No Stats)</h3>
        <GradientFeatureCard
          title="Get Started Today"
          description="Start your German learning journey with personalized lessons, AI-powered feedback, and a supportive community. No credit card required for your first week."
          buttonText="Try for Free"
          onButtonClick={() => alert('Try for Free clicked!')}
          gradient="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
          overlayOpacity={65}
        />
      </div>

      {/* Example 4: Green Gradient */}
      <div>
        <h3 className="text-xl font-bold mb-4">Example 4: Success Story</h3>
        <GradientFeatureCard
          title="Success Stories"
          description="Our students have achieved remarkable results. From passing B2 exams to landing jobs in Germany, see how our platform transforms language learning into real-world success."
          buttonText="Read Stories"
          buttonHref="/testimonials"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          overlayOpacity={75}
          stats={[
            {
              icon: Award,
              iconColor: 'yellow',
              value: '850+',
              label: 'Certificates',
            },
            {
              icon: Users,
              iconColor: 'blue',
              value: '5,200+',
              label: 'Active Learners',
            },
          ]}
        />
      </div>
    </div>
  );
}
