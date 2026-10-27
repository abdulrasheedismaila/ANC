import React from 'react';
import { useContent } from '../context/ContentContext';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const { settings } = useContent();

  return (
    <div className="bg-[#F3F8F9] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-xs font-bold text-[#10A8B7] uppercase tracking-wider block mb-1">
              Legal &amp; Data Protection
            </span>
            <h1 className="text-3xl font-extrabold text-[#075765]">Privacy Policy</h1>
            <p className="text-xs text-gray-500 mt-2">
              Last Updated: October 2026 &bull; AFNAAN CARES Nurses &amp; Caregiver (Lagos, Nigeria)
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-gray-700 text-sm sm:text-base leading-relaxed space-y-6">
            <p className="font-medium text-gray-800">
              At AFNAAN CARES Nurses &amp; Caregiver, we respect individual dignity and hold personal privacy to the highest standard. Because our services relate to home care, elderly support, and nursing assistance, we handle all submitted data with utmost confidentiality.
            </p>

            <h2 className="text-xl font-bold text-[#075765] pt-2">1. Information We Collect</h2>
            <p>
              When you submit a care request, apply to join our caregiver team, or send a general enquiry, we collect only necessary details:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
              <li>Contact details (full name, phone/WhatsApp number, email address).</li>
              <li>Care requirements (type of care, preferred timing, client age group, location/LGA).</li>
              <li>Caregiver application details (curriculum vitae, qualifications, and work experience).</li>
            </ul>
            <p className="text-xs text-gray-500 italic">
              Notice: We do not solicit unnecessary confidential clinical files or excessive financial data over our public website.
            </p>

            <h2 className="text-xl font-bold text-[#075765] pt-2">2. How We Use Collected Information</h2>
            <p>Your details are used strictly for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
              <li>Evaluating and responding to home care and nursing requests.</li>
              <li>Reaching out to discuss care arrangements and caregiver suitability.</li>
              <li>Reviewing professional credentials of nurse and caregiver applicants.</li>
              <li>Maintaining ongoing care coordination and safety records.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#075765] pt-2">3. Storage &amp; Access Controls</h2>
            <p>
              Submitted forms are stored in secured database systems protected by server-side authorization controls. Access is restricted exclusively to authorized administrative staff and care supervisors. We do not sell, rent, or trade your data to any commercial advertisers.
            </p>

            <h2 className="text-xl font-bold text-[#075765] pt-2">4. Client Dignity &amp; Media Consent</h2>
            <p>
              Photographs, videos, and testimonials appearing on our impact page are published solely with explicit, verifiable consent from the individuals or authorized family representatives involved. Private clinical moments are never published.
            </p>

            <h2 className="text-xl font-bold text-[#075765] pt-2">5. Contact Our Privacy Lead</h2>
            <p>
              To inspect, amend, or delete any records submitted to AFNAAN, please reach out directly:
            </p>
            <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200 text-sm text-gray-700">
              <p><strong>AFNAAN Nurses &amp; Caregiver</strong></p>
              <p>No 7 Old Ota Road, Orile Bus Stop, Orile Agege, Lagos, Nigeria.</p>
              <p>Email: <a href="mailto:abooafnaan28@gmail.com" className="text-[#075765] underline">abooafnaan28@gmail.com</a></p>
              <p>WhatsApp: +234 916 228 5884</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
