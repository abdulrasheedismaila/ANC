import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import {
  CareRequest,
  CaregiverApplication,
  ContactMessage,
  GalleryItem,
  ServiceItem,
  AuditLog
} from '../../types';
import {
  LayoutDashboard,
  HeartHandshake,
  UserCheck,
  Image as ImageIcon,
  Settings,
  MessageSquare,
  History,
  Lock,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Edit,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Upload,
  Film,
  Play,
  UploadCloud,
  Check,
  Database
} from 'lucide-react';
import { extractCleanImageUrl, parseVideoUrl } from '../../utils/mediaUtils';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { admin, token, logout } = useAuth();
  const { settings, refreshContent, updateSettingsLocally } = useContent();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'requests' | 'applications' | 'gallery' | 'services' | 'messages' | 'settings' | 'audit' | 'security'
  >('overview');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Data states
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalCareRequests: 0,
    newCareRequests: 0,
    pendingApplications: 0,
    totalPublishedGallery: 0,
    unreadMessages: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  // Care Requests state
  const [careRequests, setCareRequests] = useState<CareRequest[]>([]);
  const [requestFilterStatus, setRequestFilterStatus] = useState('All');
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CareRequest | null>(null);

  // Applications state
  const [applications, setApplications] = useState<CaregiverApplication[]>([]);
  const [appFilterStatus, setAppFilterStatus] = useState('All');
  const [appSearch, setAppSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<CaregiverApplication | null>(null);

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<Partial<GalleryItem> | null>(null);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [galleryImageTab, setGalleryImageTab] = useState<'upload' | 'url'>('upload');
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseSyncMessage, setSupabaseSyncMessage] = useState('');

  // Services state
  const [adminServices, setAdminServices] = useState<ServiceItem[]>([]);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Password change state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  // Confirmation Modal state for deletions
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'request' | 'application' | 'gallery' | 'message';
    id: string;
    title: string;
  } | null>(null);

  // Helper fetch with auth headers
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Load Dashboard Overview Stats
  const loadStats = async () => {
    try {
      const res = await authFetch('/api/admin/dashboard-stats');
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data.stats);
        setRecentLogs(data.recentActivity || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Load Care Requests
  const loadCareRequests = async () => {
    try {
      const query = new URLSearchParams({
        status: requestFilterStatus,
        search: requestSearch,
      });
      const res = await authFetch(`/api/admin/care-requests?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCareRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to load care requests:', err);
    }
  };

  // Load Applications
  const loadApplications = async () => {
    try {
      const query = new URLSearchParams({
        status: appFilterStatus,
        search: appSearch,
      });
      const res = await authFetch(`/api/admin/caregiver-applications?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  // Load Gallery
  const loadGallery = async () => {
    try {
      const res = await authFetch('/api/admin/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    }
  };

  // Load Services
  const loadServices = async () => {
    try {
      const res = await authFetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setAdminServices(data.services);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  // Load Messages
  const loadMessages = async () => {
    try {
      const res = await authFetch('/api/admin/contact-messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Load Audit
  const loadAudit = async () => {
    try {
      const res = await authFetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    loadStats();
    loadCareRequests();
    loadApplications();
    loadGallery();
    loadServices();
    loadMessages();
    loadAudit();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'requests') loadCareRequests();
  }, [requestFilterStatus, requestSearch]);

  useEffect(() => {
    if (activeTab === 'applications') loadApplications();
  }, [appFilterStatus, appSearch]);

  // Request actions
  const handleUpdateRequest = async (id: string, updates: Partial<CareRequest>) => {
    try {
      const res = await authFetch(`/api/admin/care-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        loadCareRequests();
        loadStats();
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest((prev: any) => ({ ...prev, ...updates }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Application actions
  const handleUpdateApplication = async (id: string, updates: Partial<CaregiverApplication>) => {
    try {
      const res = await authFetch(`/api/admin/caregiver-applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        loadApplications();
        loadStats();
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, ...updates }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Download CV
  const handleDownloadCv = (appId: string) => {
    window.open(`/api/admin/caregiver-applications/${appId}/download-cv?token=${token}`, '_blank');
  };

  // Delete handlers
  const executeDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;

    try {
      let endpoint = '';
      if (type === 'request') endpoint = `/api/admin/care-requests/${id}`;
      if (type === 'application') endpoint = `/api/admin/caregiver-applications/${id}`;
      if (type === 'gallery') endpoint = `/api/admin/gallery/${id}`;
      if (type === 'message') endpoint = `/api/admin/contact-messages/${id}`;

      const res = await authFetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'request') {
          loadCareRequests();
          if (selectedRequest?.id === id) setSelectedRequest(null);
        }
        if (type === 'application') {
          loadApplications();
          if (selectedApp?.id === id) setSelectedApp(null);
        }
        if (type === 'gallery') loadGallery();
        if (type === 'message') loadMessages();
        loadStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Gallery Save (Create / Update)
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalleryError('');

    if (!editingGalleryItem?.title?.trim()) {
      setGalleryError('Please enter a title for this media item.');
      return;
    }

    const mediaType = editingGalleryItem?.mediaType || 'image';
    let mediaUrl = (editingGalleryItem?.mediaUrl || '').trim();

    if (mediaType === 'video') {
      const parsed = parseVideoUrl(mediaUrl);
      if (!parsed.isValid) {
        setGalleryError(parsed.errorMessage || 'Please provide a valid YouTube or Google Drive video link.');
        return;
      }
      mediaUrl = parsed.embedUrl;
    } else {
      mediaUrl = extractCleanImageUrl(mediaUrl);
      if (!mediaUrl) {
        setGalleryError('Please upload an image from your device or paste an image link.');
        return;
      }
    }

    try {
      const isEditing = !!editingGalleryItem.id;
      const endpoint = isEditing
        ? `/api/admin/gallery/${editingGalleryItem.id}`
        : '/api/admin/gallery';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        ...editingGalleryItem,
        title: editingGalleryItem.title.trim(),
        mediaType,
        mediaUrl,
      };

      const res = await authFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowGalleryModal(false);
        setEditingGalleryItem(null);
        setGalleryError('');
        loadGallery();
        refreshContent();
        loadStats();
      } else {
        const data = await res.json().catch(() => ({}));
        setGalleryError(data.error || 'Failed to save media item.');
      }
    } catch (e: any) {
      setGalleryError(e?.message || 'Failed to save gallery item.');
    }
  };

  // Supabase Status check and manual sync
  const checkSupabaseStatus = async () => {
    setIsTestingSupabase(true);
    setSupabaseSyncMessage('');
    try {
      const res = await authFetch('/api/admin/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (e: any) {
      setSupabaseStatus({ connected: false, message: e.message || 'Connection check failed' });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleManualSupabaseSync = async () => {
    setIsTestingSupabase(true);
    setSupabaseSyncMessage('');
    try {
      const res = await authFetch('/api/admin/supabase/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSupabaseSyncMessage(`Database synchronization complete! Synced: ${data.synced.gallery} gallery, ${data.synced.services} services, ${data.synced.careRequests} care requests, ${data.synced.applications} applications.`);
      } else {
        setSupabaseSyncMessage(`Sync notice: ${data.errors?.join(', ') || 'Partial synchronization completed.'}`);
      }
      checkSupabaseStatus();
    } catch (e: any) {
      setSupabaseSyncMessage(`Sync failed: ${e.message}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Upload Media File for Gallery / CEO Portrait
  const handleFileUpload = async (file: File, target: 'gallery' | 'ceo') => {
    setMediaUploadLoading(true);
    const formData = new FormData();
    formData.append('mediaFile', file);

    try {
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.fileUrl) {
        if (target === 'gallery') {
          setEditingGalleryItem((prev) => ({
            ...prev,
            mediaUrl: data.fileUrl,
            mediaType: file.type.startsWith('video') ? 'video' : 'image',
          }));
        } else if (target === 'ceo') {
          setSettingsForm((prev) => ({
            ...prev,
            ceoImageUrl: data.fileUrl,
          }));
        }
      }
    } catch (e) {
      console.error('File upload failed:', e);
    } finally {
      setMediaUploadLoading(false);
    }
  };

  // Services Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const res = await authFetch(`/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingService),
      });
      if (res.ok) {
        setEditingService(null);
        loadServices();
        refreshContent();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaveSuccess(false);

    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        updateSettingsLocally(settingsForm);
        setSettingsSaveSuccess(true);
        setTimeout(() => setSettingsSaveSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });

    if (pwdNew !== pwdConfirm) {
      setPwdMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }
    if (pwdNew.length < 8) {
      setPwdMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }

    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pwdCurrent, newPassword: pwdNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg({ text: 'Password successfully updated!', type: 'success' });
        setPwdCurrent('');
        setPwdNew('');
        setPwdConfirm('');
      } else {
        setPwdMsg({ text: data.error || 'Failed to update password.', type: 'error' });
      }
    } catch (e) {
      setPwdMsg({ text: 'Connection error while updating password.', type: 'error' });
    }
  };

  // Export Care Requests to CSV
  const exportRequestsToCsv = () => {
    if (careRequests.length === 0) return;
    const headers = [
      'RefCode',
      'Date',
      'ClientName',
      'Phone',
      'Email',
      'CareType',
      'Location',
      'Schedule',
      'Status',
      'AssignedStaff',
    ];
    const rows = careRequests.map((r) => [
      r.refCode,
      r.createdAt.split('T')[0],
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.phone,
      r.email,
      `"${r.careType}"`,
      `"${r.cityLga}"`,
      `"${r.careScheduleType}"`,
      r.status,
      `"${r.assignedStaff || 'Unassigned'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AFNAAN_Care_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F3F8F9] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#075765] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm">AFNAAN Admin</span>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="text-xs text-[#C9A45C] hover:text-white"
        >
          View Website
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#075765] text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/10 flex flex-col gap-3">
            <div className="bg-white p-2 rounded-xl max-w-[180px]">
              <ImageWithFallback
                src={settings.logoUrl}
                alt="AFNAAN Logo"
                className="h-9 w-auto object-contain"
                fallbackText="AFNAAN Care"
                fallbackIcon={<HeartHandshake className="w-5 h-5 text-[#075765]" />}
                fallbackClassName="h-8 text-[#075765] font-bold text-xs flex items-center"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">Admin Workspace</p>
              <p className="text-[11px] text-gray-300 truncate">{admin?.email}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              {
                id: 'requests',
                label: 'Care Requests',
                icon: <HeartHandshake className="w-4 h-4" />,
                badge: dashboardStats.newCareRequests > 0 ? dashboardStats.newCareRequests : null,
              },
              {
                id: 'applications',
                label: 'Caregiver Applications',
                icon: <UserCheck className="w-4 h-4" />,
                badge: dashboardStats.pendingApplications > 0 ? dashboardStats.pendingApplications : null,
              },
              { id: 'gallery', label: 'Impact & Media Gallery', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'services', label: 'Services Manager', icon: <Sparkles className="w-4 h-4" /> },
              {
                id: 'messages',
                label: 'Contact Messages',
                icon: <MessageSquare className="w-4 h-4" />,
                badge: dashboardStats.unreadMessages > 0 ? dashboardStats.unreadMessages : null,
              },
              { id: 'settings', label: 'Website Settings & CEO', icon: <Settings className="w-4 h-4" /> },
              { id: 'audit', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
              { id: 'security', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#10A8B7] text-white shadow-xs font-bold'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#C9A45C] text-[#075765] text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => onNavigate('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Website</span>
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-300 hover:text-red-100 hover:bg-red-500/20 flex items-center gap-2 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#075765]">
                Welcome back, {admin?.name || 'Administrator'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Here is a summary of real care requests, applications, and activity across AFNAAN Lagos operations.
              </p>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total Care Requests
                </span>
                <p className="text-2xl font-extrabold text-[#075765] mt-2">
                  {dashboardStats.totalCareRequests}
                </p>
                <span className="text-[11px] text-[#10A8B7] font-semibold">Submitted clients</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  New Care Requests
                </span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-2">
                  {dashboardStats.newCareRequests}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold">Awaiting assessment</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Pending Applications
                </span>
                <p className="text-2xl font-extrabold text-amber-700 mt-2">
                  {dashboardStats.pendingApplications}
                </p>
                <span className="text-[11px] text-amber-600 font-semibold">Under staff review</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Published Impact Items
                </span>
                <p className="text-2xl font-extrabold text-[#075765] mt-2">
                  {dashboardStats.totalPublishedGallery}
                </p>
                <span className="text-[11px] text-gray-500 font-semibold">Live stories &amp; media</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs col-span-2 md:col-span-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Unread Messages
                </span>
                <p className="text-2xl font-extrabold text-blue-700 mt-2">
                  {dashboardStats.unreadMessages}
                </p>
                <span className="text-[11px] text-blue-600 font-semibold">Incoming enquiries</span>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#075765]">Need to manage records?</h3>
                <p className="text-xs text-gray-500">Jump directly to reviewing pending clients or add an impact story.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="bg-[#075765] hover:bg-[#05434e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  View Care Requests
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="bg-[#10A8B7] hover:bg-[#0da0ae] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Review Applications
                </button>
                <button
                  onClick={() => {
                    setEditingGalleryItem({
                      title: '',
                      category: 'Care in Action',
                      mediaType: 'image',
                      mediaUrl: '',
                      caption: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      location: 'Lagos, Nigeria',
                      isPublished: true,
                    });
                    setShowGalleryModal(true);
                  }}
                  className="border border-[#075765] text-[#075765] hover:bg-[#075765] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Impact Media</span>
                </button>
              </div>
            </div>

            {/* Recent Administrative Activity Log */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#075765] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#10A8B7]" />
                  <span>Recent Administrative Activity</span>
                </h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-[#10A8B7] hover:underline font-semibold"
                >
                  View Full Audit
                </button>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {recentLogs.length === 0 ? (
                  <p className="p-6 text-center text-gray-400">No activity logged yet.</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-gray-800">{log.action}</p>
                        <p className="text-gray-500 mt-0.5">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-gray-400 block">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-[#075765] font-mono">{log.adminEmail}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CARE REQUESTS ================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#075765]">Care Request Management</h1>
                <p className="text-xs text-gray-500">
                  Review and update home care enquiries submitted by families.
                </p>
              </div>
              <button
                onClick={exportRequestsToCsv}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start"
              >
                <Download className="w-4 h-4 text-[#075765]" />
                <span>Export to CSV</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ref, client name, phone..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#10A8B7]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500">Status:</span>
                <select
                  value={requestFilterStatus}
                  onChange={(e) => setRequestFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none"
                >
                  {['All', 'New', 'Contacted', 'Assessment', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadCareRequests}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Care Requests Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#F3F8F9] text-[#075765] uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Ref Code</th>
                    <th className="p-4">Client Contact</th>
                    <th className="p-4">Care Type</th>
                    <th className="p-4">Location (Lagos)</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {careRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No care requests match the current filters.
                      </td>
                    </tr>
                  ) : (
                    careRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#075765]">{req.refCode}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{req.fullName}</p>
                          <p className="text-gray-500 text-[11px]">{req.phone}</p>
                          <p className="text-gray-400 text-[10px]">{req.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-gray-800">{req.careType}</span>
                          <span className="block text-[10px] text-gray-500">For: {req.careForWhom}</span>
                        </td>
                        <td className="p-4 text-gray-600">{req.cityLga}</td>
                        <td className="p-4">
                          <span className="block text-gray-700">{req.careScheduleType}</span>
                          <span className="text-[10px] text-gray-400">{req.startDate || 'Immediate'}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'New'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Contacted'
                                ? 'bg-blue-100 text-blue-800'
                                : req.status === 'Assessment'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'Completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-2.5 py-1 rounded-lg bg-[#075765] text-white font-bold text-[11px] hover:bg-[#05434e]"
                          >
                            Details
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'request',
                                id: req.id,
                                title: `Care Request ${req.refCode} (${req.fullName})`,
                              })
                            }
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Request Details Drawer Modal */}
            {selectedRequest && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setSelectedRequest(null)}
              >
                <div
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Enquiry Reference
                      </span>
                      <h2 className="text-xl font-bold text-[#075765] font-mono">
                        {selectedRequest.refCode}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="p-1.5 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F3F8F9]">
                      <p className="text-gray-400 font-bold uppercase text-[10px]">Client Name</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedRequest.fullName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F3F8F9]">
                      <p className="text-gray-400 font-bold uppercase text-[10px]">Phone Number</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedRequest.phone}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F3F8F9]">
                      <p className="text-gray-400 font-bold uppercase text-[10px]">Email Address</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedRequest.email}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F3F8F9]">
                      <p className="text-gray-400 font-bold uppercase text-[10px]">Preferred Contact</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedRequest.contactMethod}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-[#075765] uppercase tracking-wider text-[11px]">
                      Care Requirements
                    </h4>
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                      <p><strong>Service:</strong> {selectedRequest.careType}</p>
                      <p><strong>Arrangement:</strong> {selectedRequest.careScheduleType}</p>
                      <p><strong>Care For:</strong> {selectedRequest.careForWhom} ({selectedRequest.ageGroup})</p>
                      <p><strong>Preferred Caregiver Gender:</strong> {selectedRequest.preferredGender}</p>
                      <p><strong>Language:</strong> {selectedRequest.preferredLanguage}</p>
                      <p><strong>Location:</strong> {selectedRequest.cityLga}, {selectedRequest.state}</p>
                      <p><strong>Schedule:</strong> {selectedRequest.preferredDays} | {selectedRequest.preferredTime}</p>
                      {selectedRequest.description && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="font-bold text-gray-700">Client Description &amp; Notes:</p>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">{selectedRequest.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff Status & Internal Notes update */}
                  <div className="space-y-4 pt-2 border-t border-gray-100 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                          Update Request Status
                        </label>
                        <select
                          value={selectedRequest.status}
                          onChange={(e) =>
                            handleUpdateRequest(selectedRequest.id, { status: e.target.value as any })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-[#075765]"
                        >
                          {['New', 'Contacted', 'Assessment', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                          Assigned Care Coordinator / Nurse
                        </label>
                        <input
                          type="text"
                          value={selectedRequest.assignedStaff || ''}
                          onChange={(e) =>
                            handleUpdateRequest(selectedRequest.id, { assignedStaff: e.target.value })
                          }
                          placeholder="e.g. Nurse Amina"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                        Private Internal Notes (Confidential to staff)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedRequest.internalNotes || ''}
                        onChange={(e) =>
                          handleUpdateRequest(selectedRequest.id, { internalNotes: e.target.value })
                        }
                        placeholder="Log phone calls, assessment observations, caregiver matching notes..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: CAREGIVER APPLICATIONS ================= */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Caregiver &amp; Nurse Recruitment</h1>
              <p className="text-xs text-gray-500">
                Review candidate credentials, access uploaded CVs, and manage hiring statuses.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate name, role, ref..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#10A8B7]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500">Status:</span>
                <select
                  value={appFilterStatus}
                  onChange={(e) => setAppFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  {['All', 'New', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Not Selected'].map(
                    (st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    )
                  )}
                </select>
                <button onClick={loadApplications} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#F3F8F9] text-[#075765] uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">App Ref</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Role Applied</th>
                    <th className="p-4">Experience</th>
                    <th className="p-4">CV Document</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#075765]">{app.refCode}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{app.fullName}</p>
                          <p className="text-gray-500 text-[11px]">{app.phone}</p>
                          <p className="text-gray-400 text-[10px]">{app.location}</p>
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{app.preferredRole}</td>
                        <td className="p-4 text-gray-600">{app.experience}</td>
                        <td className="p-4">
                          {app.cvFileName ? (
                            <button
                              onClick={() => handleDownloadCv(app.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#075765]/10 text-[#075765] hover:bg-[#075765] hover:text-white font-bold transition-all"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Download CV</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">No file</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.status === 'New'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800'
                                : app.status === 'Shortlisted'
                                ? 'bg-blue-100 text-blue-800'
                                : app.status === 'Interview'
                                ? 'bg-purple-100 text-purple-800'
                                : app.status === 'Accepted'
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-2.5 py-1 rounded-lg bg-[#075765] text-white font-bold text-[11px]"
                          >
                            Review
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'application',
                                id: app.id,
                                title: `Application ${app.refCode} (${app.fullName})`,
                              })
                            }
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Candidate Modal */}
            {selectedApp && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setSelectedApp(null)}
              >
                <div
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Applicant Profile
                      </span>
                      <h2 className="text-xl font-bold text-[#075765]">
                        {selectedApp.fullName} &bull; <span className="font-mono text-sm">{selectedApp.refCode}</span>
                      </h2>
                    </div>
                    <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <p><strong>Role:</strong> {selectedApp.preferredRole}</p>
                    <p><strong>Phone:</strong> {selectedApp.phone}</p>
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Location:</strong> {selectedApp.location}</p>
                    <p><strong>Experience:</strong> {selectedApp.experience}</p>
                    <p><strong>Availability:</strong> {selectedApp.availability}</p>
                    <p><strong>Arrangement:</strong> {selectedApp.employmentType}</p>
                    <p><strong>Qualifications:</strong> {selectedApp.qualifications || 'Standard'}</p>
                  </div>

                  {selectedApp.personalStatement && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                      <p className="font-bold text-gray-700 mb-1">Personal Statement:</p>
                      <p className="text-gray-600 italic whitespace-pre-wrap">{selectedApp.personalStatement}</p>
                    </div>
                  )}

                  {selectedApp.cvFileName && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3F8F9] border border-gray-200 text-xs">
                      <span className="font-medium text-gray-700">Uploaded CV: {selectedApp.cvOriginalName}</span>
                      <button
                        onClick={() => handleDownloadCv(selectedApp.id)}
                        className="bg-[#075765] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CV</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-4 pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                        Application Status
                      </label>
                      <select
                        value={selectedApp.status}
                        onChange={(e) =>
                          handleUpdateApplication(selectedApp.id, { status: e.target.value as any })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-[#075765] bg-white"
                      >
                        {['New', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Not Selected'].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                        Internal Candidate Evaluation Notes
                      </label>
                      <textarea
                        rows={3}
                        value={selectedApp.internalNotes || ''}
                        onChange={(e) =>
                          handleUpdateApplication(selectedApp.id, { internalNotes: e.target.value })
                        }
                        placeholder="Document interview feedback, reference checks, verification results..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: IMPACT & MEDIA GALLERY ================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#075765]">Impact &amp; Media Gallery</h1>
                <p className="text-xs text-gray-500">
                  Manage real photographs, community outreach videos, and client stories.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGalleryItem({
                    title: '',
                    category: 'Care in Action',
                    mediaType: 'image',
                    mediaUrl: '',
                    caption: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    location: 'Lagos, Nigeria',
                    isPublished: true,
                  });
                  setShowGalleryModal(true);
                }}
                className="bg-[#075765] hover:bg-[#05434e] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4 text-[#C9A45C]" />
                <span>Add New Gallery Item</span>
              </button>
            </div>

            {/* Gallery Grid in Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-gray-100">
                    <ImageWithFallback
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      fallbackText={item.title}
                    />
                    <div className="absolute top-2 left-2 bg-[#075765]/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-[#075765] text-sm">{item.title}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.caption}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{item.location}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingGalleryItem(item);
                            setShowGalleryModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'gallery',
                              id: item.id,
                              title: item.title,
                            })
                          }
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Modal (Create / Edit) */}
            {showGalleryModal && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setShowGalleryModal(false)}
              >
                <form
                  onSubmit={handleSaveGallery}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-[#075765] text-lg">
                      {editingGalleryItem?.id ? 'Edit Impact Media' : 'Add New Impact Media'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowGalleryModal(false)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingGalleryItem?.title || ''}
                      onChange={(e) =>
                        setEditingGalleryItem((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={editingGalleryItem?.category || 'Care in Action'}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        {[
                          'Care in Action',
                          'Our Team',
                          'Training and Development',
                          'Community Engagement',
                          'Company News',
                          'Client Stories',
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Media Type
                      </label>
                      <select
                        value={editingGalleryItem?.mediaType || 'image'}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({
                            ...prev,
                            mediaType: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        <option value="image">Photograph (Image)</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  {/* Validation Error Banner */}
                  {galleryError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{galleryError}</span>
                    </div>
                  )}

                  {/* MEDIA CONTENT INPUT - Conditionally Rendered by Media Type */}
                  {(editingGalleryItem?.mediaType || 'image') === 'image' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700 uppercase">
                          Upload Image from Device (No link needed) *
                        </label>
                        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                          <button
                            type="button"
                            onClick={() => setGalleryImageTab('upload')}
                            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                              galleryImageTab === 'upload'
                                ? 'bg-[#075765] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalleryImageTab('url')}
                            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                              galleryImageTab === 'url'
                                ? 'bg-[#075765] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Paste Link
                          </button>
                        </div>
                      </div>

                      {galleryImageTab === 'upload' ? (
                        <div>
                          {editingGalleryItem?.mediaUrl ? (
                            <div className="p-3.5 rounded-2xl bg-[#F3F8F9] border border-gray-200 flex items-center gap-4">
                              <img
                                src={editingGalleryItem.mediaUrl}
                                alt="Selected Image"
                                className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                              />
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                                  <Check className="w-4 h-4 text-emerald-600" />
                                  <span>Image Ready to Publish</span>
                                </div>
                                <p className="text-[11px] text-gray-500 truncate font-mono">
                                  {editingGalleryItem.mediaUrl}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 text-[11px] font-semibold hover:bg-gray-50 flex items-center gap-1 shadow-2xs">
                                    <Upload className="w-3 h-3 text-[#10A8B7]" />
                                    <span>Change Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleFileUpload(e.target.files[0], 'gallery');
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingGalleryItem((prev) => ({ ...prev, mediaUrl: '' }))
                                    }
                                    className="text-red-500 text-[11px] hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-[#10A8B7]/40 hover:border-[#075765] bg-[#F3F8F9]/60 hover:bg-[#F3F8F9] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                              <UploadCloud className="w-9 h-9 text-[#10A8B7] group-hover:scale-110 transition-transform mb-2" />
                              <span className="text-xs font-bold text-[#075765]">
                                {mediaUploadLoading
                                  ? 'Uploading Image to Server...'
                                  : 'Click to Upload Image from Phone or Computer'}
                              </span>
                              <span className="text-[11px] text-gray-500 mt-1">
                                Supports JPG, PNG, WEBP, GIF. Upload directly without any link!
                              </span>
                              {mediaUploadLoading && (
                                <span className="mt-2 text-xs text-[#075765] flex items-center gap-1 font-semibold">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving image...
                                </span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(e.target.files[0], 'gallery');
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingGalleryItem?.mediaUrl || ''}
                            onChange={(e) => {
                              const cleaned = extractCleanImageUrl(e.target.value);
                              setEditingGalleryItem((prev) => ({
                                ...prev,
                                mediaUrl: cleaned,
                              }));
                            }}
                            placeholder="Paste image URL or ImgBB code (e.g. https://i.ibb.co/...)"
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                          />
                          <p className="text-[11px] text-gray-500">
                            Smart detection: works even if you paste HTML embed codes (e.g. from ImgBB).
                          </p>
                          {editingGalleryItem?.mediaUrl && (
                            <div className="flex items-center gap-3 pt-1">
                              <img
                                src={editingGalleryItem.mediaUrl}
                                alt="Preview"
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  (e.currentTarget as any).style.display = 'none';
                                }}
                              />
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> URL parsed successfully
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Video Section: Accept YouTube and Google Drive Links */
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        Video Link (YouTube or Google Drive) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingGalleryItem?.mediaUrl || ''}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({ ...prev, mediaUrl: e.target.value }))
                        }
                        placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />

                      {/* Video Format Detection Badge */}
                      {editingGalleryItem?.mediaUrl ? (
                        (() => {
                          const parsed = parseVideoUrl(editingGalleryItem.mediaUrl);
                          if (parsed.isValid) {
                            return (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>
                                    Valid {parsed.platform === 'youtube' ? 'YouTube' : parsed.platform === 'googledrive' ? 'Google Drive' : 'Direct'} Video Detected
                                  </span>
                                </div>
                                {parsed.platform === 'googledrive' && (
                                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                                    <strong>Google Drive Sharing:</strong> Make sure the video in your Google Drive has General access set to <strong>"Anyone with the link can view"</strong> so all visitors can play it without permission errors.
                                  </p>
                                )}
                                {parsed.thumbnailUrl && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <img
                                      src={parsed.thumbnailUrl}
                                      alt="YouTube Thumbnail"
                                      className="h-12 w-20 object-cover rounded border border-emerald-300 shadow-2xs"
                                    />
                                    <span className="text-[11px] text-emerald-700 font-medium">
                                      YouTube video verified
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="font-bold">Paste a link from YouTube or Google Drive:</span>
                                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-700">
                                  <li>YouTube: <code className="font-mono">https://www.youtube.com/watch?v=...</code> or <code className="font-mono">https://youtu.be/...</code></li>
                                  <li>Google Drive: <code className="font-mono">https://drive.google.com/file/d/FILE_ID/view</code></li>
                                </ul>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                          <span className="font-bold text-[#075765] block">Supported Video Links:</span>
                          <p className="text-[11px] text-gray-500">
                            &bull; <strong>YouTube:</strong> Standard video, shortened youtu.be, or YouTube shorts.
                          </p>
                          <p className="text-[11px] text-gray-500">
                            &bull; <strong>Google Drive:</strong> Shareable view links with "Anyone with the link can view" access.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Caption / Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingGalleryItem?.caption || ''}
                      onChange={(e) =>
                        setEditingGalleryItem((prev) => ({ ...prev, caption: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingGalleryItem?.location || ''}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="e.g. Orile Agege, Lagos"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editingGalleryItem?.date || ''}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({ ...prev, date: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingGalleryItem?.isPublished !== false}
                        onChange={(e) =>
                          setEditingGalleryItem((prev) => ({ ...prev, isPublished: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#075765] rounded"
                      />
                      <span>Publish immediately on public website</span>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGalleryModal(false)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#075765] hover:bg-[#05434e] text-white text-xs font-bold shadow-md"
                    >
                      Save Gallery Item
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: SERVICES MANAGER ================= */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Care Services Content Editor</h1>
              <p className="text-xs text-gray-500">
                Customise service descriptions, benefits, and support examples presented to visitors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white bg-[#075765] px-2.5 py-0.5 rounded-full">
                        {service.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          service.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {service.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#075765]">{service.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{service.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Order #{service.sortOrder}</span>
                    <button
                      onClick={() => setEditingService(service)}
                      className="px-3 py-1.5 rounded-lg bg-[#075765] text-white text-xs font-bold hover:bg-[#05434e] flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Edit Modal */}
            {editingService && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setEditingService(null)}
              >
                <form
                  onSubmit={handleSaveService}
                  className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-[#075765] text-lg">Edit {editingService.title}</h3>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Service Title
                    </label>
                    <input
                      type="text"
                      value={editingService.title}
                      onChange={(e) =>
                        setEditingService((prev: any) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Summary (Shown on cards)
                    </label>
                    <textarea
                      rows={2}
                      value={editingService.summary}
                      onChange={(e) =>
                        setEditingService((prev: any) => ({ ...prev, summary: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Full Description (Detailed page)
                    </label>
                    <textarea
                      rows={3}
                      value={editingService.fullDescription}
                      onChange={(e) =>
                        setEditingService((prev: any) => ({
                          ...prev,
                          fullDescription: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Who May Benefit
                    </label>
                    <input
                      type="text"
                      value={editingService.whoMayBenefit}
                      onChange={(e) =>
                        setEditingService((prev: any) => ({
                          ...prev,
                          whoMayBenefit: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#075765] hover:bg-[#05434e] text-white text-xs font-bold"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: CONTACT MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Contact Enquiries</h1>
              <p className="text-xs text-gray-500">
                Messages submitted through the public Contact Us page.
              </p>
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-400">
                  No contact messages received yet.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-white rounded-2xl border p-6 shadow-xs space-y-3 transition-colors ${
                      !msg.isRead ? 'border-[#10A8B7] bg-cyan-50/20' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{msg.fullName}</h4>
                          {!msg.isRead && (
                            <span className="px-2 py-0.5 rounded-full bg-[#10A8B7] text-white text-[10px] font-bold">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {msg.email} {msg.phone ? `&bull; ${msg.phone}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={async () => {
                            await authFetch(`/api/admin/contact-messages/${msg.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ isRead: !msg.isRead }),
                            });
                            loadMessages();
                            loadStats();
                          }}
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px]"
                        >
                          {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'message',
                              id: msg.id,
                              title: `Message from ${msg.fullName}`,
                            })
                          }
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-[#075765]">{msg.subject}</p>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 7: WEBSITE SETTINGS & CEO PROFILE ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Website Settings &amp; CEO Profile</h1>
              <p className="text-xs text-gray-500">
                Update leadership biography, official contact channels, logo, and address.
              </p>
            </div>

            {settingsSaveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Website settings saved successfully and live on public site!</span>
              </div>
            )}

            <form
              onSubmit={handleSaveSettings}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-gray-200 space-y-8"
            >
              {/* CEO Profile Card */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#075765] border-b border-gray-100 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#10A8B7]" />
                  <span>CEO Profile &amp; Portrait</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      CEO Legal Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.ceoName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, ceoName: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      CEO Title
                    </label>
                    <input
                      type="text"
                      value={settingsForm.ceoTitle}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, ceoTitle: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    CEO Portrait Photograph (Upload or Image URL)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="url"
                      value={settingsForm.ceoImageUrl || ''}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, ceoImageUrl: e.target.value }))
                      }
                      placeholder="Image URL or use file upload..."
                      className="flex-1 w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#075765]" />
                      <span>Upload CEO Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], 'ceo');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Authentic photo of IMRAN MUTOLIB ADEIZA will appear in the founder section on the homepage.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    CEO Biography
                  </label>
                  <textarea
                    rows={4}
                    value={settingsForm.ceoBio}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, ceoBio: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Business Identity & Channels */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#075765] border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#10A8B7]" />
                  <span>Business Location &amp; Contact Links</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.businessName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, businessName: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      WhatsApp Link (e.g. https://wa.me/2349162285884)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.whatsappUrl}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, whatsappUrl: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      WhatsApp Display Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappDisplay}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, whatsappDisplay: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.businessAddress}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, businessAddress: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Homepage Headline & SEO */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#075765] border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#10A8B7]" />
                  <span>Homepage Copy &amp; SEO Meta</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Hero Headline
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroHeadline}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, heroHeadline: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.seoDescription}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#075765] hover:bg-[#05434e] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md"
                >
                  Save Settings &amp; Update Live Site
                </button>
              </div>
            </form>

            {/* Supabase & API Keys Reference Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#10A8B7]" />
                  <h3 className="text-base font-bold text-[#075765]">
                    Supabase Database &amp; API Keys Synchronization
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={checkSupabaseStatus}
                    disabled={isTestingSupabase}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                    <span>Test Supabase Connection</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleManualSupabaseSync}
                    disabled={isTestingSupabase}
                    className="px-3 py-1.5 rounded-lg bg-[#075765] hover:bg-[#05434e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>Sync All Data to Supabase</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {supabaseStatus && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    supabaseStatus.connected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {supabaseStatus.connected ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold">
                      {supabaseStatus.connected
                        ? 'Connected to Supabase PostgreSQL Database'
                        : 'Supabase Connection Notice'}
                    </span>
                    <p className="text-[11px] leading-relaxed">{supabaseStatus.message}</p>
                  </div>
                </div>
              )}

              {supabaseSyncMessage && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{supabaseSyncMessage}</span>
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                Every new care request, job application, contact message, and gallery update is automatically mirrored to your connected <strong>Supabase</strong> tables in real time.
              </p>

              <div className="p-4 rounded-xl bg-[#F3F8F9] border border-gray-200 space-y-2 text-xs font-mono text-gray-800">
                <div className="text-[11px] text-gray-500 font-sans font-bold uppercase tracking-wider mb-1">
                  File: /.env (Root Directory)
                </div>
                <div className="text-[#075765] font-bold">SUPABASE_URL="https://your-project-id.supabase.co"</div>
                <div className="text-[#075765] font-bold">SUPABASE_ANON_KEY="your_supabase_anon_public_key"</div>
                <div className="text-[#075765] font-bold">SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"</div>
                <div className="text-emerald-700">GEMINI_API_KEY="your_gemini_api_key_here"</div>
                <div className="text-gray-600">WHATSAPP_NUMBER="09162285884"</div>
              </div>

              <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
                <p>
                  &bull; <strong>Database Setup:</strong> Run the complete SQL queries found in <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">/supabase_schema.sql</code> inside your Supabase <strong>SQL Editor</strong> to create all tables (care requests, caregiver applications, contact messages, services, gallery, testimonials, audit logs).
                </p>
                <p>
                  &bull; <strong>Automatic Sync:</strong> When Supabase is configured in <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">.env</code>, all gallery uploads, service changes, and client care requests reflect directly in your Supabase database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: AUDIT LOGS ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Administrative Audit Trail</h1>
              <p className="text-xs text-gray-500">
                Automated security log recording all logins, content updates, status changes, and media uploads.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#F3F8F9] text-[#075765] uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Admin Email</th>
                    <th className="p-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-[#075765]">{log.action}</td>
                      <td className="p-4 font-sans text-gray-700">{log.details}</td>
                      <td className="p-4 text-gray-600">{log.adminEmail}</td>
                      <td className="p-4 text-gray-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 9: SECURITY & PASSWORD ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
            <div>
              <h1 className="text-2xl font-extrabold text-[#075765]">Security &amp; Password</h1>
              <p className="text-xs text-gray-500">
                Change your administrative password. Uses secure server-side scrypt hashing with random salt.
              </p>
            </div>

            {pwdMsg.text && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {pwdMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  New Password * (Min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#075765] hover:bg-[#05434e] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  Update Admin Password
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Reusable Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900 text-base">Confirm Deletion</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete <strong>{deleteConfirmation.title}</strong>? This action will be logged in the administrative audit log.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
