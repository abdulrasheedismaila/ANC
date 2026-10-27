import React, { useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';

interface FloatingContactsProps {
  onNavigate?: (path: string) => void;
}

export const FloatingContacts: React.FC<FloatingContactsProps> = ({ onNavigate }) => {
  const { settings } = useContent();
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);

  const whatsappUrl = settings.whatsappUrl || 'https://wa.me/2349162285884';
  const emailUrl = `mailto:${settings.contactEmail || 'abooafnaan28@gmail.com'}?subject=Enquiry%20About%20AFNAAN%20CARES%20Nurses%20%26%20Caregiver`;

  return (
    <>
      {/* Floating Normal Size Bubble Balls (Bottom Right) */}
      <aside
        aria-label="Quick contact links"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-auto"
      >
        {/* WhatsApp Bubble Ball (Clean normal-size 52px orb without neon light) */}
        <div className="relative flex items-center group">
          <div
            className={`mr-3 bg-[#075765] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap transition-opacity duration-200 border border-white/20 ${
              showWhatsAppTooltip ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100 pointer-events-none'
            }`}
          >
            Chat on WhatsApp
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp (+234 916 228 5884)"
            onMouseEnter={() => setShowWhatsAppTooltip(true)}
            onMouseLeave={() => setShowWhatsAppTooltip(false)}
            onFocus={() => setShowWhatsAppTooltip(true)}
            onBlur={() => setShowWhatsAppTooltip(false)}
            style={{ width: '52px', height: '52px' }}
            className="relative w-[52px] h-[52px] rounded-full bg-linear-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center border-2 border-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer shrink-0 transition-transform duration-200 transform hover:scale-105 active:scale-95 overflow-hidden select-none"
            title="WhatsApp: +234 916 228 5884"
          >
            {/* 3D Bubble Soft Specular Highlight Reflection */}
            <span className="absolute top-1.5 left-2 w-3.5 h-1.5 rounded-full bg-white/60 blur-[0.4px] rotate-[-25deg] pointer-events-none"></span>
            <span className="absolute bottom-1 right-2 w-2 h-1 rounded-full bg-white/20 blur-[0.6px] pointer-events-none"></span>
            
            {/* WhatsApp Icon */}
            <MessageCircle className="w-6 h-6 fill-current text-white relative z-10 drop-shadow-xs" />
          </a>
        </div>

        {/* Email Bubble Ball (Clean normal-size 52px orb without neon light) */}
        <div className="relative flex items-center group">
          <div
            className={`mr-3 bg-[#075765] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap transition-opacity duration-200 border border-white/20 ${
              showEmailTooltip ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100 pointer-events-none'
            }`}
          >
            Send Email
          </div>

          <a
            href={emailUrl}
            aria-label="Send direct email (abooafnaan28@gmail.com)"
            onMouseEnter={() => setShowEmailTooltip(true)}
            onMouseLeave={() => setShowEmailTooltip(false)}
            onFocus={() => setShowEmailTooltip(true)}
            onBlur={() => setShowEmailTooltip(false)}
            style={{ width: '52px', height: '52px' }}
            className="relative w-[52px] h-[52px] rounded-full bg-linear-to-br from-[#10A8B7] to-[#075765] text-white flex items-center justify-center border-2 border-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#10A8B7]/40 cursor-pointer shrink-0 transition-transform duration-200 transform hover:scale-105 active:scale-95 overflow-hidden select-none"
            title="Send Email: abooafnaan28@gmail.com"
          >
            {/* 3D Bubble Soft Specular Highlight Reflection */}
            <span className="absolute top-1.5 left-2 w-3.5 h-1.5 rounded-full bg-white/60 blur-[0.4px] rotate-[-25deg] pointer-events-none"></span>
            <span className="absolute bottom-1 right-2 w-2 h-1 rounded-full bg-white/20 blur-[0.6px] pointer-events-none"></span>

            {/* Email Icon */}
            <Mail className="w-5 h-5 text-white relative z-10 drop-shadow-xs" />
          </a>
        </div>
      </aside>
    </>
  );
};

