import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { HeroAnimation } from '../components/HeroAnimation';
import { HeroSlider } from '../components/HeroSlider';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  Heart,
  ShieldCheck,
  UserCheck,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Phone,
  ChevronRight,
  Star,
  Sparkles,
  MapPin,
  Award,
  ChevronLeft,
  Film,
  Play
} from 'lucide-react';
import { parseVideoUrl } from '../utils/mediaUtils';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { settings, services, gallery, testimonials } = useContent();
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const trustHighlights = [
    {
      title: 'Compassionate Care',
      desc: 'Dignity & empathy at every visit',
      icon: <Heart className="w-5 h-5 text-[#C9A45C]" />,
    },
    {
      title: 'Professional Care Team',
      desc: 'Vetted, respectful, and trained',
      icon: <ShieldCheck className="w-5 h-5 text-[#10A8B7]" />,
    },
    {
      title: 'Personalised Support',
      desc: 'Care plans tailored to your loved one',
      icon: <UserCheck className="w-5 h-5 text-[#075765]" />,
    },
    {
      title: 'Family-Focused Service',
      desc: 'Clear communication & daily peace of mind',
      icon: <Users className="w-5 h-5 text-[#C9A45C]" />,
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Tell Us Your Needs',
      desc: 'Share your care requirements, schedule preferences, and specific assistance needed through our online form or WhatsApp.',
    },
    {
      number: '02',
      title: 'Discuss Your Requirements',
      desc: 'Our care coordination team reviews the request and arranges a friendly conversation to clarify details and expectations.',
    },
    {
      number: '03',
      title: 'Find Suitable Support',
      desc: 'We match an appropriate caregiver or qualified nurse based on availability, specific qualifications, language, and client needs.',
    },
    {
      number: '04',
      title: 'Begin Your Care Journey',
      desc: 'Care arrangements commence smoothly with regular supervision, clear family updates, and continuous care review.',
    },
  ];

  const whyChoosePoints = [
    'Compassionate and respectful care delivered with genuine patience.',
    'Individualised care planning tailored to personal routines and comfort.',
    'Clear, ongoing communication and reassurance for families in Lagos and abroad.',
    'Uncompromising focus on individual dignity, emotional privacy, and safety.',
    'Role-specific caregiver suitability vetting and qualification verification.',
    'Flexible scheduling options including visiting and live-in arrangements.',
    'Commitment to continuous training and regular quality check-ins.',
  ];

  return (
    <div className="overflow-hidden">
      {/* SECTION A: HERO WITH FULL-WIDTH SMOOTH IMAGE SLIDER */}
      <section className="relative min-h-[580px] lg:min-h-[640px] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#075765]/40 overflow-hidden flex items-center">
        {/* Full-width continuous smooth image slider */}
        <HeroSlider />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-30 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-[#C9A45C] border border-white/25 text-xs font-bold tracking-wide backdrop-blur-md shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span className="text-white drop-shadow-xs">{settings.trustStatement || 'Care that puts people first.'}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
                {settings.heroHeadline ? (
                  settings.heroHeadline.split('\n').map((line, idx) => (
                    <span key={idx} className={idx === 1 ? 'block text-[#10A8B7]' : 'block text-white'}>
                      {line}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="block text-white">Compassionate Care.</span>
                    <span className="block text-[#10A8B7]">Professional Support.</span>
                    <span className="block text-white">Peace of Mind.</span>
                  </>
                )}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-gray-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal drop-shadow-xs">
                {settings.heroSubtext ||
                  'At AFNAAN Nurses & Caregiver, we believe everyone deserves compassionate, respectful, and dependable care. We connect individuals and families with dedicated care professionals who put dignity, comfort, and wellbeing first.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/request-caregiver')}
                  className="w-full sm:w-auto bg-[#10A8B7] hover:bg-[#0da0ae] text-white px-8 py-4 rounded-xl font-bold text-base shadow-2xl hover:shadow-[#10A8B7]/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-[#C9A45C] fill-[#C9A45C]" />
                  <span>Request a Caregiver</span>
                </button>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border-2 border-white/60 px-7 py-3.5 rounded-xl font-bold text-base shadow-lg backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-5 h-5 text-[#C9A45C]" />
                  <span>Become a Caregiver</span>
                </button>
              </div>

              {/* Local reassurance note */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-white/90 font-medium drop-shadow-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  Vetted African Caregivers
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  Operating across Lagos
                </span>
              </div>
            </div>

            {/* Right Animated Hero Graphic */}
            <div className="lg:col-span-5 flex items-center justify-center pt-4 lg:pt-0">
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: TRUST HIGHLIGHTS STRIP */}
      <section className="bg-white py-6 border-b border-gray-100 shadow-xs relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustHighlights.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F3F8F9]/80 border border-gray-100 flex items-center gap-3.5 transition-all hover:bg-white hover:shadow-md"
              >
                <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#075765] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION C: INTRODUCTION - CARE THAT FEELS PERSONAL */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg"
                  alt="Compassionate Black Nigerian caregiver assisting an elderly client in a comfortable home"
                  className="w-full h-[400px] sm:h-[480px] object-cover"
                  fallbackText="Caregiver assisting elderly client"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#075765]/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white">
                  <p className="text-xs font-bold text-[#075765] uppercase tracking-wider">
                    Our Core Philosophy
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    "Every person has unique needs, preferences, and routines that deserve respect."
                  </p>
                </div>
              </div>
              {/* Subtle decorative accent block */}
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-32 h-32 bg-[#C9A45C]/15 rounded-3xl -z-10"></div>
            </div>

            {/* Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-[#075765]/10 text-[#075765] text-xs font-bold uppercase tracking-wider">
                Personalised Home Care
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
                Care That Feels Personal
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Every person has unique needs, preferences, and routines. AFNAAN Nurses &amp; Caregiver is committed to providing thoughtful care and support that respects individual dignity, promotes comfort, and helps families feel more confident about their loved ones' wellbeing.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Whether supporting an aging parent, assisting with everyday routines, or facilitating recovery after a hospital stay, our care is structured around personal comfort and genuine companionship right here in Lagos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Respectful daily assistance</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Dignity in personal care</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Attentive clinical observation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10A8B7]" />
                  <span>Constant family communication</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/services')}
                  className="bg-[#10A8B7] hover:bg-[#0d8f9c] text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Discover What We Do</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: FEATURED SERVICES */}
      <section className="py-16 lg:py-24 bg-[#F3F8F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10A8B7] bg-[#10A8B7]/10 px-3 py-1 rounded-full">
              Tailored Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
              Our Featured Care Services
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Explore our core care arrangements delivered by trained caregivers and appropriately qualified nursing professionals across Lagos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackText={service.title}
                  />
                  <div className="absolute top-3 right-3 bg-[#075765]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {service.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#075765] group-hover:text-[#10A8B7] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mt-2.5">
                      {service.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('/services')}
                      className="text-sm font-bold text-[#075765] hover:text-[#10A8B7] transition-colors flex items-center gap-1"
                    >
                      <span>Learn More</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate('/request-caregiver')}
                      className="text-xs bg-[#F3F8F9] hover:bg-[#075765] text-[#075765] hover:text-white px-3 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('/services')}
              className="inline-flex items-center gap-2 bg-[#075765] hover:bg-[#05434e] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>View All Services &amp; Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION E: HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A45C] bg-[#C9A45C]/15 px-3 py-1 rounded-full">
              Clear &amp; Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              A straightforward four-step process to connect your family with dependable, compassionate care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-[#F3F8F9] border border-gray-100 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="text-3xl font-extrabold text-[#10A8B7]/40 mb-3 font-mono">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[#075765] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 p-8 rounded-2xl bg-linear-to-r from-[#075765] to-[#10A8B7] text-white text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="text-left space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold">Ready to discuss your care needs?</h3>
              <p className="text-white/80 text-sm">
                Our care coordinators in Lagos are available to listen and guide you.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/request-caregiver')}
              className="bg-white text-[#075765] hover:bg-gray-100 px-7 py-3.5 rounded-xl font-bold text-sm shadow-md whitespace-nowrap transition-all"
            >
              Let's Discuss Your Care Needs
            </button>
          </div>
        </div>
      </section>

      {/* SECTION F: WHY CHOOSE AFNAAN? */}
      <section className="py-16 lg:py-24 bg-[#F3F8F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Content & Trust pillars */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-[#075765]/10 text-[#075765] text-xs font-bold uppercase tracking-wider">
                Why Families Trust AFNAAN CARES
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
                Care Built on Empathy, Integrity &amp; Continuous Oversight
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Choosing someone to enter your home or assist an elderly parent is a decision of supreme trust. We take that responsibility seriously through thorough background checks, role-appropriate qualifications, and an enduring respect for dignity.
              </p>

              <div className="space-y-3.5 pt-2">
                {whyChoosePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[#10A8B7]/20 text-[#075765] mt-0.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#075765]" />
                    </div>
                    <span className="text-sm text-gray-700 leading-snug">{point}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Professional Note:</strong> We clearly distinguish clinical nursing from non-clinical caregiving. Clinical procedures are administered solely by registered, appropriately authorised nursing professionals.
              </div>
            </div>

            {/* Right: Authentic Photograph */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg"
                  alt="A professional Black Nigerian healthcare worker consulting with a client family"
                  className="w-full h-[450px] object-cover"
                  fallbackText="Nurse speaking with family"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 bg-[#075765] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <Award className="w-8 h-8 text-[#C9A45C]" />
                <div>
                  <p className="text-sm font-bold">100% Vetted Personnel</p>
                  <p className="text-xs text-gray-200">Continuous in-person supervision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: CEO INTRODUCTION - LEADERSHIP ROOTED IN CARE */}
      <section className="py-16 lg:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-linear-to-br from-[#075765] to-[#04333c] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Background watermarks */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#10A8B7]/10 blur-2xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              {/* CEO Portrait or Elegant Placeholder */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl bg-[#09414c] flex items-center justify-center">
                  <ImageWithFallback
                    src={settings.ceoImageUrl || 'https://i.ibb.co/xSSVrxWH/Whats-App-Image-2026-10-23-at-5-31-39-PM.jpg'}
                    alt={settings.ceoName}
                    className="w-full h-full object-cover object-top"
                    fallbackText={settings.ceoName}
                  />
                </div>
                <div className="mt-3">
                  <h4 className="text-lg font-bold text-white">{settings.ceoName}</h4>
                  <p className="text-xs text-[#C9A45C] font-medium">{settings.ceoTitle}</p>
                </div>
              </div>

              {/* CEO Biography */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#C9A45C] text-xs font-bold uppercase tracking-wider">
                  Leadership Rooted in Care
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  A Vision of Respect, Dignity &amp; Compassion
                </h3>

                <div className="text-gray-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line font-light">
                  {settings.ceoBio ||
                    `IMRAN MUTOLIB ADEIZA leads AFNAAN CARES Nurses & Caregiver with a focus on compassionate service, professionalism, and the importance of treating every individual with dignity and respect.

His vision for AFNAAN CARES is to build a care service that listens to families, values dedicated care professionals, and places people's wellbeing at the centre of every care arrangement.

Through AFNAAN CARES, he aims to encourage a culture of empathy, responsibility, trust, and continuous improvement in caregiving.`}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('/impact')}
                    className="inline-flex items-center gap-2 bg-[#10A8B7] hover:bg-[#0da0ae] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <span>Meet Our Team</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION H: OUR IMPACT PREVIEW */}
      <section className="py-16 lg:py-24 bg-[#F3F8F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#10A8B7] bg-[#10A8B7]/10 px-3 py-1 rounded-full">
                Moments of Care
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
                Our Impact in Action
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-xl">
                Real activities, community health support, and genuine caregiver moments from Lagos homes and neighbourhoods.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/impact')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#075765] hover:text-[#10A8B7] transition-colors"
            >
              <span>Explore Our Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group border border-gray-100 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-gray-900">
                  {item.mediaType === 'video' ? (
                    (() => {
                      const videoInfo = parseVideoUrl(item.mediaUrl);
                      return (
                        <div className="w-full h-full relative bg-gray-900 flex items-center justify-center">
                          {videoInfo.thumbnailUrl ? (
                            <ImageWithFallback
                              src={videoInfo.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                              fallbackText="Care Video"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-[#075765] to-gray-900 flex flex-col items-center justify-center p-4 text-center">
                              <Film className="w-8 h-8 text-[#C9A45C] mb-1.5" />
                              <span className="text-white text-xs font-semibold line-clamp-1">{item.title}</span>
                              <span className="text-gray-300 text-[10px] capitalize">{videoInfo.platform} Video</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/95 text-[#075765] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-[#075765] ml-0.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <ImageWithFallback
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackText={item.title}
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-[#075765]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {item.category}
                  </div>
                  {item.mediaType === 'video' && (
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Film className="w-3 h-3 text-[#C9A45C]" />
                      <span>Video</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-[#075765] text-base group-hover:text-[#10A8B7] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2">
                      {item.caption || item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#10A8B7]" />
                      {item.location}
                    </span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION I: TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A45C] bg-[#C9A45C]/15 px-3 py-1 rounded-full">
                Family Reflections
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075765] tracking-tight">
                What Families Say About Our Care
              </h2>
            </div>

            {/* Testimonial Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-[#F3F8F9] border border-gray-100 shadow-sm relative">
              <div className="flex items-center gap-1 text-[#C9A45C] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#C9A45C]" />
                ))}
              </div>

              <blockquote className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed italic mb-6">
                "{testimonials[activeTestimonialIdx]?.feedback}"
              </blockquote>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <h4 className="font-bold text-[#075765] text-base">
                    {testimonials[activeTestimonialIdx]?.clientName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {testimonials[activeTestimonialIdx]?.relationship} &bull; {testimonials[activeTestimonialIdx]?.location}
                  </p>
                </div>

                {testimonials.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActiveTestimonialIdx((prev) =>
                          prev === 0 ? testimonials.length - 1 : prev - 1
                        )
                      }
                      className="p-2 rounded-full bg-white hover:bg-gray-100 text-[#075765] shadow-xs"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveTestimonialIdx((prev) =>
                          prev === testimonials.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="p-2 rounded-full bg-white hover:bg-gray-100 text-[#075765] shadow-xs"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION J: FINAL CALL TO ACTION */}
      <section className="py-16 lg:py-24 bg-linear-to-b from-[#075765] to-[#04343d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 text-[#C9A45C] mb-2">
            <Heart className="w-8 h-8 fill-[#C9A45C]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Your Loved Ones Deserve Thoughtful Care
          </h2>
          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Tell us how we can support you or someone you love. Our care team is ready to discuss your care needs and help you find peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/request-caregiver')}
              className="w-full sm:w-auto bg-[#10A8B7] hover:bg-[#0da0ae] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all"
            >
              Request a Caregiver
            </button>
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fae53] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Chat With Us on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
