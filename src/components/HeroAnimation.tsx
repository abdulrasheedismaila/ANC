import React from 'react';
import { ShieldCheck, Heart, Sparkles, HeartHandshake } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export const HeroAnimation: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none overflow-visible">
      {/* Background Soft Glows */}
      <div className="absolute w-[80%] h-[80%] rounded-full bg-linear-to-tr from-[#10A8B7]/30 to-[#C9A45C]/25 blur-3xl pointer-events-none -z-10"></div>
      
      {/* Outer Orbital Ring */}
      <div className="absolute w-[94%] h-[94%] rounded-full border-2 border-dashed border-[#10A8B7]/40 pointer-events-none"></div>
      
      {/* Inner Orbital Ring */}
      <div className="absolute w-[68%] h-[68%] rounded-full border border-[#C9A45C]/40 pointer-events-none"></div>

      {/* Decorative Floating Dots / Sparkles */}
      <div className="absolute top-4 left-10 w-3 h-3 rounded-full bg-[#C9A45C] opacity-85 animate-ping"></div>
      <div className="absolute bottom-12 right-6 w-2.5 h-2.5 rounded-full bg-[#10A8B7] opacity-90 animate-pulse"></div>
      <div className="absolute top-1/3 -right-2 w-2 h-2 rounded-full bg-white/70"></div>
      <div className="absolute bottom-1/4 -left-3 w-2 h-2 rounded-full bg-[#C9A45C]/90"></div>

      {/* Central Anchor: Business Logo */}
      <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full p-2.5 bg-linear-to-b from-[#10A8B7] via-white to-[#075765] shadow-2xl animate-gentle-float">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl relative group bg-white flex items-center justify-center p-3 sm:p-5">
          <ImageWithFallback
            src="https://i.ibb.co/rKN0fndw/20261023-174736.png"
            alt="AFNAAN CARES Nurses & Caregiver Official Logo"
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
            fallbackText="AFNAAN CARES Nurses & Caregiver"
            fallbackIcon={<HeartHandshake className="w-10 h-10 text-[#075765]" />}
            fallbackClassName="w-full h-full flex flex-col items-center justify-center text-[#075765] font-extrabold text-xs text-center p-2"
          />
          {/* Bottom badge */}
          <div className="absolute inset-x-0 bottom-0 h-9 bg-linear-to-t from-[#075765] to-transparent flex items-end justify-center pb-1.5">
            <span className="text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#075765]/90 backdrop-blur-xs">
              AFNAAN CARES
            </span>
          </div>
        </div>
        
        {/* Heart Floating Badge */}
        <div className="absolute -bottom-2 -right-1 bg-white text-[#075765] p-2.5 rounded-2xl shadow-xl border border-[#10A8B7]/40 flex items-center gap-1.5 animate-bounce">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-xs font-bold text-[#075765]">Dignified Care</span>
        </div>
      </div>

      {/* Orbiting Satellite Nodes: Authentic Nigerian / Black Complexion Images */}
      <div className="absolute inset-0 animate-orbit-slow pointer-events-none">
        {/* Node at Top (0 deg): Elderly Care - Nigerian Senior & Caregiver */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 pointer-events-auto">
          <div className="animate-counter-orbit-slow">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-white shadow-xl border-2 border-[#10A8B7] group hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/HDd37w0S/351da2ae-7b26-4e1b-a0cc-8d4c1ffe1a9c.jpg"
                  alt="Elderly Care Nigerian Senior"
                  className="w-full h-full object-cover object-center"
                  fallbackText="Elderly Care"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 text-center">
                <span className="text-[10px] font-bold bg-[#075765] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  Elderly Care
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Node at Right (90 deg): Personal Care - Nigerian Female Caregiver */}
        <div className="absolute top-1/2 right-0 translate-x-3 -translate-y-1/2 pointer-events-auto">
          <div className="animate-counter-orbit-slow">
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1.5 bg-white shadow-xl border-2 border-[#C9A45C] group hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/zThxr8Hn/d72623f9-c5cb-47e9-8d04-5d9a7fac1191.jpg"
                  alt="Personal Care Assistant"
                  className="w-full h-full object-cover object-top"
                  fallbackText="Personal Care"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 text-center">
                <span className="text-[10px] font-bold bg-[#C9A45C] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  Gentle Care
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Node at Bottom (180 deg): Recovery Support (Fixed - now displays verified Nigerian recovery image) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 pointer-events-auto">
          <div className="animate-counter-orbit-slow">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-white shadow-xl border-2 border-[#075765] group hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg"
                  alt="Recovery and Respite Support"
                  className="w-full h-full object-cover object-center"
                  fallbackText="Recovery Support"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 text-center">
                <span className="text-[10px] font-bold bg-[#075765] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  Recovery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Node at Left (270 deg): Family Care Support - Nigerian Family Support */}
        <div className="absolute top-1/2 left-0 -translate-x-3 -translate-y-1/2 pointer-events-auto">
          <div className="animate-counter-orbit-slow">
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1.5 bg-white shadow-xl border-2 border-[#10A8B7] group hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src="https://i.ibb.co/RWMfDcL/4aa36139-2402-428d-a4e1-70be11835a38.jpg"
                  alt="Family Care Leadership & Coordination"
                  className="w-full h-full object-cover object-top"
                  fallbackText="Family Care"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 text-center">
                <span className="text-[10px] font-bold bg-[#10A8B7] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  Family Trust
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Trust Badge on Top Left */}
      <div className="absolute -top-4 -left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#075765]/10 flex items-center justify-center text-[#075765]">
          <ShieldCheck className="w-5 h-5 text-[#075765]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#075765] leading-tight">Verified Care Team</p>
          <p className="text-[10px] text-gray-500">Lagos, Nigeria</p>
        </div>
      </div>
    </div>
  );
};
