import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client
let supabaseClient: SupabaseClient | null = null;
let clientInitialized = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInitialized) return supabaseClient;

  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (url && key && !url.includes('your-project-id') && !key.includes('your_supabase')) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      console.log(`[Supabase] Connected successfully to ${url}`);
    } catch (err) {
      console.error('[Supabase] Failed to initialize client:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }

  clientInitialized = true;
  return supabaseClient;
}

export function isSupabaseActive(): boolean {
  return getSupabaseClient() !== null;
}

export async function getSupabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  url: string;
  message: string;
}> {
  const client = getSupabaseClient();
  const url = process.env.SUPABASE_URL?.trim() || '';

  if (!client) {
    return {
      configured: false,
      connected: false,
      url: url ? url.substring(0, 20) + '...' : 'Not provided',
      message: 'Supabase credentials not configured in .env',
    };
  }

  try {
    // Test connectivity by querying gallery_items count
    const { count, error } = await client
      .from('gallery_items')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        configured: true,
        connected: false,
        url: url.substring(0, 25) + '...',
        message: `Connected to Supabase URL, but query returned: ${error.message}. Ensure you ran supabase_schema.sql.`,
      };
    }

    return {
      configured: true,
      connected: true,
      url: url.substring(0, 25) + '...',
      message: `Active and operational (${count || 0} gallery items found).`,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      url: url.substring(0, 25) + '...',
      message: err?.message || 'Connection test failed',
    };
  }
}

// 1. Sync Care Request
export async function syncCareRequestToSupabase(reqItem: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      ref_code: reqItem.refCode,
      full_name: reqItem.fullName,
      phone: reqItem.phone,
      email: reqItem.email,
      contact_method: reqItem.contactMethod || 'Phone Call',
      care_type: reqItem.careType,
      care_for_whom: reqItem.careForWhom || 'Self',
      age_group: reqItem.ageGroup || '',
      preferred_gender: reqItem.preferredGender || 'No Preference',
      preferred_language: reqItem.preferredLanguage || 'English',
      state: reqItem.state || 'Lagos',
      city_lga: reqItem.cityLga || '',
      start_date: reqItem.startDate || '',
      duration: reqItem.duration || '',
      preferred_days: reqItem.preferredDays || '',
      preferred_time: reqItem.preferredTime || '',
      care_schedule_type: reqItem.careScheduleType || 'Visiting Support',
      description: reqItem.description || '',
      status: reqItem.status || 'New',
      internal_notes: reqItem.internalNotes || '',
      assigned_staff: reqItem.assignedStaff || '',
      created_at: reqItem.createdAt || new Date().toISOString(),
      updated_at: reqItem.updatedAt || new Date().toISOString(),
    };

    const { error } = await client
      .from('care_requests')
      .upsert(payload, { onConflict: 'ref_code' });

    if (error) {
      console.warn(`[Supabase Sync] Care request (${reqItem.refCode}) warning:`, error.message);
    } else {
      console.log(`[Supabase Sync] Care request (${reqItem.refCode}) synced successfully.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Care request error:', err?.message || err);
  }
}

export async function deleteCareRequestFromSupabase(idOrRef: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client
      .from('care_requests')
      .delete()
      .or(`ref_code.eq.${idOrRef},id.eq.${idOrRef}`);
  } catch (err: any) {
    console.warn('[Supabase Sync] Delete care request error:', err?.message || err);
  }
}

// 2. Sync Caregiver Application
export async function syncCaregiverAppToSupabase(appItem: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      ref_code: appItem.refCode,
      full_name: appItem.fullName,
      phone: appItem.phone,
      email: appItem.email,
      location: appItem.location || 'Lagos',
      preferred_role: appItem.preferredRole || '',
      experience: appItem.experience || '',
      qualifications: appItem.qualifications || '',
      availability: appItem.availability || '',
      employment_type: appItem.employmentType || 'Full-time',
      personal_statement: appItem.personalStatement || '',
      cv_file_name: appItem.cvFileName || '',
      cv_original_name: appItem.cvOriginalName || '',
      status: appItem.status || 'Under Review',
      internal_notes: appItem.internalNotes || '',
      created_at: appItem.createdAt || new Date().toISOString(),
      updated_at: appItem.updatedAt || new Date().toISOString(),
    };

    const { error } = await client
      .from('caregiver_applications')
      .upsert(payload, { onConflict: 'ref_code' });

    if (error) {
      console.warn(`[Supabase Sync] Caregiver app (${appItem.refCode}) warning:`, error.message);
    } else {
      console.log(`[Supabase Sync] Caregiver app (${appItem.refCode}) synced successfully.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Caregiver app error:', err?.message || err);
  }
}

export async function deleteCaregiverAppFromSupabase(idOrRef: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client
      .from('caregiver_applications')
      .delete()
      .or(`ref_code.eq.${idOrRef},id.eq.${idOrRef}`);
  } catch (err: any) {
    console.warn('[Supabase Sync] Delete caregiver app error:', err?.message || err);
  }
}

// 3. Sync Contact Message
export async function syncContactMessageToSupabase(msgItem: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      full_name: msgItem.fullName,
      email: msgItem.email,
      phone: msgItem.phone || '',
      subject: msgItem.subject || 'General Enquiry',
      message: msgItem.message,
      is_read: msgItem.isRead || false,
      internal_notes: msgItem.internalNotes || '',
      created_at: msgItem.createdAt || new Date().toISOString(),
    };

    const { error } = await client.from('contact_messages').insert(payload);
    if (error) {
      console.warn('[Supabase Sync] Contact message warning:', error.message);
    } else {
      console.log(`[Supabase Sync] Contact message from ${msgItem.fullName} synced.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Contact message error:', err?.message || err);
  }
}

export async function deleteContactMessageFromSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('contact_messages').delete().eq('id', id);
  } catch (err: any) {
    console.warn('[Supabase Sync] Delete contact message error:', err?.message || err);
  }
}

// 4. Sync Gallery Item
export async function syncGalleryItemToSupabase(item: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      id: item.id,
      title: item.title,
      category: item.category || 'Care in Action',
      media_type: item.mediaType || 'image',
      media_url: item.mediaUrl,
      caption: item.caption || '',
      description: item.description || '',
      date: item.date || '',
      location: item.location || 'Lagos, Nigeria',
      is_published: item.isPublished !== false,
      sort_order: item.sortOrder || 0,
      created_at: item.createdAt || new Date().toISOString(),
    };

    const { error } = await client
      .from('gallery_items')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase Sync] Gallery item (${item.title}) warning:`, error.message);
    } else {
      console.log(`[Supabase Sync] Gallery item (${item.title}) synced successfully.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Gallery item error:', err?.message || err);
  }
}

export async function deleteGalleryItemFromSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('gallery_items').delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase Sync] Delete gallery item (${id}) warning:`, error.message);
    } else {
      console.log(`[Supabase Sync] Gallery item (${id}) deleted from Supabase.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Delete gallery item error:', err?.message || err);
  }
}

// 5. Sync Service
export async function syncServiceToSupabase(service: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      id: service.id,
      title: service.title,
      slug: service.slug,
      category: service.category,
      summary: service.summary,
      full_description: service.fullDescription,
      who_may_benefit: service.whoMayBenefit,
      support_examples: service.supportExamples || [],
      image_url: service.imageUrl,
      is_published: service.isPublished !== false,
      sort_order: service.sortOrder || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('services')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase Sync] Service (${service.title}) warning:`, error.message);
    } else {
      console.log(`[Supabase Sync] Service (${service.title}) synced.`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Service error:', err?.message || err);
  }
}

// 6. Sync Website Settings
export async function syncWebsiteSettingsToSupabase(settings: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const payload = {
      id: 'default',
      business_name: settings.businessName || 'AFNAAN CARES Nurses & Caregiver',
      logo_url: settings.logoUrl || '',
      ceo_name: settings.ceoName || '',
      ceo_title: settings.ceoTitle || '',
      ceo_bio: settings.ceoBio || '',
      ceo_image_url: settings.ceoImageUrl || '',
      contact_email: settings.contactEmail || '',
      whatsapp_url: settings.whatsappUrl || '',
      whatsapp_display: settings.whatsappDisplay || '',
      business_address: settings.businessAddress || '',
      hero_headline: settings.heroHeadline || '',
      hero_subtext: settings.heroSubtext || '',
      trust_statement: settings.trustStatement || '',
      seo_title: settings.seoTitle || '',
      seo_description: settings.seoDescription || '',
      privacy_policy: settings.privacyPolicy || '',
      terms_of_service: settings.termsOfService || '',
      accessibility_statement: settings.accessibilityStatement || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('website_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Website settings warning:', error.message);
    } else {
      console.log('[Supabase Sync] Website settings synced.');
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Website settings error:', err?.message || err);
  }
}

// 7. Sync Audit Log
export async function syncAuditLogToSupabase(log: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('audit_logs').insert({
      action: log.action,
      details: log.details,
      admin_email: log.adminEmail || 'admin',
      ip: log.ip || 'unknown',
      timestamp: log.timestamp || new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[Supabase Sync] Audit log error:', err?.message || err);
  }
}

// 8. Full Push: Seed all local items to Supabase
export async function fullSyncLocalToSupabase(database: any): Promise<{
  success: boolean;
  synced: Record<string, number>;
  errors: string[];
}> {
  const client = getSupabaseClient();
  const errors: string[] = [];
  const synced: Record<string, number> = {
    gallery: 0,
    services: 0,
    careRequests: 0,
    applications: 0,
    messages: 0,
    settings: 0,
  };

  if (!client) {
    return {
      success: false,
      synced,
      errors: ['Supabase client is not connected. Please check SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env'],
    };
  }

  // Gallery items
  if (database.galleryItems && Array.isArray(database.galleryItems)) {
    for (const item of database.galleryItems) {
      try {
        await syncGalleryItemToSupabase(item);
        synced.gallery++;
      } catch (e: any) {
        errors.push(`Gallery "${item.title}": ${e.message}`);
      }
    }
  }

  // Services
  if (database.services && Array.isArray(database.services)) {
    for (const srv of database.services) {
      try {
        await syncServiceToSupabase(srv);
        synced.services++;
      } catch (e: any) {
        errors.push(`Service "${srv.title}": ${e.message}`);
      }
    }
  }

  // Care Requests
  if (database.careRequests && Array.isArray(database.careRequests)) {
    for (const req of database.careRequests) {
      try {
        await syncCareRequestToSupabase(req);
        synced.careRequests++;
      } catch (e: any) {
        errors.push(`Care Request ${req.refCode}: ${e.message}`);
      }
    }
  }

  // Caregiver Applications
  if (database.caregiverApplications && Array.isArray(database.caregiverApplications)) {
    for (const app of database.caregiverApplications) {
      try {
        await syncCaregiverAppToSupabase(app);
        synced.applications++;
      } catch (e: any) {
        errors.push(`Application ${app.refCode}: ${e.message}`);
      }
    }
  }

  // Contact Messages
  if (database.contactMessages && Array.isArray(database.contactMessages)) {
    for (const msg of database.contactMessages) {
      try {
        await syncContactMessageToSupabase(msg);
        synced.messages++;
      } catch (e: any) {
        errors.push(`Message ${msg.subject}: ${e.message}`);
      }
    }
  }

  // Settings
  if (database.websiteSettings) {
    try {
      await syncWebsiteSettingsToSupabase(database.websiteSettings);
      synced.settings = 1;
    } catch (e: any) {
      errors.push(`Settings: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
  };
}

// 9. Startup check & pull
export async function startupSupabaseSync(database: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Check if gallery items exist in remote
    const { data: remoteGallery, error: galErr } = await client
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!galErr && remoteGallery && remoteGallery.length > 0) {
      console.log(`[Supabase] Loaded ${remoteGallery.length} gallery items from Supabase.`);
      database.galleryItems = remoteGallery.map((g: any) => ({
        id: g.id,
        title: g.title,
        category: g.category,
        mediaType: g.media_type,
        mediaUrl: g.media_url,
        caption: g.caption || '',
        description: g.description || '',
        date: g.date || '',
        location: g.location || '',
        isPublished: g.is_published !== false,
        sortOrder: g.sort_order || 0,
        createdAt: g.created_at || new Date().toISOString(),
      }));
    } else if (!galErr && remoteGallery && remoteGallery.length === 0 && database.galleryItems.length > 0) {
      console.log('[Supabase] Initializing empty Supabase database with local gallery items...');
      for (const item of database.galleryItems) {
        await syncGalleryItemToSupabase(item);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Startup sync check notice:', err?.message || err);
  }
}
