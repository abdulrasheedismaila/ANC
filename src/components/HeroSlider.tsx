import React, { useState, useEffect } from 'react';

const SLIDE_IMAGES = [
  'https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg',
  'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
  'https://i.ibb.co/7Jg5BngR/Gemini-Generated-Image-3qtj7q3qtj7q3qtj.jpg',
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  // Preload all 3 images so there is zero flickering
  useEffect(() => {
    SLIDE_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Automatic smooth transition every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none -z-0">
      {SLIDE_IMAGES.map((imgSrc, idx) => {
        const isCurrent = idx === currentIndex;
        const isPrev = idx === prevIndex;

        // Position & animation calculation:
        // isCurrent: translates to 0%
        // isPrev: translates to -100% (moving left smoothly)
        // others: wait at +100% (ready to slide in from right)
        let transformClass = 'translate-x-full opacity-0 pointer-events-none';
        let transitionClass = 'transition-all duration-1000 ease-in-out';

        if (isCurrent) {
          transformClass = 'translate-x-0 opacity-100 z-10';
        } else if (isPrev) {
          transformClass = '-translate-x-full opacity-90 z-0';
        }

        return (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full ${transformClass} ${transitionClass}`}
          >
            <img
              src={imgSrc}
              alt={`AFNAAN Healthcare Caregiver Slide ${idx + 1}`}
              className="w-full h-full object-cover object-center scale-105 transform transition-transform duration-7000 ease-linear"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Subtle Dark Overlay to keep text perfectly legible while showcasing the images */}
      <div className="absolute inset-0 z-20 bg-linear-to-r from-[#042d34]/92 via-[#075765]/85 to-[#075765]/70 backdrop-brightness-95"></div>
      <div className="absolute inset-0 z-20 bg-black/35"></div>

      {/* Subtle Slide Indicators at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto">
        {SLIDE_IMAGES.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => {
              setPrevIndex(currentIndex);
              setCurrentIndex(dotIdx);
            }}
            aria-label={`Jump to hero slide ${dotIdx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              dotIdx === currentIndex
                ? 'w-8 bg-[#C9A45C]'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
