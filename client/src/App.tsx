import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { PrivacySessionProvider } from './context/PrivacySessionContext';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-xs text-zinc-400">
        Initializing PII GUARD workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100">
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
        <TopBar
          activeTab={activeTab}
          onQuickWorkspace={() => setActiveTab('workspace')}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-6 focus:outline-none">
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
      <ToastProvider>
        <DemoModeProvider>
          <AuthProvider>
            <PrivacySessionProvider>
              <WorkspaceShell />
            </PrivacySessionProvider>
          </AuthProvider>
        </DemoModeProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
