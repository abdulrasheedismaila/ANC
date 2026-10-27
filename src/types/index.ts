export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  fullDescription: string;
  whoMayBenefit: string;
  supportExamples: string[];
  imageUrl: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  description: string;
  date: string;
  location: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  relationship: string;
  feedback: string;
  rating: number;
  location: string;
  isPublished: boolean;
  createdAt: string;
}

export interface WebsiteSettings {
  businessName: string;
  logoUrl: string;
  ceoName: string;
  ceoTitle: string;
  ceoBio: string;
  ceoImageUrl: string;
  contactEmail: string;
  whatsappUrl: string;
  whatsappDisplay: string;
  businessAddress: string;
  heroHeadline: string;
  heroSubtext: string;
  trustStatement: string;
  seoTitle: string;
  seoDescription: string;
  privacyPolicy: string;
  termsOfService: string;
  accessibilityStatement: string;
}

export interface CareRequest {
  id: string;
  refCode: string;
  fullName: string;
  phone: string;
  email: string;
  contactMethod: string;
  careType: string;
  careForWhom: string;
  ageGroup: string;
  preferredGender: string;
  preferredLanguage: string;
  state: string;
  cityLga: string;
  startDate: string;
  duration: string;
  preferredDays: string;
  preferredTime: string;
  careScheduleType: string;
  description: string;
  status: 'New' | 'Contacted' | 'Assessment' | 'In Progress' | 'Completed' | 'Cancelled';
  internalNotes: string;
  assignedStaff: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverApplication {
  id: string;
  refCode: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  preferredRole: string;
  experience: string;
  qualifications: string;
  availability: string;
  employmentType: string;
  personalStatement: string;
  cvFileName: string;
  cvOriginalName: string;
  status: 'New' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Not Selected';
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  internalNotes: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  ip: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
