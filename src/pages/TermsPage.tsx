import React from 'react';
import { useContent } from '../context/ContentContext';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F3F8F9] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-xs font-bold text-[#10A8B7] uppercase tracking-wider block mb-1">
              Service Agreement
            </span>
            <h1 className="text-3xl font-extrabold text-[#075765]">Terms of Service</h1>
            <p className="text-xs text-gray-500 mt-2">
              AFNAAN CARES Nurses &amp; Caregiver &bull; Lagos, Nigeria
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-700 text-sm sm:text-base leading-relaxed space-y-6">
            <h2 className="text-xl font-bold text-[#075765]">1. Scope of Services</h2>
            <p>
              AFNAAN CARES Nurses &amp; Caregiver operates as a home-care, elderly assistance, and clinical nursing support provider. We deliver personalised support designed around agreed care plans.
            </p>

            <h2 className="text-xl font-bold text-[#075765]">2. Clinical vs. Non-Clinical Care</h2>
            <p>
              Non-clinical home care (companionship, light housekeeping, meal reminders, bathing support) is provided by trained caregivers. Clinical nursing procedures (wound dressing, injections, catheter support, clinical charting) are administered exclusively by appropriately registered nursing personnel.
            </p>

            <h2 className="text-xl font-bold text-[#075765]">3. Non-Emergency Disclaimer</h2>
            <p>
              Our website, online forms, and home services are not designed for acute life-threatening emergencies. In any emergency situation, you must contact local emergency medical services or proceed immediately to an accredited hospital facility.
            </p>

            <h2 className="text-xl font-bold text-[#075765]">4. Enquiries and Service Agreements</h2>
            <p>
              Submitting a care request or an application through this website registers an enquiry. Formal caregiving engagements begin only upon completion of a mutual care assessment and execution of an agreed care arrangement.
            </p>

            <h2 className="text-xl font-bold text-[#075765]">5. Governing Law</h2>
            <p>
              These terms are governed in accordance with the laws of the Federal Republic of Nigeria and the jurisdiction of Lagos State.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
