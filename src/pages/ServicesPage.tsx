import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  Heart,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { services } = useContent();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How quickly can care arrangements begin after making a request?',
      a: 'Following your enquiry, our care coordination team typically reviews and contacts you within 24 hours to discuss requirements. Once needs and schedules are agreed upon, care can often commence within 2 to 3 days, depending on specific qualifications and caregiver availability in your area of Lagos.',
    },
    {
      q: 'What is the distinction between non-clinical home care and nursing support?',
      a: 'Non-clinical home care focuses on activities of daily living: personal grooming, meal prep, mobility, companionship, and general routine support. Nursing support involves clinical procedures—such as surgical wound dressing, catheter management, injections, and clinical vitals monitoring—which are strictly performed by registered, authorised nursing professionals.',
    },
    {
      q: 'Are your caregivers and nurses background-checked?',
      a: 'Yes. All AFNAAN CARES caregivers and nursing professionals undergo comprehensive identity verification, reference verification from previous employers or client families, and competency evaluations before placement.',
    },
    {
      q: 'Do you offer both visiting and 24-hour live-in care arrangements?',
      a: 'Yes, we provide flexible arrangements based on client needs and caregiver availability, including daily visiting shifts (e.g. 8 to 12 hours) and continuous live-in care across various local government areas in Lagos.',
    },
    {
      q: 'Can families request care on behalf of a parent living in Lagos from abroad?',
      a: 'Absolutely. Many of our clients are families living in the diaspora who rely on AFNAAN CARES for dependable, transparent care for their parents, complete with structured reports and direct WhatsApp updates.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#075765] text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#075765] via-[#075765]/90 to-[#10A8B7]/30 z-10"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10A8B7_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#10A8B7]/25 text-[#C9A45C] text-xs font-bold uppercase tracking-wider border border-[#10A8B7]/40">
                What We Do
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Care Services Designed Around People
              </h1>
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                AFNAAN CARES Nurses &amp; Caregiver provides care and support services designed around individual needs, personal preferences, and family circumstances. We aim to make finding suitable care clearer, more reassuring, and more personal.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
                  Appropriately Qualified Professionals
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#10A8B7]" />
                  Flexible Visiting &amp; Live-In Options
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <ImageWithFallback
                  src="https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg"
                  alt="Black African healthcare professionals in clinical uniforms"
                  className="w-full h-80 object-cover object-top"
                  fallbackText="Healthcare Professionals"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Disclaimer Strip */}
      <section className="bg-[#F3F8F9] py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 text-xs sm:text-sm text-gray-600">
          <ShieldAlert className="w-5 h-5 text-[#075765] shrink-0" />
          <span>
            <strong>Regulatory &amp; Clinical Standard:</strong> Non-clinical daily care and clinical nursing services are clearly differentiated. All clinical nursing procedures are performed solely by registered, qualified nursing personnel within applicable professional standards.
          </span>
        </div>
      </section>

      {/* Detailed Services Listing */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20">
          {services.map((service, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <div
                key={service.id}
                id={service.slug}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 border-t border-gray-100 first:border-t-0 first:pt-0"
              >
                {/* Media */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : ''}`}>
                  <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 group">
                    <ImageWithFallback
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackText={service.title}
                    />
                    <div className="absolute top-4 left-4 bg-[#075765]/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                      {service.category}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-1' : ''}`}>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#10A8B7] uppercase tracking-wider">
                      Service Category {idx + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#075765] tracking-tight">
                      {service.title}
                    </h2>
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed">
                    {service.fullDescription || service.summary}
                  </p>

                  {/* Who May Benefit */}
                  {service.whoMayBenefit && (
                    <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200">
                      <p className="text-xs font-bold text-[#075765] uppercase tracking-wider mb-1">
                        Who May Benefit:
                      </p>
                      <p className="text-sm text-gray-700 leading-snug">
                        {service.whoMayBenefit}
                      </p>
                    </div>
                  )}

                  {/* Examples of Support Provided */}
                  {service.supportExamples && service.supportExamples.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#075765] mb-2">
                        Examples of support provided:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {service.supportExamples.map((ex, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#10A8B7] shrink-0 mt-0.5" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('/request-caregiver')}
                      className="bg-[#075765] hover:bg-[#05434e] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-[#C9A45C]" />
                      <span>Request This Service</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 lg:py-24 bg-[#F3F8F9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#075765] bg-[#075765]/10 px-3 py-1 rounded-full">
              Common Questions
            </span>
            <h2 className="text-3xl font-extrabold text-[#075765] tracking-tight">
              Frequently Asked Questions About Our Care
            </h2>
            <p className="text-gray-600 text-sm">
              Clear answers to help you make informed decisions for your loved one.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-[#075765] hover:text-[#10A8B7] transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <span className="p-1 rounded-full bg-[#F3F8F9] shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#075765]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#075765]" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Service Page CTA */}
      <section className="py-14 bg-linear-to-r from-[#075765] to-[#10A8B7] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            Ready to arrange trusted support in Lagos?
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
            Fill out our care request form with your loved one’s routine and our coordinators will reach out immediately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/request-caregiver')}
              className="bg-white text-[#075765] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all"
            >
              Request a Caregiver Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
