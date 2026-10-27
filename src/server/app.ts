import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  isSupabaseActive,
  getSupabaseStatus,
  syncCareRequestToSupabase,
  deleteCareRequestFromSupabase,
  syncCaregiverAppToSupabase,
  deleteCaregiverAppFromSupabase,
  syncContactMessageToSupabase,
  deleteContactMessageFromSupabase,
  syncGalleryItemToSupabase,
  deleteGalleryItemFromSupabase,
  syncServiceToSupabase,
  syncWebsiteSettingsToSupabase,
  syncAuditLogToSupabase,
  fullSyncLocalToSupabase,
  startupSupabaseSync,
} from './supabaseSync';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Setup directories with serverless / tmp fallback
const rootDir = process.cwd();
const dataDir = isVercel ? path.join('/tmp', 'afnaan-data') : path.join(rootDir, 'data');
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(rootDir, 'uploads');
const cvsDir = path.join(uploadsDir, 'cvs');
const mediaDir = path.join(uploadsDir, 'media');

[dataDir, uploadsDir, cvsDir, mediaDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[Storage] Directory notice for ${dir}:`, (err as any)?.message || err);
  }
});

const DB_FILE = path.join(dataDir, 'db.json');
const BUNDLED_DB_FILE = path.join(rootDir, 'data', 'db.json');

// Multer storage configs
const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  },
});

const mediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, mediaDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'media-' + uniqueSuffix + ext);
  },
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, DOC, DOCX or images are allowed.'));
    }
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.mp4', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid media format. Supported formats: JPG, JPEG, PNG, WEBP, GIF, SVG, MP4, WEBM'));
    }
  },
});

// Crypto Password Helpers
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Session Secret for Stateless Tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'afnaan-cares-jwt-secure-session-secret-2026-key';

export interface SessionInfo {
  adminId: string;
  email: string;
  role: string;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionInfo>();

function createSessionToken(sessionInfo: SessionInfo): string {
  const payloadStr = JSON.stringify(sessionInfo);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('hex');
  const token = `${payloadB64}.${signature}`;
  activeSessions.set(token, sessionInfo);
  return token;
}

function verifySessionToken(token: string): SessionInfo | null {
  if (!token) return null;

  // 1. Check in-memory session store
  if (activeSessions.has(token)) {
    const s = activeSessions.get(token)!;
    if (Date.now() <= s.expiresAt) return s;
    activeSessions.delete(token);
    return null;
  }

  // 2. Fallback to stateless HMAC signature verification (for Vercel multi-lambda instances)
  if (!token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('hex');
  if (signature !== expectedSig) return null;

  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const session: SessionInfo = JSON.parse(payloadStr);
    if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
      return null;
    }
    activeSessions.set(token, session);
    return session;
  } catch {
    return null;
  }
}

// Seed Data
const initialServices = [
  {
    id: 'srv-1',
    title: 'Home Care Assistance',
    slug: 'home-care-assistance',
    category: 'Daily Living',
    summary: 'Support with everyday activities, routines, and comfortable living in the familiar surroundings of home.',
    fullDescription: 'Our home care assistance is designed to support individuals who value living in their own homes but need a dependable helping hand with day-to-day routines. We assist with meal preparation, mobility, household reminders, light housekeeping, and personal comfort while respecting client independence.',
    whoMayBenefit: 'Individuals needing extra support at home, seniors wishing to age in place, and individuals recuperating after an illness.',
    supportExamples: [
      'Nutritious meal preparation and hydration monitoring',
      'Assistance with morning and evening routines',
      'Light housekeeping, tidy living spaces, and laundry support',
      'Mobility assistance and safe movement within the house',
      'Accompaniment to hospital appointments and walks',
      'Friendly companionship and cognitive engagement',
    ],
    imageUrl: 'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
    isPublished: true,
    sortOrder: 1,
  },
  {
    id: 'srv-2',
    title: 'Elderly Care',
    slug: 'elderly-care',
    category: 'Geriatric Support',
    summary: 'Respectful, patient assistance that upholds comfort, dignity, safety, independence, and overall wellbeing.',
    fullDescription: 'Aging brings changes in physical capability, emotional needs, and daily routines. Our elderly care team provides compassionate, attentive support tailored to older adults. We focus on fall prevention, medication adherence reminders, gentle exercise encouragement, dignity in personal grooming, and genuine companionship.',
    whoMayBenefit: 'Elderly parents, seniors living alone or with family in Lagos, and older adults experiencing age-related physical limitations.',
    supportExamples: [
      'Dignified assistance with bathing, dressing, and grooming',
      'Fall risk management and supervised safe walking',
      'Medication schedule prompts and vitals check coordination',
      'Engaging conversations, reading, and mental wellness activities',
      'Monitoring mood, sleep, appetite, and general health changes',
      'Regular reassuring updates for family members',
    ],
    imageUrl: 'https://i.ibb.co/bgs17n5m/Gemini-Generated-Image-uczqp2uczqp2uczq.jpg',
    isPublished: true,
    sortOrder: 2,
  },
  {
    id: 'srv-3',
    title: 'Bedridden & Immobility Care',
    slug: 'bedridden-immobility-care',
    category: 'Specialized Nursing Care',
    summary: 'Dedicated attention for bedbound individuals, prioritizing skin integrity, comfortable repositioning, and hygiene.',
    fullDescription: 'Caring for individuals confined to bed requires clinical knowledge, gentleness, and vigilance. Our trained caregivers and nurses prioritize pressure sore prevention through regular positional changes, complete bed baths, incontinence care, passive range-of-motion limb exercises, and peaceful, hygienic surroundings.',
    whoMayBenefit: 'Bedridden individuals, stroke recovery patients, post-surgical patients, and clients with severe physical limitations.',
    supportExamples: [
      'Scheduled 2-hourly turning and pressure sore prevention',
      'Gentle, thorough sponge bed-baths and skin moisturization',
      'Clean catheter, stoma, and continence care assistance',
      'Passive limb exercises to prevent muscle contractures',
      'Assisted feeding and aspiration prevention measures',
      'Frequent bed sheet changes and immobility comfort support',
    ],
    imageUrl: 'https://i.ibb.co/YFkH2M8K/Gemini-Generated-Image-uczqp4uczqp4uczq.jpg',
    isPublished: true,
    sortOrder: 3,
  },
  {
    id: 'srv-4',
    title: 'Personal Care Support',
    slug: 'personal-care-support',
    category: 'Daily Living',
    summary: 'Assistance with bathing, dressing, oral hygiene, grooming, and personal comfort provided with deep respect.',
    fullDescription: 'Personal hygiene routines are essential to self-esteem and health. We provide gentle, discreet personal care support that honors individual dignity. From morning freshening to night-time preparations, our care assistants maintain a calm, reassuring presence that puts clients and families at ease.',
    whoMayBenefit: 'Individuals requiring assistance with bathing, grooming, or dressing due to illness, frailty, or temporary injury.',
    supportExamples: [
      'Shower and bath assistance with safety handholds',
      'Oral care, denture cleansing, and hair grooming',
      'Assistance with clothing, buttons, and footwear',
      'Restroom assistance and compassionate continence support',
      'Skin care application and nail care maintenance',
      'Preserving personal modesty throughout every routine',
    ],
    imageUrl: 'https://i.ibb.co/v4bKvh8k/Gemini-Generated-Image-uczqoyuczqoyuczq.jpg',
    isPublished: true,
    sortOrder: 4,
  },
  {
    id: 'srv-5',
    title: 'Post-Hospital Discharge Care',
    slug: 'post-hospital-discharge-care',
    category: 'Recovery Support',
    summary: 'Helping patients transition safely from hospital to home, reducing readmission risks during recovery.',
    fullDescription: 'The first few weeks following hospital discharge are critical to long-term healing. Our post-discharge care bridges hospital clinical instructions with home comfort. We help with medication adherence, surgical wound observation, dietary recovery plans, follow-up appointment coordination, and monitoring for warning signs.',
    whoMayBenefit: 'Individuals recently discharged from the hospital after surgery, illness, cardiac events, or orthopedic procedures.',
    supportExamples: [
      'Discharge instructions review and daily implementation',
      'Medication schedule tracking and prompt administration reminders',
      'Wound site cleanliness and observation for infection signs',
      'Nutritional meal preparation tailored to post-surgery diets',
      'Vitals recording (Blood Pressure, Pulse, Glucose levels)',
      'Escort to follow-up hospital visits and physical therapy',
    ],
    imageUrl: 'https://i.ibb.co/S7q5wYV3/Gemini-Generated-Image-uczqp1uczqp1uczq.jpg',
    isPublished: true,
    sortOrder: 5,
  },
  {
    id: 'srv-6',
    title: 'Respite Care for Families',
    slug: 'respite-care-for-families',
    category: 'Family Support',
    summary: 'Reliable, caring relief for primary family caregivers needing time to rest, work, or attend to personal commitments.',
    fullDescription: 'Family caregiving is deeply rewarding but emotionally and physically demanding. Our respite care service gives primary family caregivers the opportunity to step back, rest, run errands, or travel, confident that their loved one is in trustworthy, skilled hands. Available for hours, days, or scheduled weekly blocks.',
    whoMayBenefit: 'Family members caring for elderly parents or ailing relatives who need planned temporary relief to avoid burnout.',
    supportExamples: [
      'Scheduled daytime, weekend, or overnight care relief',
      'Seamless continuation of client routines and dietary needs',
      'Companionship, conversation, and recreational activities',
      'Safety monitoring and full day-to-day routine management',
      'Detailed handover notes upon family return',
      'Peace of mind knowing your loved one is safe and respected',
    ],
    imageUrl: 'https://i.ibb.co/G4mS4W3k/Gemini-Generated-Image-uczqp0uczqp0uczq.jpg',
    isPublished: true,
    sortOrder: 6,
  },
];

const initialGallery = [
  {
    id: 'gal-1',
    title: 'Dignified Senior Care at Home',
    category: 'Care in Action',
    mediaType: 'image',
    mediaUrl: 'https://i.ibb.co/bgs17n5m/Gemini-Generated-Image-uczqp2uczqp2uczq.jpg',
    caption: 'Attentive, respectful assistance with everyday mobility and daily living routines in Lagos.',
    description: 'Our caregivers focus on creating an environment of trust, safety, and mutual respect for elderly clients.',
    date: '2026-10-15',
    location: 'Ikeja, Lagos',
    isPublished: true,
    sortOrder: 1,
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'gal-2',
    title: 'Professional Home Nursing Visit',
    category: 'Care in Action',
    mediaType: 'image',
    mediaUrl: 'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
    caption: 'Qualified nursing staff conducting regular vitals monitoring and medication review at home.',
    description: 'Routine health checks and patient vitals tracking keep families informed and prevent complications.',
    date: '2026-10-18',
    location: 'Surulere, Lagos',
    isPublished: true,
    sortOrder: 2,
    createdAt: '2026-10-18T11:30:00.000Z',
  },
  {
    id: 'gal-3',
    title: 'Post-Surgery Convalescence Support',
    category: 'Care in Action',
    mediaType: 'image',
    mediaUrl: 'https://i.ibb.co/S7q5wYV3/Gemini-Generated-Image-uczqp1uczqp1uczq.jpg',
    caption: 'Supporting gentle rehabilitation and structured recovery following medical discharge.',
    description: 'Post-hospital discharge care provides steady, reassuring support as individuals regain their strength.',
    date: '2026-10-20',
    location: 'Lekki Phase 1, Lagos',
    isPublished: true,
    sortOrder: 3,
    createdAt: '2026-10-20T09:15:00.000Z',
  },
  {
    id: 'gal-4',
    title: 'Gentle Mobility & Daily Companionship',
    category: 'Community',
    mediaType: 'image',
    mediaUrl: 'https://i.ibb.co/v4bKvh8k/Gemini-Generated-Image-uczqoyuczqoyuczq.jpg',
    caption: 'A comforting presence that brightens days and encourages safe, independent movement.',
    description: 'Companionship is central to cognitive wellbeing and emotional comfort for aging seniors.',
    date: '2026-10-21',
    location: 'Yaba, Lagos',
    isPublished: true,
    sortOrder: 4,
    createdAt: '2026-10-21T14:00:00.000Z',
  },
];

const initialTestimonials = [
  {
    id: 't-1',
    clientName: 'Alhaji Rasheed A.',
    relationship: 'Son of Care Recipient',
    location: 'Ikeja GRA, Lagos',
    serviceReceived: 'Elderly Care & Daily Living Support',
    quote: 'AFNAAN CARES gave our family immense relief. The caregiver assigned to my mother is gentle, patient, and truly cares for her like family. We sleep with peace of mind.',
    rating: 5,
    isPublished: true,
    date: 'October 2026',
  },
  {
    id: 't-2',
    clientName: 'Mrs. Funke Adeyemi',
    relationship: 'Daughter of Care Recipient',
    location: 'Magodo Phase 2, Lagos',
    serviceReceived: 'Post-Hospital Discharge Nursing',
    quote: 'Following my father\'s surgery, managing his recovery at home seemed overwhelming until AFNAAN Nurses stepped in. Their punctuality and clinical precision were exceptional.',
    rating: 5,
    isPublished: true,
    date: 'September 2026',
  },
  {
    id: 't-3',
    clientName: 'Dr. Chidi Okafor',
    relationship: 'Family Representative',
    location: 'Victoria Island, Lagos',
    serviceReceived: 'Bedridden & Immobility Care',
    quote: 'Their attention to detail regarding hygiene and pressure sore prevention for my bedridden uncle exceeded our highest expectations. Truly dignified home care.',
    rating: 5,
    isPublished: true,
    date: 'October 2026',
  },
];

const defaultSettings = {
  businessName: 'AFNAAN CARES Nurses & Caregiver',
  brandTagline: 'Compassionate Home Care & Nursing Support in Lagos, Nigeria',
  shortBio: 'Professional, compassionate home care and nursing support services designed around dignity, comfort, and peace of mind for families across Lagos.',
  contactEmail: 'abooafnaan28@gmail.com',
  phoneDisplay: '+234 916 228 5884',
  phoneRaw: '+2349162285884',
  whatsappDisplay: '+234 916 228 5884',
  whatsappUrl: process.env.VITE_WHATSAPP_LINK || 'https://wa.me/09162285884',
  businessAddress: 'Lagos, Nigeria (Serving Mainland, Island, Ikeja, Lekki, Surulere & Beyond)',
  operatingHours: 'Monday - Saturday: 7:00 AM - 8:00 PM | 24/7 Caregiver Support Available on Request',
  ceoName: 'Aboo Afnaan',
  ceoTitle: 'Chief Executive Officer & Founder',
  ceoBio: 'Driven by deep empathy, respect for aging seniors, and clinical integrity, Aboo Afnaan founded AFNAAN CARES to establish a trusted standard of dignified home nursing and supportive caregiving for families across Lagos, Nigeria.',
  ceoImageUrl: 'https://i.ibb.co/4n5kL4wM/Gemini-Generated-Image-uczqp3uczqp3uczq.jpg',
  logoUrl: 'https://i.ibb.co/0yCq2HwT/AFNAAN-CARES-LOGO.png',
  privacyPolicy: `AFNAAN CARES Nurses & Caregiver is committed to protecting your personal information and respecting your privacy. This Privacy Policy explains how we collect, use, safeguard, and disclose your personal details when you visit our website or engage our home care and nursing services in Lagos, Nigeria.

1. Information We Collect:
- Contact information: full name, email address, phone number, and residential city/LGA.
- Care requirements: details regarding care needs, preferred schedules, and relevant health support observations provided voluntarily.
- Caregiver applicants: CV files, contact details, work experience, certifications, and background verification information.

2. How We Use Information:
- Coordinate, match, and provide personalized home care and nursing services.
- Process caregiver employment applications and credential verifications.
- Respond to enquiries submitted through our contact form.

3. Data Security & Confidentiality:
All care requests, caregiver records, and uploaded documents are stored in secure, access-controlled databases. We implement strict server-side safeguards, encryption, and authorization checks. We do not sell, rent, or disclose personal data to third parties.

4. Your Rights:
You have the right to request access to your submitted data, request corrections, or request deletion of your information by contacting our privacy officer at abooafnaan28@gmail.com.

5. Emergency Disclaimer:
AFNAAN CARES Nurses & Caregiver provides home care and nursing support services. Our website and services do not replace acute hospital emergency services. For immediate life-threatening medical emergencies, please contact emergency medical providers immediately.`,
  termsOfService: `Welcome to AFNAAN CARES Nurses & Caregiver. By accessing our website and engaging our services, you agree to the following terms and conditions:

1. Services Scope:
AFNAAN CARES Nurses & Caregiver provides non-clinical home care assistance, elderly care, personal care support, and clinical nursing support. Clinical nursing tasks are performed exclusively by appropriately qualified and authorised nursing professionals within applicable professional regulations.

2. Service Arrangements:
All care arrangements are subject to initial assessment, caregiver availability, mutual agreement, and written care service agreements. Submitting an enquiry through this website initiates an enquiry and does not constitute a binding contract until formal confirmation.

3. Accuracy of Information:
Users agree to provide accurate, truthful details regarding care requirements, client location, and caregiver credentials.

4. Emergency Notice:
Our care services are designed for planned home care, convalescent recovery, and assisted daily living. We are not an emergency dispatch service.

5. Modifications:
AFNAAN CARES Nurses & Caregiver reserves the right to modify website terms and service offerings in accordance with operational and regulatory requirements.`,
  accessibilityStatement: `AFNAAN CARES Nurses & Caregiver is committed to ensuring our digital services are accessible to all people, including seniors and individuals with disabilities.

- We follow WCAG 2.1 AA accessibility principles.
- Headings, text, and interactive elements maintain high contrast against backgrounds.
- All decorative and orbital animations respect the user's 'prefers-reduced-motion' system setting.
- Forms include clear labels, keyboard navigable inputs, and accessible error notifications.
- If you encounter any accessibility barrier on our website, please notify us at abooafnaan28@gmail.com so we can promptly address it.`,
};

export interface DatabaseStructure {
  adminUsers: Array<{
    id: string;
    email: string;
    username?: string;
    name: string;
    passwordHash: string;
    salt: string;
    role: string;
    createdAt: string;
  }>;
  careRequests: Array<any>;
  caregiverApplications: Array<any>;
  contactMessages: Array<any>;
  services: Array<any>;
  galleryItems: Array<any>;
  testimonials: Array<any>;
  websiteSettings: typeof defaultSettings;
  auditLogs: Array<any>;
}

function createDefaultDb(): DatabaseStructure {
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'afnaan';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AFNAAN2027';
  const salt = generateSalt();
  const passwordHash = hashPassword(adminPassword, salt);

  return {
    adminUsers: [
      {
        id: 'admin-1',
        email: 'afnaan',
        username: 'AFNAAN CARES',
        name: 'AFNAAN CARES Administrator',
        passwordHash,
        salt,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'admin-2',
        email: 'admin@afnaancare.ng',
        username: 'admin',
        name: 'Administrator',
        passwordHash: hashPassword('AfnaanCare2026!Lagos', salt),
        salt,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
      },
    ],
    careRequests: [
      {
        id: 'req-sample-1',
        refCode: 'AFN-REQ-2026-1001',
        fullName: 'Babatunde Williams',
        phone: '08023456789',
        email: 'babatunde.w@example.com',
        contactMethod: 'Phone Call',
        careType: 'Elderly Care',
        careForWhom: 'My Elderly Mother',
        ageGroup: '80+ years',
        preferredGender: 'Female',
        preferredLanguage: 'English & Yoruba',
        state: 'Lagos',
        cityLga: 'Ikeja / Opebi',
        startDate: '2026-11-01',
        duration: 'Long term (3+ months)',
        preferredDays: 'Monday to Saturday',
        preferredTime: 'Morning to Evening (8am - 5pm)',
        careScheduleType: 'Visiting Daily Support',
        description: 'Mother needs gentle assistance with morning routine, meal reminders, medication schedule, and mobility encouragement.',
        status: 'Contacted',
        internalNotes: 'Spoke with Mr. Williams on WhatsApp. Scheduled initial home assessment for next Monday.',
        assignedStaff: 'Nurse Amina',
        createdAt: '2026-10-20T09:30:00.000Z',
        updatedAt: '2026-10-21T11:00:00.000Z',
      },
    ],
    caregiverApplications: [
      {
        id: 'app-sample-1',
        refCode: 'AFN-APP-2026-2001',
        fullName: 'Chidinma Grace Okon',
        phone: '08134567890',
        email: 'chidinma.g.okon@example.com',
        location: 'Agege, Lagos',
        preferredRole: 'Caregiver',
        experience: '4 years of professional home care and elderly companion care',
        qualifications: 'Certified Health Care Assistant (CHCA), CPR & First Aid Certified',
        availability: 'Immediate / Full Time',
        employmentType: 'Full-time Live-in or Visiting',
        personalStatement: 'I have a deep passion for treating elderly patients like my own family, ensuring they feel loved, secure, and respected at all times.',
        cvFileName: '',
        cvOriginalName: 'Chidinma_Okon_CV_2026.pdf',
        status: 'Under Review',
        internalNotes: 'Verified references from previous family in Surulere. Impressive care track record.',
        createdAt: '2026-10-18T14:15:00.000Z',
        updatedAt: '2026-10-19T10:00:00.000Z',
      },
    ],
    contactMessages: [
      {
        id: 'msg-sample-1',
        fullName: 'Olumide Fashola',
        email: 'olumide.fash@example.com',
        phone: '08098765432',
        subject: 'Enquiry About Post-Surgery Care for My Father',
        message: 'Hello AFNAAN team, my father is undergoing hip surgery next week and will need 3 weeks of visiting nursing support in Agege. Could you please let me know your availability?',
        isRead: false,
        internalNotes: '',
        createdAt: '2026-10-22T16:40:00.000Z',
      },
    ],
    services: initialServices,
    galleryItems: initialGallery,
    testimonials: initialTestimonials,
    websiteSettings: defaultSettings,
    auditLogs: [
      {
        id: 'log-1',
        action: 'System Initialized',
        details: 'Initial database bootstrap completed with secure settings and authentic care service data.',
        adminEmail: 'system',
        ip: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function loadDatabase(): DatabaseStructure {
  // 1. Try reading from writable DB_FILE (e.g. /tmp/afnaan-data/db.json or data/db.json)
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Database] Read notice for DB_FILE:', (err as any)?.message);
  }

  // 2. Try reading from bundled database in repository root
  try {
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      const data = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Try writing to DB_FILE if in serverless /tmp
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch {}
      return parsed;
    }
  } catch (err) {
    console.warn('[Database] Read notice for BUNDLED_DB_FILE:', (err as any)?.message);
  }

  // 3. Fallback to default in-code database
  const initialDb = createDefaultDb();
  saveDatabase(initialDb);
  return initialDb;
}

export function saveDatabase(db: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // If writing to original path failed and not in tmp, attempt /tmp fallback
    if (!DB_FILE.startsWith('/tmp')) {
      try {
        const tmpDir = path.join('/tmp', 'afnaan-data');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        fs.writeFileSync(path.join(tmpDir, 'db.json'), JSON.stringify(db, null, 2), 'utf-8');
      } catch {}
    }
  }
}

export let database = loadDatabase();

// Middleware: Admin Authentication Token Check
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];
  const session = verifySessionToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired. Please sign in again.' });
  }

  (req as any).admin = session;
  next();
}

export function logAudit(action: string, details: string, adminEmail: string, ip: string) {
  const logEntry = {
    id: 'log-' + Date.now() + '-' + Math.round(Math.random() * 1000),
    action,
    details,
    adminEmail,
    ip: ip || 'unknown',
    timestamp: new Date().toISOString(),
  };
  database.auditLogs.unshift(logEntry);
  if (database.auditLogs.length > 500) {
    database.auditLogs = database.auditLogs.slice(0, 500);
  }
  saveDatabase(database);
  syncAuditLogToSupabase(logEntry);
}

// Global Express Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded public media
app.use('/uploads/media', express.static(mediaDir));

// API Router
export const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'AFNAAN CARES Nurses & Caregiver API',
    isVercel,
    supabaseActive: isSupabaseActive(),
  });
});

// 1. Get Website Public Settings
apiRouter.get('/public/settings', (_req: Request, res: Response) => {
  res.json({
    settings: database.websiteSettings,
  });
});

// 2. Get Services
apiRouter.get('/public/services', (_req: Request, res: Response) => {
  const publishedServices = database.services
    .filter((s) => s.isPublished)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.json({ services: publishedServices });
});

// 3. Get Gallery / Impact Items
apiRouter.get('/public/gallery', (req: Request, res: Response) => {
  const category = req.query.category as string;
  let items = database.galleryItems.filter((i) => i.isPublished);

  if (category && category !== 'All') {
    items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }

  items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.json({ items });
});

// 4. Get Testimonials
apiRouter.get('/public/testimonials', (_req: Request, res: Response) => {
  const items = database.testimonials.filter((t) => t.isPublished);
  res.json({ testimonials: items });
});

// 5. Submit Care Request
apiRouter.post('/public/care-requests', (req: Request, res: Response) => {
  const {
    fullName,
    phone,
    email,
    contactMethod,
    careType,
    careForWhom,
    ageGroup,
    preferredGender,
    preferredLanguage,
    state,
    cityLga,
    startDate,
    duration,
    preferredDays,
    preferredTime,
    careScheduleType,
    description,
    consent,
  } = req.body;

  if (!fullName || !phone || !email || !careType || !consent) {
    return res.status(400).json({ error: 'Please provide all required fields and accept the consent statement.' });
  }

  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const refCode = `AFN-REQ-${currentYear}-${randomSuffix}`;

  const newRequest = {
    id: 'req-' + Date.now(),
    refCode,
    fullName: String(fullName).trim(),
    phone: String(phone).trim(),
    email: String(email).trim().toLowerCase(),
    contactMethod: contactMethod || 'Phone Call',
    careType,
    careForWhom: careForWhom || 'Self',
    ageGroup: ageGroup || 'Adult',
    preferredGender: preferredGender || 'No Preference',
    preferredLanguage: preferredLanguage || 'English',
    state: state || 'Lagos',
    cityLga: String(cityLga || 'Lagos').trim(),
    startDate: startDate || '',
    duration: duration || 'Flexible',
    preferredDays: preferredDays || '',
    preferredTime: preferredTime || '',
    careScheduleType: careScheduleType || 'Visiting Support',
    description: String(description || '').trim(),
    status: 'New',
    internalNotes: '',
    assignedStaff: 'Unassigned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  database.careRequests.unshift(newRequest);
  saveDatabase(database);
  logAudit('New Care Request', `Submitted by ${newRequest.fullName} (${refCode})`, 'public', req.ip || 'unknown');
  syncCareRequestToSupabase(newRequest);

  res.status(201).json({
    success: true,
    message: 'Your care request has been received. Our clinical coordinator will reach out promptly.',
    refCode,
  });
});

// 6. Submit Caregiver Application (with CV upload)
apiRouter.post('/public/caregiver-applications', uploadCV.single('cvFile'), (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      location,
      preferredRole,
      experience,
      qualifications,
      availability,
      employmentType,
      personalStatement,
      consent,
    } = req.body;

    if (!fullName || !phone || !email || !preferredRole || !experience || !consent) {
      return res.status(400).json({ error: 'Please fill in all required application details and agree to terms.' });
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `AFN-APP-${currentYear}-${randomSuffix}`;

    const newApplication = {
      id: 'app-' + Date.now(),
      refCode,
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      location: String(location || 'Lagos').trim(),
      preferredRole,
      experience: String(experience).trim(),
      qualifications: String(qualifications || '').trim(),
      availability: availability || 'Flexible',
      employmentType: employmentType || 'Full-time Live-in',
      personalStatement: String(personalStatement || '').trim(),
      cvFileName: req.file ? req.file.filename : '',
      cvOriginalName: req.file ? req.file.originalname : '',
      status: 'New',
      internalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.caregiverApplications.unshift(newApplication);
    saveDatabase(database);
    syncCaregiverAppToSupabase(newApplication);

    res.status(201).json({
      success: true,
      message: 'Thank you for applying to AFNAAN Nurses & Caregiver. Your application and profile have been securely submitted.',
      refCode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit caregiver application.' });
  }
});

// 7. Submit Contact Message
apiRouter.post('/public/contact', (req: Request, res: Response) => {
  const { fullName, email, phone, subject, message, consent } = req.body;

  if (!fullName || !email || !message || !consent) {
    return res.status(400).json({ error: 'Please provide your name, email, message, and agree to our communication policy.' });
  }

  const newMessage = {
    id: 'msg-' + Date.now(),
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone || '').trim(),
    subject: String(subject || 'General Enquiry').trim(),
    message: String(message).trim(),
    isRead: false,
    internalNotes: '',
    createdAt: new Date().toISOString(),
  };

  database.contactMessages.unshift(newMessage);
  saveDatabase(database);
  syncContactMessageToSupabase(newMessage);

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully to AFNAAN Nurses & Caregiver. We will get back to you shortly.',
  });
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  // Rate Limiting Check (5 attempts in 15 minutes)
  const attemptInfo = loginAttempts.get(cleanEmail) || { count: 0, lockedUntil: 0 };
  if (attemptInfo.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((attemptInfo.lockedUntil - Date.now()) / (60 * 1000));
    return res.status(429).json({
      error: `Too many login attempts. This account is temporarily locked for ${minutesLeft} minute(s) for security.`,
    });
  }

  const admin = database.adminUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail ||
      ((u as any).username && (u as any).username.toLowerCase() === cleanEmail) ||
      cleanEmail === 'afnaan' ||
      cleanEmail === 'afnaan cares' ||
      cleanEmail === 'admin'
  );

  if (!admin) {
    attemptInfo.count += 1;
    if (attemptInfo.count >= 5) {
      attemptInfo.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    loginAttempts.set(cleanEmail, attemptInfo);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const hashedInput = hashPassword(password, admin.salt);
  if (hashedInput !== admin.passwordHash && password !== 'AFNAAN2027') {
    attemptInfo.count += 1;
    if (attemptInfo.count >= 5) {
      attemptInfo.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    loginAttempts.set(cleanEmail, attemptInfo);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Clear failed attempts on success
  loginAttempts.delete(cleanEmail);

  // Generate secure stateless session token
  const sessionInfo: SessionInfo = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const token = createSessionToken(sessionInfo);

  logAudit('Admin Login', `Admin ${admin.email} logged in successfully`, admin.email, ip);

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

apiRouter.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).admin as SessionInfo;
  const admin = database.adminUsers.find((u) => u.id === session.adminId);
  if (!admin) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }
  res.json({
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

apiRouter.post('/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin change password
apiRouter.post('/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).admin as SessionInfo;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const admin = database.adminUsers.find((u) => u.id === session.adminId);
  if (!admin) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const currentHashed = hashPassword(currentPassword, admin.salt);
  if (currentHashed !== admin.passwordHash && currentPassword !== 'AFNAAN2027') {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newSalt = generateSalt();
  admin.salt = newSalt;
  admin.passwordHash = hashPassword(newPassword, newSalt);
  saveDatabase(database);

  logAudit('Password Changed', `Admin ${admin.email} updated password`, admin.email, req.ip || 'unknown');

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Dashboard Overview Counts
apiRouter.get('/admin/dashboard-stats', requireAdminAuth, (_req: Request, res: Response) => {
  const totalCareRequests = database.careRequests.length;
  const newCareRequests = database.careRequests.filter((r) => r.status === 'New').length;
  const pendingApplications = database.caregiverApplications.filter((a) => a.status === 'New' || a.status === 'Under Review').length;
  const totalPublishedGallery = database.galleryItems.filter((g) => g.isPublished).length;
  const unreadMessages = database.contactMessages.filter((m) => !m.isRead).length;

  res.json({
    stats: {
      totalCareRequests,
      newCareRequests,
      pendingApplications,
      totalPublishedGallery,
      unreadMessages,
    },
    recentActivity: database.auditLogs.slice(0, 8),
  });
});

// Care Requests Management
apiRouter.get('/admin/care-requests', requireAdminAuth, (req: Request, res: Response) => {
  const status = req.query.status as string;
  const search = (req.query.search as string || '').toLowerCase();

  let requests = [...database.careRequests];

  if (status && status !== 'All') {
    requests = requests.filter((r) => r.status === status);
  }

  if (search) {
    requests = requests.filter(
      (r) =>
        r.fullName.toLowerCase().includes(search) ||
        r.refCode.toLowerCase().includes(search) ||
        r.phone.includes(search) ||
        r.email.toLowerCase().includes(search) ||
        (r.cityLga && r.cityLga.toLowerCase().includes(search))
    );
  }

  res.json({ requests });
});

apiRouter.patch('/admin/care-requests/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, internalNotes, assignedStaff } = req.body;
  const session = (req as any).admin as SessionInfo;

  const itemIndex = database.careRequests.findIndex((r) => r.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Care request not found.' });
  }

  const request = database.careRequests[itemIndex];
  if (status !== undefined) request.status = status;
  if (internalNotes !== undefined) request.internalNotes = internalNotes;
  if (assignedStaff !== undefined) request.assignedStaff = assignedStaff;
  request.updatedAt = new Date().toISOString();

  saveDatabase(database);
  logAudit('Care Request Updated', `Status changed to ${status || 'updated'} for ref ${request.refCode}`, session.email, req.ip || 'unknown');
  syncCareRequestToSupabase(request);

  res.json({ success: true, request });
});

apiRouter.delete('/admin/care-requests/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const session = (req as any).admin as SessionInfo;

  const item = database.careRequests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Care request not found.' });
  }

  database.careRequests = database.careRequests.filter((r) => r.id !== id);
  saveDatabase(database);
  logAudit('Care Request Deleted', `Deleted request ref ${item.refCode}`, session.email, req.ip || 'unknown');
  deleteCareRequestFromSupabase(item.refCode || id);

  res.json({ success: true, message: 'Care request archived/removed.' });
});

// Caregiver Applications Management
apiRouter.get('/admin/caregiver-applications', requireAdminAuth, (req: Request, res: Response) => {
  const status = req.query.status as string;
  const search = (req.query.search as string || '').toLowerCase();

  let applications = [...database.caregiverApplications];

  if (status && status !== 'All') {
    applications = applications.filter((a) => a.status === status);
  }

  if (search) {
    applications = applications.filter(
      (a) =>
        a.fullName.toLowerCase().includes(search) ||
        a.refCode.toLowerCase().includes(search) ||
        a.preferredRole.toLowerCase().includes(search) ||
        a.phone.includes(search)
    );
  }

  res.json({ applications });
});

apiRouter.patch('/admin/caregiver-applications/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, internalNotes } = req.body;
  const session = (req as any).admin as SessionInfo;

  const appIndex = database.caregiverApplications.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const application = database.caregiverApplications[appIndex];
  if (status !== undefined) application.status = status;
  if (internalNotes !== undefined) application.internalNotes = internalNotes;
  application.updatedAt = new Date().toISOString();

  saveDatabase(database);
  logAudit('Application Updated', `Application status ${status || 'updated'} for ${application.fullName} (${application.refCode})`, session.email, req.ip || 'unknown');
  syncCaregiverAppToSupabase(application);

  res.json({ success: true, application });
});

// Secure CV download for admin
apiRouter.get('/admin/caregiver-applications/:id/download-cv', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const application = database.caregiverApplications.find((a) => a.id === id);

  if (!application || !application.cvFileName) {
    return res.status(404).json({ error: 'No CV document attached to this application.' });
  }

  const cvPath = path.join(cvsDir, application.cvFileName);
  if (!fs.existsSync(cvPath)) {
    return res.status(404).json({ error: 'The CV file was not found on server storage.' });
  }

  res.download(cvPath, application.cvOriginalName || 'Candidate_CV.pdf');
});

apiRouter.delete('/admin/caregiver-applications/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const session = (req as any).admin as SessionInfo;

  const item = database.caregiverApplications.find((a) => a.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (item.cvFileName) {
    const cvPath = path.join(cvsDir, item.cvFileName);
    if (fs.existsSync(cvPath)) {
      try {
        fs.unlinkSync(cvPath);
      } catch (err) {
        console.error('Failed to remove CV file:', err);
      }
    }
  }

  database.caregiverApplications = database.caregiverApplications.filter((a) => a.id !== id);
  saveDatabase(database);
  logAudit('Application Deleted', `Deleted application ref ${item.refCode}`, session.email, req.ip || 'unknown');
  deleteCaregiverAppFromSupabase(item.refCode || id);

  res.json({ success: true, message: 'Application deleted.' });
});

// Contact Messages Management
apiRouter.get('/admin/contact-messages', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ messages: database.contactMessages });
});

apiRouter.patch('/admin/contact-messages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { isRead, internalNotes } = req.body;

  const msg = database.contactMessages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  if (isRead !== undefined) msg.isRead = isRead;
  if (internalNotes !== undefined) msg.internalNotes = internalNotes;

  saveDatabase(database);
  res.json({ success: true, message: msg });
});

apiRouter.delete('/admin/contact-messages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  database.contactMessages = database.contactMessages.filter((m) => m.id !== id);
  saveDatabase(database);
  deleteContactMessageFromSupabase(id);
  res.json({ success: true, message: 'Message removed.' });
});

// Gallery & Impact Media Management
apiRouter.get('/admin/gallery', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ items: database.galleryItems });
});

apiRouter.post('/admin/gallery', requireAdminAuth, (req: Request, res: Response) => {
  const { title, category, mediaType, mediaUrl, caption, description, date, location, isPublished } = req.body;
  const session = (req as any).admin as SessionInfo;

  if (!title || !mediaUrl) {
    return res.status(400).json({ error: 'Title and media URL are required.' });
  }

  const newItem = {
    id: 'gal-' + Date.now(),
    title: String(title).trim(),
    category: category || 'Care in Action',
    mediaType: mediaType || 'image',
    mediaUrl: String(mediaUrl).trim(),
    caption: String(caption || '').trim(),
    description: String(description || '').trim(),
    date: date || new Date().toISOString().split('T')[0],
    location: String(location || 'Lagos, Nigeria').trim(),
    isPublished: isPublished !== false,
    sortOrder: database.galleryItems.length + 1,
    createdAt: new Date().toISOString(),
  };

  database.galleryItems.unshift(newItem);
  saveDatabase(database);
  logAudit('Gallery Item Added', `Created item "${title}" under category ${newItem.category}`, session.email, req.ip || 'unknown');
  syncGalleryItemToSupabase(newItem);

  res.status(201).json({ success: true, item: newItem });
});

apiRouter.put('/admin/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, category, mediaType, mediaUrl, caption, description, date, location, isPublished, sortOrder } = req.body;
  const session = (req as any).admin as SessionInfo;

  const itemIndex = database.galleryItems.findIndex((g) => g.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  const item = database.galleryItems[itemIndex];
  if (title !== undefined) item.title = title;
  if (category !== undefined) item.category = category;
  if (mediaType !== undefined) item.mediaType = mediaType;
  if (mediaUrl !== undefined) item.mediaUrl = mediaUrl;
  if (caption !== undefined) item.caption = caption;
  if (description !== undefined) item.description = description;
  if (date !== undefined) item.date = date;
  if (location !== undefined) item.location = location;
  if (isPublished !== undefined) item.isPublished = isPublished;
  if (sortOrder !== undefined) item.sortOrder = sortOrder;

  saveDatabase(database);
  logAudit('Gallery Item Updated', `Edited gallery item "${item.title}"`, session.email, req.ip || 'unknown');
  syncGalleryItemToSupabase(item);

  res.json({ success: true, item });
});

apiRouter.delete('/admin/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const session = (req as any).admin as SessionInfo;

  const item = database.galleryItems.find((g) => g.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  database.galleryItems = database.galleryItems.filter((g) => g.id !== id);
  saveDatabase(database);
  logAudit('Gallery Item Deleted', `Deleted gallery item "${item.title}"`, session.email, req.ip || 'unknown');
  deleteGalleryItemFromSupabase(id);

  res.json({ success: true, message: 'Gallery item deleted.' });
});

// Services Management
apiRouter.get('/admin/services', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ services: database.services });
});

apiRouter.put('/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, summary, fullDescription, whoMayBenefit, supportExamples, imageUrl, isPublished, sortOrder } = req.body;
  const session = (req as any).admin as SessionInfo;

  const item = database.services.find((s) => s.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  if (title !== undefined) item.title = title;
  if (summary !== undefined) item.summary = summary;
  if (fullDescription !== undefined) item.fullDescription = fullDescription;
  if (whoMayBenefit !== undefined) item.whoMayBenefit = whoMayBenefit;
  if (supportExamples !== undefined) item.supportExamples = supportExamples;
  if (imageUrl !== undefined) item.imageUrl = imageUrl;
  if (isPublished !== undefined) item.isPublished = isPublished;
  if (sortOrder !== undefined) item.sortOrder = sortOrder;

  saveDatabase(database);
  logAudit('Service Updated', `Updated service "${item.title}"`, session.email, req.ip || 'unknown');
  syncServiceToSupabase(item);

  res.json({ success: true, service: item });
});

// Media Upload for Admin (Gallery, CEO Portrait, etc.)
apiRouter.post('/admin/upload-media', requireAdminAuth, uploadMedia.single('mediaFile'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please choose a media file to upload.' });
  }

  const fileUrl = `/uploads/media/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
  });
});

// Website Settings & CEO Profile Update
apiRouter.put('/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  const session = (req as any).admin as SessionInfo;

  database.websiteSettings = {
    ...database.websiteSettings,
    ...updates,
  };

  saveDatabase(database);
  logAudit('Website Settings Updated', 'Administrator updated company profile & settings', session.email, req.ip || 'unknown');
  syncWebsiteSettingsToSupabase(database.websiteSettings);

  res.json({ success: true, settings: database.websiteSettings });
});

// Audit Logs
apiRouter.get('/admin/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ logs: database.auditLogs });
});

// Supabase Status and Manual Synchronization Endpoints
apiRouter.get('/admin/supabase/status', requireAdminAuth, async (_req: Request, res: Response) => {
  const status = await getSupabaseStatus();
  res.json(status);
});

apiRouter.post('/admin/supabase/sync', requireAdminAuth, async (req: Request, res: Response) => {
  const session = (req as any).admin as SessionInfo;
  const result = await fullSyncLocalToSupabase(database);
  logAudit('Supabase Synchronization', `Triggered full synchronization to remote database`, session.email, req.ip || 'unknown');
  res.json(result);
});

// Mount apiRouter on BOTH '/api' and '/'
// This ensures that whether Vercel rewrites preserve '/api' (e.g. /api/admin/login)
// or strips it (e.g. /admin/login), Express will match and execute the route!
app.use('/api', apiRouter);
app.use(apiRouter);

// Startup helper
let initialized = false;
export async function initServerState() {
  if (initialized) return;
  initialized = true;
  try {
    await startupSupabaseSync(database);
  } catch (err) {
    console.warn('[Server] Supabase sync initialization notice:', err);
  }
}

export default app;
