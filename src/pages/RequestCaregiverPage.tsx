import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import {
  HeartHandshake,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

interface RequestCaregiverPageProps {
  onNavigate: (path: string) => void;
}

export const RequestCaregiverPage: React.FC<RequestCaregiverPageProps> = ({ onNavigate }) => {
  const { settings } = useContent();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    contactMethod: 'Phone Call',
    careType: 'Elderly Care',
    careForWhom: 'Parent',
    ageGroup: '70 - 79 years',
    preferredGender: 'Female',
    preferredLanguage: 'English',
    state: 'Lagos',
    cityLga: '',
    startDate: '',
    duration: 'Ongoing / Long-term',
    preferredDays: 'Monday to Friday',
    preferredTime: 'Morning to Evening (8am - 5pm)',
    careScheduleType: 'Visiting Support',
    description: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    refCode: string;
    message: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const careTypeOptions = [
    'Home Care Assistance',
    'Elderly Care',
    'Personal Care Assistance',
    'Nursing Support',
    'Recovery Support',
    'Respite Care',
    'Family Care Coordination',
    'Other Specialized Support',
  ];

  const lagosAreas = [
    'Agege / Orile Agege',
    'Ikeja / GRA / Opebi / Allen',
    'Alimosho / Egbeda / Iyana Ipaja',
    'Surulere',
    'Yaba / Ebute Metta',
    'Lekki Phase 1 / Ikate / Chevron',
    'Victoria Island / Ikoyi',
    'Ajah / Sangotedo',
    'Maryland / Anthony / Mende',
    'Gbagada / Ogudu',
    'Oshodi / Isolo',
    'Ikorodu',
    'Other Lagos Location',
    'Outside Lagos State',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Please provide your full contact name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMessage('Please enter a valid phone number so we can reach you.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.cityLga.trim()) {
      setErrorMessage('Please select or specify your location or LGA.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('You must acknowledge the consent declaration to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/public/care-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit care request.');
      }

      setSubmissionSuccess({
        refCode: data.refCode,
        message: data.message,
      });

      // Directly take the message to WhatsApp (+234 916 228 5884)
      const whatsappMessage =
        `*NEW CARE REQUEST - AFNAAN CARES*\n` +
        `*Reference Code:* ${data.refCode || 'N/A'}\n\n` +
        `*CLIENT CONTACT:*\n` +
        `- Name: ${formData.fullName}\n` +
        `- Phone: ${formData.phone}\n` +
        `- Email: ${formData.email}\n` +
        `- Preferred Contact: ${formData.contactMethod}\n\n` +
        `*CARE DETAILS:*\n` +
        `- Service: ${formData.careType}\n` +
        `- Recipient: ${formData.careForWhom} (${formData.ageGroup})\n` +
        `- Caregiver Gender: ${formData.preferredGender}\n` +
        `- Language: ${formData.preferredLanguage}\n\n` +
        `*LOCATION & TIMING:*\n` +
        `- Location: ${formData.cityLga}, ${formData.state}\n` +
        `- Start Date: ${formData.startDate || 'As soon as possible'}\n` +
        `- Duration: ${formData.duration}\n` +
        `- Schedule: ${formData.careScheduleType}\n` +
        `- Shift: ${formData.preferredDays} (${formData.preferredTime})\n\n` +
        `*CARE NOTES:*\n` +
        `${formData.description || 'None provided'}\n\n` +
        `---\n` +
        `Sent via AFNAAN CARES Nurses & Caregiver`;

      const targetWhatsappNumber = '09162285884';
      const whatsappUrl = `https://wa.me/${targetWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Automatically launch WhatsApp directly via https://wa.me/09162285884
      try {
        window.location.href = whatsappUrl;
      } catch (e) {
        console.error('WhatsApp redirect error:', e);
        window.open(whatsappUrl, '_blank');
      }

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (submissionSuccess?.refCode) {
      navigator.clipboard.writeText(submissionSuccess.refCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  // Build the WhatsApp URL for direct button
  const currentWhatsappUrl = submissionSuccess
    ? `https://wa.me/09162285884?text=${encodeURIComponent(
        `*CARE REQUEST FOLLOW-UP - AFNAAN CARES*\n` +
        `Ref Code: ${submissionSuccess.refCode}\n` +
        `Client: ${formData.fullName}\n` +
        `Service: ${formData.careType}\n` +
        `Phone: ${formData.phone}`
      )}`
    : 'https://wa.me/09162285884';

  return (
    <div className="bg-[#F3F8F9] min-h-screen py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Reassurance */}
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[#075765]/10 text-[#075765] text-xs font-bold uppercase tracking-wider">
            Care Request Form
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#075765] tracking-tight">
            Find the Right Care Support for Your Needs
          </h1>
          <p className="text-gray-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tell us a little about the support you need. Submitting directly connects you with our care coordination team on WhatsApp.
          </p>
        </div>

        {/* Success Confirmation Modal/Box */}
        {submissionSuccess ? (
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-gray-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#075765]">
                Thank you for contacting AFNAAN CARES Nurses &amp; Caregiver
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Your request has been registered and redirected to WhatsApp. If WhatsApp did not open automatically, please tap the green button below to send your details.
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 rounded-2xl bg-[#F3F8F9] border border-gray-200 max-w-md mx-auto flex items-center justify-between">
              <div className="text-left">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                  Enquiry Reference Code
                </span>
                <span className="text-lg font-mono font-bold text-[#075765]">
                  {submissionSuccess.refCode}
                </span>
              </div>
              <button
                onClick={copyRefCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={currentWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fae53] text-white px-7 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Open in WhatsApp Directly</span>
              </a>
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    contactMethod: 'Phone Call',
                    careType: 'Elderly Care',
                    careForWhom: 'Parent',
                    ageGroup: '70 - 79 years',
                    preferredGender: 'Female',
                    preferredLanguage: 'English',
                    state: 'Lagos',
                    cityLga: '',
                    startDate: '',
                    duration: 'Ongoing / Long-term',
                    preferredDays: 'Monday to Friday',
                    preferredTime: 'Morning to Evening (8am - 5pm)',
                    careScheduleType: 'Visiting Support',
                    description: '',
                    consent: false,
                  });
                }}
                className="text-sm font-semibold text-[#075765] hover:underline"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          /* Main Form Card */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-10"
          >
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION A: Contact Information */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold text-[#075765] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#075765] text-white text-xs flex items-center justify-center font-mono">
                    A
                  </span>
                  Contact Information
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  How our coordination team should reach you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Adebayo Adeleke"
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
                    placeholder="e.g. 08023456789"
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
                    placeholder="e.g. adeleke@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp Message">WhatsApp Message</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION B: Care Requirements */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold text-[#075765] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#075765] text-white text-xs flex items-center justify-center font-mono">
                    B
                  </span>
                  Care Requirements
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Specify the type of assistance desired.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Primary Service Needed *
                  </label>
                  <select
                    name="careType"
                    value={formData.careType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    {careTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Care Arrangement Type
                  </label>
                  <select
                    name="careScheduleType"
                    value={formData.careScheduleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Visiting Support">Visiting Daily Support (Shifts)</option>
                    <option value="Live-in Support">Live-in Support (24hr Residence)</option>
                    <option value="Temporary Respite">Short-term Respite / Temporary</option>
                    <option value="Weekend Only">Weekend Only Assistance</option>
                    <option value="To Be Discussed">Open to Discuss Options</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION C: Client Information */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold text-[#075765] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#075765] text-white text-xs flex items-center justify-center font-mono">
                    C
                  </span>
                  Client Information
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Who will be receiving the care?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Care Is For Whom?
                  </label>
                  <select
                    name="careForWhom"
                    value={formData.careForWhom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Parent (Mother/Father)">Parent (Mother/Father)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Myself">Myself</option>
                    <option value="Relative / Grandparent">Relative / Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Age Group
                  </label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Below 50">Below 50 years</option>
                    <option value="50 - 64 years">50 - 64 years</option>
                    <option value="65 - 74 years">65 - 74 years</option>
                    <option value="75 - 84 years">75 - 84 years</option>
                    <option value="85+ years">85+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preferred Gender
                  </label>
                  <select
                    name="preferredGender"
                    value={formData.preferredGender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Language Preference
                  </label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Hausa">Hausa</option>
                    <option value="English & Yoruba">English &amp; Yoruba</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION D: Location and Schedule */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold text-[#075765] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#075765] text-white text-xs flex items-center justify-center font-mono">
                    D
                  </span>
                  Location &amp; Schedule (Lagos, Nigeria)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Where and when will services take place?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Area / Local Government Area (LGA) *
                  </label>
                  <select
                    name="cityLga"
                    required
                    value={formData.cityLga}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="">-- Select Lagos Area / LGA --</option>
                    {lagosAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preferred Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Expected Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm bg-white"
                  >
                    <option value="Few Days / Week">Few Days / 1 Week</option>
                    <option value="2 to 4 Weeks">2 to 4 Weeks (Recovery)</option>
                    <option value="1 to 3 Months">1 to 3 Months</option>
                    <option value="Ongoing / Long-term">Ongoing / Long-term (3+ Months)</option>
                    <option value="Flexible / As needed">Flexible / To be discussed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preferred Days
                  </label>
                  <input
                    type="text"
                    name="preferredDays"
                    value={formData.preferredDays}
                    onChange={handleInputChange}
                    placeholder="e.g. Monday to Friday, or Daily"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preferred Time / Shift
                  </label>
                  <input
                    type="text"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 8:00 AM - 4:00 PM or 24hr"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION E: Additional Information */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-bold text-[#075765] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#075765] text-white text-xs flex items-center justify-center font-mono">
                    E
                  </span>
                  Care Description &amp; Routine Notes
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Brief description of the daily routine or assistance required.
                </p>
              </div>

              <div>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about mobility needs, daily preferences, meal preparation support, or general routine..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                ></textarea>
                <p className="text-[11px] text-gray-400 mt-1">
                  Please do not submit highly sensitive clinical diagnoses or medical records here. We will discuss specific medical histories confidentially during your care assessment.
                </p>
              </div>
            </div>

            {/* Mandatory Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-[#F3F8F9] border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-[#075765] rounded border-gray-300 focus:ring-[#10A8B7]"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  I consent to <strong>AFNAAN CARES Nurses &amp; Caregiver</strong> using the information I provide to respond to my enquiry and discuss the care services requested. I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/privacy')}
                    className="text-[#075765] font-bold underline hover:text-[#10A8B7]"
                  >
                    Privacy Policy
                  </button>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Your Care Request...</span>
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-5 h-5 text-[#C9A45C]" />
                    <span>Submit Care Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
