import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { PrivacySessionProvider } from './context/PrivacySessionContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AIPlaygroundPage } from './pages/AIPlaygroundPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { VerificationSuitePage } from './pages/VerificationSuitePage';
import type { NavTab } from './types';

function WorkspaceShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const syncCollapse = (matches: boolean) => {
      setSidebarCollapsed(matches);
    };
    const handleChange = (e: MediaQueryListEvent) => syncCollapse(e.matches);
    syncCollapse(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E6E8F0] text-xs font-medium text-[#5E6478] dark:bg-[#0D0F18] dark:text-[#B0B5C9]">
        Initializing PII GUARD workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="relative flex min-h-screen bg-[#E6E8F0] text-[#131420] transition-colors duration-200 dark:bg-[#0D0F18] dark:text-[#E6E8F0]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar activeTab={activeTab} />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 focus:outline-none sm:p-6">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardPage
                    onOpenWorkspace={() => setActiveTab('workspace')}
                    onOpenVerification={() => setActiveTab('verification')}
                  />
                )}
                {activeTab === 'workspace' && <AIPlaygroundPage />}
                {activeTab === 'analytics' && (
                  <AnalyticsPage onOpenWorkspace={() => setActiveTab('workspace')} />
                )}
                {activeTab === 'verification' && <VerificationSuitePage />}
                {activeTab === 'settings' && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>
          <DemoModeProvider>
            <AuthProvider>
              <PrivacySessionProvider>
                <WorkspaceShell />
              </PrivacySessionProvider>
            </AuthProvider>
          </DemoModeProvider>
        </ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
