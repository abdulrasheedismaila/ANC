import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, ServiceItem, GalleryItem, TestimonialItem } from '../types';

interface ContentContextType {
  settings: WebsiteSettings;
  services: ServiceItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  updateSettingsLocally: (newSettings: Partial<WebsiteSettings>) => void;
}

const defaultInitialSettings: WebsiteSettings = {
  businessName: 'AFNAAN Nurses & Caregiver',
  logoUrl: 'https://i.ibb.co/rKN0fndw/20261023-174736.png',
  ceoName: 'IMRAN MUTOLIB ADEIZA',
  ceoTitle: 'Chief Executive Officer & Founder',
  ceoBio: `IMRAN MUTOLIB ADEIZA leads AFNAAN Nurses & Caregiver with a focus on compassionate service, professionalism, and the importance of treating every individual with dignity and respect.

His vision for AFNAAN is to build a care service that listens to families, values dedicated care professionals, and places people's wellbeing at the centre of every care arrangement.

Through AFNAAN, he aims to encourage a culture of empathy, responsibility, trust, and continuous improvement in caregiving.`,
  ceoImageUrl: 'https://i.ibb.co/xSSVrxWH/Whats-App-Image-2026-10-23-at-5-31-39-PM.jpg',
  contactEmail: 'abooafnaan28@gmail.com',
  whatsappUrl: 'https://wa.me/2349162285884',
  whatsappDisplay: '+234 916 228 5884',
  businessAddress: 'No 7 Old Ota Road, Orile Bus Stop, Orile Agege, Lagos, Nigeria.',
  heroHeadline: `Compassionate Care.
Professional Support.
Peace of Mind.`,
  heroSubtext: 'At AFNAAN Nurses & Caregiver, we believe everyone deserves compassionate, respectful, and dependable care. We connect individuals and families with dedicated care professionals who put dignity, comfort, and wellbeing first.',
  trustStatement: 'Care that puts people first.',
  seoTitle: 'AFNAAN Nurses & Caregiver | Professional Home Care & Nursing Support in Lagos',
  seoDescription: 'Find compassionate, qualified caregivers, elderly care, and nursing support in Lagos, Nigeria. AFNAAN Nurses & Caregiver delivers dignity and comfort right at home.',
  privacyPolicy: '',
  termsOfService: '',
  accessibilityStatement: '',
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultInitialSettings);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const [settingsRes, servicesRes, galleryRes, testimonialsRes] = await Promise.all([
        fetch('/api/public/settings'),
        fetch('/api/public/services'),
        fetch('/api/public/gallery'),
        fetch('/api/public/testimonials'),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) setSettings(sData.settings);
      }
      if (servicesRes.ok) {
        const sData = await servicesRes.json();
        if (sData.services) setServices(sData.services);
      }
      if (galleryRes.ok) {
        const gData = await galleryRes.json();
        if (gData.items) setGallery(gData.items);
      }
      if (testimonialsRes.ok) {
        const tData = await testimonialsRes.json();
        if (tData.testimonials) setTestimonials(tData.testimonials);
      }
    } catch (err) {
      console.warn('Could not fetch live content, falling back to defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const refreshContent = async () => {
    await fetchContent();
  };

  const updateSettingsLocally = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ContentContext.Provider
      value={{
        settings,
        services,
        gallery,
        testimonials,
        isLoading,
        refreshContent,
        updateSettingsLocally,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
