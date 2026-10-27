import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContacts } from './components/FloatingContacts';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { RequestCaregiverPage } from './pages/RequestCaregiverPage';
import { ImpactPage } from './pages/ImpactPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { HeartHandshake, AlertCircle, Home } from 'lucide-react';

const getRouteFromLocation = (): string => {
  const hash = (window.location.hash || '').toLowerCase();
  if (hash === '#admin' || hash === '#/admin' || hash.startsWith('#admin') || hash.startsWith('#/admin')) {
    if (hash.includes('dashboard')) return '/admin/dashboard';
    if (hash.includes('login')) return '/admin/login';
    return '/admin';
  }
  const path = window.location.pathname || '/';
  return path;
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => getRouteFromLocation());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getRouteFromLocation());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/admin')) {
      if (path === '/admin/dashboard') {
        window.location.hash = 'admin/dashboard';
      } else if (path === '/admin/login') {
        window.location.hash = 'admin/login';
      } else {
        window.location.hash = 'admin';
      }
      setCurrentPath(path);
    } else {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('admin')) {
        window.history.pushState('', document.title, path);
      } else {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin routes protection
  if (currentPath === '/admin/dashboard') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#F3F8F9] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#075765] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#075765]">Validating Secure Session...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return <AdminLoginPage onNavigate={navigate} />;
    }
    return <AdminDashboardPage onNavigate={navigate} />;
  }

  if (currentPath === '/admin/login' || currentPath === '/admin') {
    if (isAuthenticated) {
      return <AdminDashboardPage onNavigate={navigate} />;
    }
    return <AdminLoginPage onNavigate={navigate} />;
  }

  // Render Public Pages
  const renderPublicPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/services':
      case '/what-we-do':
        return <ServicesPage onNavigate={navigate} />;
      case '/request-caregiver':
      case '/request':
        return <RequestCaregiverPage onNavigate={navigate} />;
      case '/impact':
      case '/our-impact':
        return <ImpactPage onNavigate={navigate} />;
      case '/careers':
      case '/become-a-caregiver':
        return <CareersPage onNavigate={navigate} />;
      case '/contact':
      case '/contact-us':
        return <ContactPage onNavigate={navigate} />;
      case '/privacy':
      case '/privacy-policy':
        return <PrivacyPolicyPage onNavigate={navigate} />;
      case '/terms':
      case '/terms-of-service':
        return <TermsPage onNavigate={navigate} />;
      case '/accessibility':
        return <AccessibilityPage onNavigate={navigate} />;
      default:
        // Custom 404 Page
        return (
          <div className="min-h-[70vh] bg-[#F3F8F9] flex items-center justify-center px-4 py-20 text-center">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 max-w-md w-full space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#10A8B7]/10 text-[#075765] flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-[#075765]" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#075765]">Page Not Found</h1>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                The page you are looking for does not exist or has been moved. You can return to our homepage or request a caregiver.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto bg-[#075765] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Homepage</span>
                </button>
                <button
                  onClick={() => navigate('/request-caregiver')}
                  className="w-full sm:w-auto bg-[#10A8B7] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  Request a Caregiver
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderPublicPage()}</main>
      <Footer onNavigate={navigate} />
      <FloatingContacts onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <AppRouter />
      </ContentProvider>
    </AuthProvider>
  );
}
