'use client';

import { User } from '@/lib/models/user';
import Link from 'next/link';

interface EnrollmentPendingTabProps {
  user: User;
}

export function EnrollmentPendingTab({ user }: EnrollmentPendingTabProps) {

  const submittedDate = user.enrollmentSubmittedAt
    ? new Date(user.enrollmentSubmittedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Enrollment Status</h2>
      <p className="text-gray-600 mb-8">Your enrollment request is being reviewed</p>

      {/* Success Message Card */}
      <div className="bg-gradient-to-br from-piku-yellow/10 to-piku-mint/10 border-2 border-piku-yellow/30 rounded-2xl p-8 mb-6">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-piku-purple to-pastel-ocean rounded-full flex items-center justify-center animate-pulse">
              <span className="text-4xl">⏳</span>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-piku-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-3 text-center">
          Enrollment Submitted Successfully!
        </h2>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-base text-gray-700 mb-2">
            Thank you for submitting your enrollment request.
          </p>
          <p className="text-gray-600">
            Your application is currently being reviewed by our team.
          </p>
        </div>

        {/* Enrollment Details */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Enrollment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Desired Level:</span>
              <span className="font-bold text-piku-purple">{user.desiredCefrLevel || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Payment Amount:</span>
              <span className="font-bold text-gray-900">₱{user.gcashAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Reference Number:</span>
              <span className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                {user.gcashReferenceNumber || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Submitted:</span>
              <span className="text-sm text-gray-600">{submittedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                ⏳ Pending Review
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-piku-purple/10 to-pastel-ocean/10 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-bold">Expected Review Time:</span>
          </p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-piku-purple to-pastel-ocean">
            24-48 hours
          </p>
        </div>
      </div>

      {/* What's Next - Card Style */}
      <div className="bg-white border-2 border-piku-purple/20 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          <span>What happens next?</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              number: 1,
              title: 'Payment Verification',
              description: 'Your teacher will verify your payment details',
              color: 'blue',
            },
            {
              number: 2,
              title: 'Level Review',
              description: 'Your CEFR level selection will be reviewed',
              color: 'emerald',
            },
            {
              number: 3,
              title: 'Email Notification',
              description: "You'll receive an email once approved",
              color: 'amber',
            },
            {
              number: 4,
              title: 'Full Access',
              description: 'Student dashboard access will be granted',
              color: 'purple',
            },
          ].map((step) => {
            const colorMap: Record<string, { bg: string; text: string }> = {
              blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
              emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
              amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
              purple: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
            };
            const colors = colorMap[step.color];

            return (
              <div key={step.number} className="flex gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold`}
                >
                  {step.number}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-piku-purple to-pastel-ocean text-white font-bold py-3.5 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
        >
          🔄 Check Status
        </button>

        <Link
          href="/"
          className="block w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:border-piku-purple hover:text-piku-purple transition-all duration-300 text-center"
        >
          🏠 Return to Home
        </Link>
      </div>
    </>
  );
}
