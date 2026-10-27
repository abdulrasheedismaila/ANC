import React from 'react';
import { useContent } from '../context/ContentContext';
import { HeartHandshake, MapPin, Mail, MessageCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useContent();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#053c46] text-white pt-16 pb-12 border-t border-[#10A8B7]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Emergency Medical Disclaimer Banner */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-[#075765]/80 border border-[#10A8B7]/30 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#C9A45C]" />
          </div>
          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            <strong className="text-white">Medical &amp; Emergency Notice:</strong> AFNAAN CARES Nurses &amp; Caregiver provides scheduled home care and nursing support. In cases of acute, life-threatening medical emergencies, please immediately visit the nearest hospital emergency centre or contact emergency medical ambulance services.
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Business Identity */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block max-w-[220px]">
              <ImageWithFallback
                src={settings.logoUrl}
                alt="AFNAAN CARES Nurses & Caregiver Logo"
                className="h-11 w-auto object-contain"
                fallbackText="AFNAAN CARES Nurses & Caregiver"
                fallbackIcon={<HeartHandshake className="w-6 h-6 text-[#075765]" />}
                fallbackClassName="h-10 text-[#075765] font-bold text-sm flex items-center"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              AFNAAN CARES Nurses &amp; Caregiver provides dependable, compassionate home care and nursing support designed around dignity, comfort, and peace of mind for families in Lagos, Nigeria.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C9A45C] font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Dedicated Care Professionals</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10A8B7]"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => handleLinkClick('/')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#10A8B7]" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/services')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#10A8B7]" />
                  <span>What We Do</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/request-caregiver')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5 font-medium text-white"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Request a Caregiver</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/impact')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#10A8B7]" />
                  <span>Our Impact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/careers')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#10A8B7]" />
                  <span>Become a Caregiver</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/contact')}
                  className="hover:text-[#10A8B7] transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#10A8B7]" />
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & WhatsApp */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              Direct Support &amp; WhatsApp
            </h4>
            <div className="space-y-4 text-sm text-gray-300">
              {/* WhatsApp Bubble Card in Footer (clean, non-illuminated) */}
              <a
                href={settings.whatsappUrl || 'https://wa.me/2349162285884'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 bg-white/10 hover:bg-white/15 text-white p-3.5 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-white/20 group backdrop-blur-xs"
              >
                <div className="relative w-12 h-12 rounded-full bg-linear-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shrink-0 border-2 border-white shadow-md overflow-hidden">
                  <span className="absolute top-1 left-1.5 w-3 h-1 rounded-full bg-white/60 blur-[0.4px] rotate-[-25deg] pointer-events-none"></span>
                  <MessageCircle className="w-5 h-5 fill-current text-white relative z-10" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#25D366] block">
                    Chat on WhatsApp
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {settings.whatsappDisplay || '+234 916 228 5884'}
                  </span>
                  <span className="text-[10px] text-gray-300 block">
                    Tap to chat with Lagos team
                  </span>
                </div>
              </a>

              {/* Direct Email with Clean Bubble Ball */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={`mailto:${settings.contactEmail || 'abooafnaan28@gmail.com'}?subject=Enquiry%20About%20AFNAAN%20CARES%20Nurses%20%26%20Caregiver`}
                  className="relative w-9 h-9 rounded-full bg-linear-to-br from-[#10A8B7] to-[#075765] text-white flex items-center justify-center shrink-0 border border-white shadow-md overflow-hidden"
                  title="Send Email"
                >
                  <span className="absolute top-0.5 left-1 w-2 h-0.5 rounded-full bg-white/60 blur-[0.3px] rotate-[-25deg] pointer-events-none"></span>
                  <Mail className="w-4 h-4 text-white relative z-10" />
                </a>
                <a
                  href={`mailto:${settings.contactEmail || 'abooafnaan28@gmail.com'}?subject=Enquiry%20About%20AFNAAN%20CARES%20Nurses%20%26%20Caregiver`}
                  className="hover:text-white underline decoration-white/30 transition-colors text-xs sm:text-sm font-medium"
                >
                  {settings.contactEmail || 'abooafnaan28@gmail.com'}
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#10A8B7] shrink-0 mt-0.5" />
                <span className="leading-snug text-xs sm:text-sm">
                  {settings.businessAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Policies & CEO Note */}
          <div>
            <h4 className="text-white font-bold text-base tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A45C]"></span>
              Policies &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300 mb-6">
              <li>
                <button
                  onClick={() => handleLinkClick('/privacy')}
                  className="hover:text-[#10A8B7] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/terms')}
                  className="hover:text-[#10A8B7] transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/accessibility')}
                  className="hover:text-[#10A8B7] transition-colors"
                >
                  Accessibility Statement
                </button>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <p className="font-semibold text-white">Leadership:</p>
              <p className="text-gray-300 mt-0.5">{settings.ceoName}</p>
              <p className="text-[11px] text-[#C9A45C]">{settings.ceoTitle}</p>
            </div>
          </div>
        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {currentYear} {settings.businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-gray-400">
            <span>Rooted in care &bull; Operating in Lagos, Nigeria</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
