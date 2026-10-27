-- ==============================================================================
-- AFNAAN CARES NURSES & CAREGIVER - COMPLETE SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Compatible with Supabase SQL Editor. Run this entire script in one click.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Table: Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Website Global Settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    ceo_name TEXT NOT NULL,
    ceo_title TEXT NOT NULL,
    ceo_bio TEXT NOT NULL,
    ceo_image_url TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    whatsapp_url TEXT NOT NULL,
    whatsapp_display TEXT NOT NULL,
    business_address TEXT NOT NULL,
    hero_headline TEXT NOT NULL,
    hero_subtext TEXT NOT NULL,
    trust_statement TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    privacy_policy TEXT NOT NULL,
    terms_of_service TEXT NOT NULL,
    accessibility_statement TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Services Catalog
CREATE TABLE IF NOT EXISTS public.services (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    full_description TEXT NOT NULL,
    who_may_benefit TEXT NOT NULL,
    support_examples JSONB DEFAULT '[]'::jsonb NOT NULL,
    image_url TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Impact & Gallery Media
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    media_type VARCHAR(50) DEFAULT 'image' NOT NULL,
    media_url TEXT NOT NULL,
    caption TEXT,
    description TEXT,
    date VARCHAR(50),
    location VARCHAR(150),
    is_published BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Care Requests (Enquiries submitted by clients)
CREATE TABLE IF NOT EXISTS public.care_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_method VARCHAR(100) DEFAULT 'Phone Call',
    care_type VARCHAR(150) NOT NULL,
    care_for_whom VARCHAR(150),
    age_group VARCHAR(100),
    preferred_gender VARCHAR(50),
    preferred_language VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Lagos',
    city_lga VARCHAR(150),
    start_date VARCHAR(100),
    duration VARCHAR(150),
    preferred_days VARCHAR(150),
    preferred_time VARCHAR(150),
    care_schedule_type VARCHAR(150),
    description TEXT,
    status VARCHAR(50) DEFAULT 'New' NOT NULL,
    internal_notes TEXT DEFAULT '',
    assigned_staff VARCHAR(255) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Caregiver Recruitment Applications
CREATE TABLE IF NOT EXISTS public.caregiver_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(150),
    preferred_role VARCHAR(150),
    experience VARCHAR(150),
    qualifications TEXT,
    availability VARCHAR(150),
    employment_type VARCHAR(150),
    personal_statement TEXT,
    cv_file_name TEXT DEFAULT '',
    cv_original_name TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'Under Review' NOT NULL,
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Client Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(150),
    feedback TEXT NOT NULL,
    rating INTEGER DEFAULT 5 NOT NULL,
    location VARCHAR(150),
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Administrative Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    ip VARCHAR(100) DEFAULT 'unknown',
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery_items(is_published, category);
CREATE INDEX IF NOT EXISTS idx_care_requests_ref ON public.care_requests(ref_code);
CREATE INDEX IF NOT EXISTS idx_care_requests_status ON public.care_requests(status);
CREATE INDEX IF NOT EXISTS idx_applications_ref ON public.caregiver_applications(ref_code);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can view active website settings
CREATE POLICY "Public can view website settings" ON public.website_settings
    FOR SELECT TO anon, authenticated USING (true);

-- Public can view published services
CREATE POLICY "Public can view published services" ON public.services
    FOR SELECT TO anon, authenticated USING (is_published = true);

-- Public can view published gallery items
CREATE POLICY "Public can view published gallery items" ON public.gallery_items
    FOR SELECT TO anon, authenticated USING (is_published = true);

-- Public can view published testimonials
CREATE POLICY "Public can view published testimonials" ON public.testimonials
    FOR SELECT TO anon, authenticated USING (is_published = true);

-- Public can submit care requests
CREATE POLICY "Public can submit care requests" ON public.care_requests
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can submit caregiver applications
CREATE POLICY "Public can submit caregiver applications" ON public.caregiver_applications
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can send contact messages
CREATE POLICY "Public can send contact messages" ON public.contact_messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Service role / authenticated admin has full access to all tables
CREATE POLICY "Admin full access admin_users" ON public.admin_users FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access website_settings" ON public.website_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access services" ON public.services FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access gallery_items" ON public.gallery_items FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access care_requests" ON public.care_requests FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access caregiver_applications" ON public.caregiver_applications FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access contact_messages" ON public.contact_messages FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access testimonials" ON public.testimonials FOR ALL TO service_role USING (true);
CREATE POLICY "Admin full access audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true);

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- Seed: Admin User (Username: AFNAAN CARES or AFNAAN, Password: AFNAAN2027)
INSERT INTO public.admin_users (id, username, email, name, password_hash, salt, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'AFNAAN CARES',
    'afnaan',
    'AFNAAN CARES Administrator',
    'df5e671615987a87c947f96d7132bc8695bf0a9b6aed8860e738dfcea793583d150a4af6d41d1611d99e817f4bec5551813d11acff0356336ad48f32968d69ab',
    'f5b83986c0e222bc2954bdae91f0af8e',
    'super_admin'
) ON CONFLICT (username) DO NOTHING;

-- Seed: Website Settings
INSERT INTO public.website_settings (
    id, business_name, logo_url, ceo_name, ceo_title, ceo_bio, ceo_image_url,
    contact_email, whatsapp_url, whatsapp_display, business_address, hero_headline,
    hero_subtext, trust_statement, seo_title, seo_description, privacy_policy,
    terms_of_service, accessibility_statement
) VALUES (
    'default',
    'AFNAAN CARES Nurses & Caregiver',
    'https://i.ibb.co/rKN0fndw/20261023-174736.png',
    'IMRAN MUTOLIB ADEIZA',
    'Chief Executive Officer & Founder',
    'IMRAN MUTOLIB ADEIZA leads AFNAAN CARES Nurses & Caregiver with a focus on compassionate service, professionalism, and the importance of treating every individual with dignity and respect. His vision for AFNAAN CARES is to build a care service that listens to families, values dedicated care professionals, and places wellbeing at the centre of every arrangement.',
    'https://i.ibb.co/xSSVrxWH/Whats-App-Image-2026-10-23-at-5-31-39-PM.jpg',
    'abooafnaan28@gmail.com',
    'https://wa.me/2349162285884',
    '+234 916 228 5884',
    'No 7 Old Ota Road, Orile Bus Stop, Orile Agege, Lagos, Nigeria.',
    'Compassionate Care.
Professional Support.
Peace of Mind.',
    'At AFNAAN CARES Nurses & Caregiver, we believe everyone deserves compassionate, respectful, and dependable care. We connect individuals and families with dedicated care professionals who put dignity, comfort, and wellbeing first.',
    'Care that puts people first.',
    'AFNAAN CARES Nurses & Caregiver | Professional Home Care & Nursing Support in Lagos',
    'Find compassionate, qualified caregivers, elderly care, and nursing support in Lagos, Nigeria. AFNAAN CARES Nurses & Caregiver delivers dignity and comfort right at home.',
    'At AFNAAN CARES Nurses & Caregiver, we are dedicated to protecting your privacy and treating all personal and health-related information with maximum discretion, security, and confidentiality.',
    'Welcome to AFNAAN CARES Nurses & Caregiver. By accessing our website and engaging our services, you agree to our terms and conditions.',
    'AFNAAN CARES Nurses & Caregiver is committed to ensuring our digital services are accessible to all people, including seniors and individuals with disabilities.'
) ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    logo_url = EXCLUDED.logo_url,
    ceo_image_url = EXCLUDED.ceo_image_url,
    updated_at = now();

-- Seed: Services (with user provided authentic images)
INSERT INTO public.services (id, title, slug, category, summary, full_description, who_may_benefit, support_examples, image_url, is_published, sort_order)
VALUES
(
    'srv-1',
    'Home Care Assistance',
    'home-care-assistance',
    'Daily Living',
    'Support with everyday activities, routines, and comfortable living in the familiar surroundings of home.',
    'Our home care assistance is designed to support individuals who value living in their own homes but need a dependable helping hand with day-to-day routines. We assist with meal preparation, mobility, household reminders, light housekeeping, and personal comfort.',
    'Individuals needing extra support at home, seniors wishing to age in place, and individuals recuperating after an illness.',
    '["Nutritious meal preparation and hydration monitoring","Assistance with morning and evening routines","Light housekeeping, tidy living spaces, and laundry support","Mobility assistance and safe movement within the house","Accompaniment to hospital appointments and walks","Friendly companionship and cognitive engagement"]'::jsonb,
    'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
    true,
    1
),
(
    'srv-2',
    'Elderly Care',
    'elderly-care',
    'Geriatric Support',
    'Respectful, patient assistance that upholds comfort, dignity, safety, independence, and overall wellbeing.',
    'Aging brings changes in physical capability, emotional needs, and daily routines. Our elderly care team provides compassionate, attentive support tailored to older adults.',
    'Elderly parents, seniors living alone or with family in Lagos, and older adults experiencing age-related physical limitations.',
    '["Dignified assistance with bathing, dressing, and grooming","Fall risk management and supervised safe walking","Medication schedule prompts and vitals check coordination","Engaging conversations, reading, and mental wellness activities","Monitoring mood, sleep, appetite, and general health changes","Regular reassuring updates for family members"]'::jsonb,
    'https://i.ibb.co/HDd37w0S/351da2ae-7b26-4e1b-a0cc-8d4c1ffe1a9c.jpg',
    true,
    2
),
(
    'srv-3',
    'Personal Care Assistance',
    'personal-care-assistance',
    'Personal Support',
    'Help with suitable activities of daily living according to each client’s needs and agreed care plan.',
    'Personal care requires tact, respect, and skilled hands. Our trained caregivers assist with sensitive daily living routines with utmost privacy and dignity.',
    'Individuals with limited mobility, bed-bound clients, or those recovering who require hands-on daily support.',
    '["Bed bath, shower, and personal hygiene assistance","Oral care, skin care, and pressure-sore prevention positioning","Toileting and incontinence care managed respectfully","Assistance with feeding and dietary routines","Safe transfer assistance from bed to wheelchair or chair"]'::jsonb,
    'https://i.ibb.co/zThxr8Hn/d72623f9-c5cb-47e9-8d04-5d9a7fac1191.jpg',
    true,
    3
),
(
    'srv-4',
    'Nursing Support',
    'nursing-support',
    'Clinical Care',
    'Skilled nursing services delivered by appropriately qualified nursing professionals within their professional competence.',
    'When medical needs arise at home, our registered nursing personnel provide competent clinical support under medical direction. From wound care and vitals to post-op care.',
    'Post-operative patients, clients with chronic clinical conditions, individuals requiring clinical monitoring or professional wound dressing.',
    '["Comprehensive vital signs monitoring and clinical documentation","Aseptic wound dressing, surgical site care, and ulcer management","Prescribed medication administration and injection support","Catheter care, stoma support, and tube feeding monitoring","Direct liaison with attending physicians and hospital teams"]'::jsonb,
    'https://i.ibb.co/0p2YvFVY/212a3369-d1b6-4c5d-8837-80eb62cc773c.jpg',
    true,
    4
),
(
    'srv-5',
    'Recovery and Respite Support',
    'recovery-respite-support',
    'Transitional Care',
    'Support for individuals recovering at home and short-term relief for family members who provide primary care.',
    'Caring for a loved one is rewarding but can also be physically and emotionally demanding. Our respite care gives family caregivers time to rest and recharge.',
    'Family caregivers needing short-term relief, and patients recovering from surgery, stroke, or acute medical illness.',
    '["Flexible short-term, weekend, or multi-week respite coverage","Post-hospital discharge rehabilitation support and observation","Continuity of daily routines and medication schedules","Physical therapy exercise assistance following doctor instructions","Relief for primary family caregivers to prevent burnout"]'::jsonb,
    'https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg',
    true,
    5
),
(
    'srv-6',
    'Family Care Support',
    'family-care-support',
    'Coordination',
    'Practical assistance, professional guidance, and clear communication to help families coordinate appropriate care.',
    'Navigating care options can feel overwhelming for families. AFNAAN acts as a dependable partner, conducting thorough needs assessments and structured care routines.',
    'Families in Lagos or in the diaspora wanting reliable, supervised care arrangements for their loved ones.',
    '["Initial home care assessment and individualised care planning","Direct WhatsApp and digital care progress updates to family","Caregiver supervision, attendance monitoring, and quality checks","Transparent communication regarding any changes in health status","Ongoing guidance on home safety and adaptive living equipment"]'::jsonb,
    'https://i.ibb.co/RWMfDcL/4aa36139-2402-428d-a4e1-70be11835a38.jpg',
    true,
    6
)
ON CONFLICT (id) DO UPDATE SET
    image_url = EXCLUDED.image_url,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary;

-- Seed: Gallery Items
INSERT INTO public.gallery_items (id, title, category, media_type, media_url, caption, description, date, location, is_published, sort_order)
VALUES
(
    'gal-1',
    'Compassionate Home Care in Lagos',
    'Care in Action',
    'image',
    'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
    'Our dedicated caregiver assisting with daily morning routine and gentle hydration.',
    'Delivering patient-centred care at home in Lagos, respecting dignity and fostering comfort for every individual.',
    '2026-09-15',
    'Ikeja, Lagos',
    true,
    1
),
(
    'gal-2',
    'Qualified Nursing Professionals',
    'Our Team',
    'image',
    'https://i.ibb.co/7Jg5BngR/Gemini-Generated-Image-3qtj7q3qtj7q3qtj.jpg',
    'A member of our registered nursing staff prepared for home clinical visits.',
    'Our nurses bring rigorous medical training, clinical competence, and empathetic bedside manner to client homes.',
    '2026-08-20',
    'Agege, Lagos',
    true,
    2
),
(
    'gal-3',
    'Hands-on Caregiver Skills Training',
    'Training and Development',
    'image',
    'https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg',
    'Continuous training sessions on safe patient transfer techniques and hygiene standards.',
    'We hold regular practical workshops covering patient transfer, emergency first response, communication, and dignified elder care.',
    '2026-07-12',
    'Orile Agege Training Centre',
    true,
    3
),
(
    'gal-4',
    'Elderly Companion & Mobility Support',
    'Care in Action',
    'image',
    'https://i.ibb.co/0pGcWvZN/Gemini-Generated-Image-uczqozuczqozuczq.jpg',
    'Encouraging gentle mobility and active companionship for our senior clients.',
    'Consistent, patient companionship makes all the difference in emotional wellbeing and physical vitality.',
    '2026-06-30',
    'Surulere, Lagos',
    true,
    4
),
(
    'gal-5',
    'Community Health Awareness Day',
    'Community Engagement',
    'image',
    'https://i.ibb.co/7Jg5BngR/Gemini-Generated-Image-3qtj7q3qtj7q3qtj.jpg',
    'AFNAAN team engaging residents on blood pressure checks and elder health wellness.',
    'Giving back to our community in Orile Agege through free blood pressure screening and home health education.',
    '2026-05-18',
    'Orile Agege, Lagos',
    true,
    5
),
(
    'gal-6',
    'Client Story: Restoring Peace of Mind',
    'Client Stories',
    'image',
    'https://i.ibb.co/hRpKpVhM/Gemini-Generated-Image-dvwzijdvwzijdvwz.jpg',
    'The Adeleke family shares their experience having AFNAAN support their grandmother.',
    'A genuine reflection on how consistent, supervised caregiver support relieved family stress and preserved dignity.',
    '2026-04-10',
    'Lekki, Lagos',
    true,
    6
)
ON CONFLICT (id) DO UPDATE SET
    media_url = EXCLUDED.media_url,
    title = EXCLUDED.title;

-- Seed: Testimonials
INSERT INTO public.testimonials (id, client_name, relationship, feedback, rating, location, is_published)
VALUES
(
    't-1',
    'Mrs. F. Adeleke',
    'Daughter of Senior Client',
    'AFNAAN CARES Nurses & Caregiver provided my 82-year-old mother with patient, warm, and highly respectful care in Lagos. Knowing she was in reliable hands gave our entire family deep peace of mind.',
    5,
    'Ikeja, Lagos',
    true
),
(
    't-2',
    'Dr. K. Balogun',
    'Family Care Coordinator',
    'Their punctuality, transparency, and clinical competence were outstanding. When my father required post-hospital recovery support, the nurse assigned by AFNAAN CARES was thorough and communicative.',
    5,
    'Victoria Island, Lagos',
    true
),
(
    't-3',
    'Alhaja S. Danladi',
    'Client Family',
    'The caregiver assigned to us treats my aunt with dignity and gentleness. The management team checks in regularly to make sure everything is running smoothly. Highly recommended.',
    5,
    'Orile Agege, Lagos',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Seed: Initial Audit Log
INSERT INTO public.audit_logs (action, details, admin_email, ip)
VALUES (
    'Database Initialized',
    'Supabase schema created with complete tables, security rules, and seed data for AFNAAN CARES Nurses & Caregiver.',
    'system',
    '127.0.0.1'
);
