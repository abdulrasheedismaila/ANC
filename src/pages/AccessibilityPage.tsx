import React from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';

interface AccessibilityPageProps {
  onNavigate: (path: string) => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F3F8F9] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-xs font-bold text-[#10A8B7] uppercase tracking-wider block mb-1">
              Inclusive Design
            </span>
            <h1 className="text-3xl font-extrabold text-[#075765]">Accessibility Statement</h1>
            <p className="text-xs text-gray-500 mt-2">
              AFNAAN CARES Nurses &amp; Caregiver Commitment to Digital Accessibility
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-700 text-sm sm:text-base leading-relaxed space-y-6">
            <p>
              AFNAAN CARES Nurses &amp; Caregiver is committed to ensuring digital accessibility for all visitors, including elderly clients, individuals with visual impairments, and people utilizing assistive screen reader technologies.
            </p>

            <h2 className="text-xl font-bold text-[#075765]">Key Standards Implemented:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
              <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
                <div className="flex items-center gap-2 font-bold text-[#075765] text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>High Contrast Ratios</span>
                </div>
                <p className="text-xs text-gray-600">
                  Text colors, buttons, and links strictly adhere to WCAG 2.1 AA contrast requirements against background shades.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
                <div className="flex items-center gap-2 font-bold text-[#075765] text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Reduced Motion Support</span>
                </div>
                <p className="text-xs text-gray-600">
                  Hero orbital animations and moving graphics automatically pause when a user's system preferences enable reduced motion.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
                <div className="flex items-center gap-2 font-bold text-[#075765] text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Accessible Form Elements</span>
                </div>
                <p className="text-xs text-gray-600">
                  All care request inputs, role selectors, and checkboxes include explicit labels, screen-reader cues, and keyboard navigation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
                <div className="flex items-center gap-2 font-bold text-[#075765] text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Descriptive Alternative Text</span>
                </div>
                <p className="text-xs text-gray-600">
                  Photographs of Black African healthcare personnel and caregivers carry accurate alt attributes.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#075765] pt-4">Feedback &amp; Assistance</h2>
            <p>
              If you experience any difficulty accessing any part of our website or need assistance filling out a care request, please call or WhatsApp our team at{' '}
              <a href="https://wa.me/2349162285884" className="text-[#075765] font-bold underline">
                +234 916 228 5884
              </a>{' '}
              or email us at{' '}
              <a href="mailto:abooafnaan28@gmail.com" className="text-[#075765] font-bold underline">
                abooafnaan28@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
