import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { Menu, X, HeartHandshake, Mail, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { settings } = useContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'What We Do', path: '/services' },
    { label: 'Request a Caregiver', path: '/request-caregiver' },
    { label: 'Our Impact', path: '/impact' },
    { label: 'Become a Caregiver', path: '/careers' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5'
            : 'bg-white shadow-xs py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            aria-label="AFNAAN CARES Nurses & Caregiver Home"
          >
            <div className="h-12 w-auto max-w-[210px] flex items-center justify-center">
              <ImageWithFallback
                src={settings.logoUrl}
                alt="AFNAAN CARES Nurses & Caregiver Logo"
                className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                fallbackText="AFNAAN CARES Nurses & Caregiver"
                fallbackIcon={<HeartHandshake className="w-6 h-6 text-[#075765]" />}
                fallbackClassName="h-12 px-3 py-1 bg-[#F3F8F9] border border-[#10A8B7]/30 rounded text-[#075765] font-bold text-sm tracking-tight flex items-center"
              />
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#075765] bg-[#F3F8F9] font-bold shadow-xs'
                      : 'text-[#202A30] hover:text-[#075765] hover:bg-[#F3F8F9]/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleLinkClick('/request-caregiver')}
              className="bg-linear-to-r from-[#075765] to-[#10A8B7] hover:from-[#05434e] hover:to-[#0d8f9c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-[#C9A45C]" />
              <span>Request a Caregiver</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleLinkClick('/request-caregiver')}
              className="text-xs bg-[#075765] text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Request Care
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#075765] hover:bg-[#F3F8F9] rounded-lg focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className={`text-left px-4 py-3 rounded-lg text-base font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#F3F8F9] text-[#075765] font-bold'
                        : 'text-[#202A30] hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#10A8B7]"></span>}
                  </button>
                );
              })}
              <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2.5">
                <button
                  onClick={() => handleLinkClick('/request-caregiver')}
                  className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-3 rounded-xl font-bold text-center shadow-md flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-5 h-5 text-[#C9A45C]" />
                  <span>Request a Caregiver</span>
                </button>
                <div className="flex items-center justify-center gap-4 pt-1">
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#25D366] flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                  <span className="text-gray-300">&bull;</span>
                  <a
                    href={`mailto:${settings.contactEmail}?subject=Enquiry%20About%20AFNAAN%20Nurses%20%26%20Caregiver`}
                    className="text-xs font-bold text-[#075765] flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
