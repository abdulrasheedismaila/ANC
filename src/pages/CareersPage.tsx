import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  HeartHandshake,
  CheckCircle2,
  Upload,
  AlertCircle,
  Loader2,
  FileText,
  ShieldCheck,
  UserCheck,
  Award,
  Clock,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface CareersPageProps {
  onNavigate: (path: string) => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({ onNavigate }) => {
  const { settings } = useContent();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    preferredRole: 'Caregiver',
    experience: '1 - 3 years',
    qualifications: '',
    availability: 'Immediate',
    employmentType: 'Full-time Live-in or Visiting',
    personalStatement: '',
    consent: false,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState<{
    refCode: string;
    message: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const valuesWeCherish = [
    { title: 'Compassion & Empathy', desc: 'A genuine heart that respects each individual’s journey.' },
    { title: 'Respect for Dignity', desc: 'Upholding personal privacy and physical dignity without exception.' },
    { title: 'Reliability & Punctuality', desc: 'Families count on us; being dependable is non-negotiable.' },
    { title: 'Good Communication', desc: 'Active listening and respectful, clear reporting to families.' },
    { title: 'Professional Conduct', desc: 'Clean presentation, ethics, integrity, and calm demeanour.' },
    { title: 'Continuous Learning', desc: 'Active participation in our monthly practical care workshops.' },
    { title: 'Strict Confidentiality', desc: 'Treating private home and family matters with total discretion.' },
    { title: 'Verified Qualifications', desc: 'Documented medical credentials for all clinical roles.' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('The selected file exceeds the 10MB limit. Please choose a smaller document.');
        return;
      }
      setCvFile(file);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMessage('Please enter a valid telephone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('Please acknowledge the consent statement to submit your application.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('phone', formData.phone);
      payload.append('email', formData.email);
      payload.append('location', formData.location);
      payload.append('preferredRole', formData.preferredRole);
      payload.append('experience', formData.experience);
      payload.append('qualifications', formData.qualifications);
      payload.append('availability', formData.availability);
      payload.append('employmentType', formData.employmentType);
      payload.append('personalStatement', formData.personalStatement);
      payload.append('consent', String(formData.consent));

      if (cvFile) {
        payload.append('cvFile', cvFile);
      }

      const res = await fetch('/api/public/caregiver-applications', {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setApplicationSuccess({
        refCode: data.refCode,
        message: data.message,
      });

      // Directly take application message to WhatsApp (+234 916 228 5884)
      const whatsappMessage =
        `*NEW CAREGIVER APPLICATION - AFNAAN CARES*\n` +
        `*Reference Code:* ${data.refCode || 'N/A'}\n\n` +
        `*APPLICANT DETAILS:*\n` +
        `- Full Name: ${formData.fullName}\n` +
        `- Phone: ${formData.phone}\n` +
        `- Email: ${formData.email}\n` +
        `- Location: ${formData.location || 'Lagos'}\n\n` +
        `*ROLE & QUALIFICATIONS:*\n` +
        `- Preferred Role: ${formData.preferredRole}\n` +
        `- Experience: ${formData.experience}\n` +
        `- Qualifications: ${formData.qualifications || 'Not specified'}\n` +
        `- Availability: ${formData.availability}\n` +
        `- Arrangement: ${formData.employmentType}\n\n` +
        `*PERSONAL STATEMENT:*\n` +
        `${formData.personalStatement || 'None provided'}\n\n` +
        `---\n` +
        `Sent via AFNAAN CARES Nurses & Caregiver Recruitment`;

      const targetWhatsappNumber = '2349162285884';
      const whatsappUrl = `https://wa.me/${targetWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Automatically launch WhatsApp
      try {
        window.location.href = whatsappUrl;
      } catch (e) {
        console.error('WhatsApp redirect error:', e);
        window.open(whatsappUrl, '_blank');
      }

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (applicationSuccess?.refCode) {
      navigator.clipboard.writeText(applicationSuccess.refCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#075765] text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#10A8B7]/30 text-[#C9A45C] text-xs font-bold uppercase tracking-wider">
                Care Careers in Lagos
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Build a Meaningful Career in Care
              </h1>
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed font-light max-w-2xl">
                Do you have a passion for helping others? AFNAAN CARES Nurses &amp; Caregiver welcomes enquiries from responsible, compassionate individuals interested in caregiving opportunities.
              </p>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/7Jg5BngR/Gemini-Generated-Image-3qtj7q3qtj7q3qtj.jpg"
                  alt="Professional Black African nurse and caregiver team"
                  className="w-full h-72 sm:h-80 object-cover object-top"
                  fallbackText="AFNAAN CARES Care Team"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Standards */}
      <section className="py-14 bg-[#F3F8F9] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#10A8B7] uppercase tracking-wider">
              Our Professional Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#075765]">
              Qualities We Value in Every Caregiver
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Applications are subject to role requirements, credential verification, character reference checks, and available opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valuesWeCherish.map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7] shrink-0" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#075765]">{v.title}</h3>
                </div>
                <p className="text-xs text-gray-600 leading-snug">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-16 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6">
        {applicationSuccess ? (
          <div className="bg-[#F3F8F9] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#075765]">
                Application Received Successfully
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto">
                {applicationSuccess.message}
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 rounded-2xl bg-white border border-gray-300 max-w-md mx-auto flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Application Reference ID
                </span>
                <span className="text-lg font-mono font-bold text-[#075765]">
                  {applicationSuccess.refCode}
                </span>
              </div>
              <button
                onClick={copyRefCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please preserve this reference code. Your application has been logged and redirected to WhatsApp for immediate onboarding communication.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/2349162285884?text=${encodeURIComponent(
                  `*CAREGIVER APPLICATION FOLLOW-UP - AFNAAN CARES*\n` +
                  `Ref Code: ${applicationSuccess.refCode}\n` +
                  `Applicant: ${formData.fullName}\n` +
                  `Role: ${formData.preferredRole}\n` +
                  `Phone: ${formData.phone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fae53] text-white px-7 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>Open in WhatsApp Directly</span>
              </a>
              <button
                onClick={() => {
                  setApplicationSuccess(null);
                  setCvFile(null);
                }}
                className="text-xs font-bold text-[#075765] hover:underline"
              >
                Submit another application
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 space-y-8"
          >
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-[#075765]">
                Caregiver &amp; Nurse Recruitment Form
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Please complete all fields truthfully. Clinical roles require verified regulatory accreditation.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Grace Chidinma Okon"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 08123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. grace.okon@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Current Residential Location (Lagos)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Orile Agege, Lagos"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Preferred Role *
                </label>
                <select
                  name="preferredRole"
                  value={formData.preferredRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                >
                  <option value="Caregiver">Caregiver</option>
                  <option value="Registered Nurse">Registered Nurse (RN)</option>
                  <option value="Nursing Assistant">Nursing Assistant</option>
                  <option value="Home Care Assistant">Home Care Assistant</option>
                  <option value="Other relevant role">Other Healthcare Support Role</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Relevant Experience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                >
                  <option value="Less than 1 year">Less than 1 year / Trainee</option>
                  <option value="1 - 3 years">1 - 3 years</option>
                  <option value="4 - 6 years">4 - 6 years</option>
                  <option value="7+ years">7+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Within 1 - 2 weeks">Within 1 - 2 weeks</option>
                  <option value="Within 1 month">Within 1 month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Preferred Employment Arrangement
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                >
                  <option value="Full-time Live-in or Visiting">Flexible (Live-in or Visiting)</option>
                  <option value="Visiting Daily Only">Visiting Daily Shifts Only</option>
                  <option value="Live-in Residential Only">Live-in Residential Only</option>
                  <option value="Part-time / Weekend">Part-time / Weekend Coverage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Certifications &amp; Educational Qualifications
              </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g. RN License No, Nursing Assistant Diploma, First Aid Certification..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Short Personal Statement
              </label>
              <textarea
                name="personalStatement"
                rows={3}
                value={formData.personalStatement}
                onChange={handleInputChange}
                placeholder="Why are you passionate about home care and elderly support? Share your perspective..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
              ></textarea>
            </div>

            {/* Document / CV Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Upload Curriculum Vitae (CV) &bull; PDF or DOCX (Max 10MB)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-[#10A8B7]" />
                  <p className="text-sm font-semibold text-gray-700">
                    {cvFile ? cvFile.name : 'Click or drag your CV file here to upload'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cvFile
                      ? `${(cvFile.size / (1024 * 1024)).toFixed(2)} MB uploaded`
                      : 'Supported formats: PDF, DOCX, DOC, JPG'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-[#075765] rounded border-gray-300 focus:ring-[#10A8B7]"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  I confirm that all details provided are true and accurate. I consent to <strong>AFNAAN CARES Nurses &amp; Caregiver</strong> processing my application information and contacting references as part of the recruitment suitability assessment.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5 text-[#C9A45C]" />
                  <span>Submit My Application</span>
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
