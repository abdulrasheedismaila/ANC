import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { GalleryItem } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { parseVideoUrl } from '../utils/mediaUtils';
import {
  Heart,
  MapPin,
  Calendar,
  X,
  Play,
  Film,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter
} from 'lucide-react';

interface ImpactPageProps {
  onNavigate: (path: string) => void;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ onNavigate }) => {
  const { gallery } = useContent();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = [
    'All',
    'Care in Action',
    'Our Team',
    'Training and Development',
    'Community Engagement',
    'Company News',
    'Client Stories',
  ];

  const filteredItems = gallery.filter((item) => {
    if (!item.isPublished) return false;
    if (selectedCategory === 'All') return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#075765] text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#10A8B7]/30 text-[#C9A45C] text-xs font-bold uppercase tracking-wider">
            Our Healthcare Journey
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Our Impact
          </h1>
          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Stories, People, and Moments That Reflect Our Commitment to Care
          </p>
        </div>
      </section>

      {/* Main Gallery Area */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#075765] text-white shadow-md'
                    : 'bg-[#F3F8F9] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-[#F3F8F9] rounded-3xl p-8 border border-gray-100">
            <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#075765]">No media found in this category</h3>
            <p className="text-gray-500 text-sm mt-1">
              Check back soon as our team regularly uploads new stories and training updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-gray-900">
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
                              <Film className="w-10 h-10 text-[#C9A45C] mb-2" />
                              <span className="text-white text-xs font-semibold line-clamp-1">{item.title}</span>
                              <span className="text-gray-300 text-[10px] mt-0.5 capitalize">{videoInfo.platform} Video</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-white/95 text-[#075765] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-[#075765] ml-0.5" />
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

                  <div className="absolute top-3 left-3 bg-[#075765]/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {item.category}
                  </div>
                  {item.mediaType === 'video' && (
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Film className="w-3 h-3 text-[#C9A45C]" />
                      <span className="capitalize">{parseVideoUrl(item.mediaUrl).platform === 'youtube' ? 'YouTube' : parseVideoUrl(item.mediaUrl).platform === 'googledrive' ? 'Google Drive' : 'Video'}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-[#075765] text-lg group-hover:text-[#10A8B7] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1.5 leading-relaxed line-clamp-2">
                      {item.caption || item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-[#075765] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#10A8B7]" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox / Media Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Content */}
            <div className="relative bg-black flex items-center justify-center min-h-[280px] max-h-[60vh] overflow-hidden">
              {activeItem.mediaType === 'video' ? (
                (() => {
                  const videoInfo = parseVideoUrl(activeItem.mediaUrl);
                  if (videoInfo.platform === 'youtube' || videoInfo.platform === 'googledrive') {
                    return (
                      <div className="w-full aspect-video min-h-[300px] max-h-[60vh] bg-black">
                        <iframe
                          src={videoInfo.embedUrl}
                          title={activeItem.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <video
                      src={activeItem.mediaUrl}
                      controls
                      autoPlay
                      className="w-full max-h-[60vh] object-contain"
                    />
                  );
                })()
              ) : (
                <ImageWithFallback
                  src={activeItem.mediaUrl}
                  alt={activeItem.title}
                  className="w-full max-h-[60vh] object-contain"
                  fallbackText={activeItem.title}
                />
              )}
            </div>

            {/* Details Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-3">
              <div className="flex items-center gap-3">
                <span className="bg-[#075765]/10 text-[#075765] text-xs font-bold px-3 py-1 rounded-full">
                  {activeItem.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#10A8B7]" />
                  {activeItem.location}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeItem.date}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#075765]">{activeItem.title}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{activeItem.caption}</p>
              {activeItem.description && activeItem.description !== activeItem.caption && (
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed border-t border-gray-100 pt-3">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <section className="py-14 bg-[#F3F8F9] text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#075765]">
            Experience Care Delivered With Genuine Humanity
          </h2>
          <p className="text-gray-600 text-sm">
            Contact our Lagos team to arrange personalized home care or nursing support.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/request-caregiver')}
              className="bg-[#075765] hover:bg-[#05434e] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Request a Caregiver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
