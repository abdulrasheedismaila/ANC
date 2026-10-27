import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { settings } = useContent();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Care Enquiry',
    message: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    setSuccessMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please provide your message.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('Please check the consent box to send your message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSuccessMessage(data.message || 'Your message has been sent successfully.');

      // Directly take message to WhatsApp (+234 916 228 5884)
      const whatsappMessage =
        `*NEW CONTACT ENQUIRY - AFNAAN CARES*\n\n` +
        `*SENDER DETAILS:*\n` +
        `- Full Name: ${formData.fullName}\n` +
        `- Email: ${formData.email}\n` +
        `- Phone: ${formData.phone || 'Not provided'}\n` +
        `- Subject: ${formData.subject}\n\n` +
        `*MESSAGE:*\n` +
        `${formData.message}\n\n` +
        `---\n` +
        `Sent via AFNAAN CARES Nurses & Caregiver`;

      const targetWhatsappNumber = '2349162285884';
      const whatsappUrl = `https://wa.me/${targetWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Automatically launch WhatsApp
      try {
        window.location.href = whatsappUrl;
      } catch (e) {
        console.error('WhatsApp redirect error:', e);
        window.open(whatsappUrl, '_blank');
      }

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'General Care Enquiry',
        message: '',
        consent: false,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Maps search query link for the verified business location
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'No 7 Old Ota Road, Orile Bus Stop, Orile Agege, Lagos, Nigeria'
  )}`;

  return (
    <div className="bg-[#F3F8F9] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#075765] text-white py-16 lg:py-20 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#10A8B7]/30 text-[#C9A45C] text-xs font-bold uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Let's Talk About How We Can Help
          </h1>
          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about our services, need assistance finding a caregiver, or want to learn more about AFNAAN CARES? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Direct Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-bold text-[#075765]">
                Contact Information
              </h2>

              <div className="space-y-4 text-sm text-gray-700">
                {/* Business Address */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#075765]/10 text-[#075765] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#075765] text-xs uppercase tracking-wider">
                      Business Location
                    </strong>
                    <span className="leading-relaxed text-gray-800">
                      {settings.businessAddress}
                    </span>
                    <div className="pt-1.5">
                      <a
                        href={mapSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#10A8B7] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#075765]/10 text-[#075765] shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#075765] text-xs uppercase tracking-wider">
                      Official Email
                    </strong>
                    <a
                      href={`mailto:${settings.contactEmail}?subject=Enquiry%20About%20AFNAAN%20CARES%20Nurses%20%26%20Caregiver`}
                      className="text-gray-800 hover:text-[#075765] underline decoration-gray-300 font-medium"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#25D366]/15 text-[#25D366] shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#075765] text-xs uppercase tracking-wider">
                      WhatsApp Line
                    </strong>
                    <span className="text-gray-800 font-medium">
                      {settings.whatsappDisplay || '+234 916 228 5884'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1fae53] text-white py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Chat With Us on WhatsApp</span>
                </a>
                <a
                  href={`mailto:${settings.contactEmail}?subject=Enquiry%20About%20AFNAAN%20CARES%20Nurses%20%26%20Caregiver`}
                  className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Direct Email</span>
                </a>
              </div>
            </div>

            {/* Emergency Disclaimer Box */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Emergency Situations Notice</span>
              </div>
              <p>
                Our team provides scheduled home care and planned recovery support. If you or your loved one experiences a sudden medical crisis, please visit an emergency hospital facility or contact acute emergency medical services immediately.
              </p>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#075765] mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Fill in the form below and a representative will reply via email or telephone promptly.
              </p>

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Babatunde Williams"
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
                      placeholder="e.g. babatunde@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 08023456789"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Home care for elderly mother"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="How can we assist you or your family?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                  ></textarea>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F3F8F9] border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-[#075765] rounded border-gray-300 focus:ring-[#10A8B7]"
                    />
                    <span className="text-xs text-gray-600">
                      I agree that AFNAAN CARES Nurses &amp; Caregiver may store and use this message to respond to my enquiry in accordance with their privacy policy.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C9A45C]" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
