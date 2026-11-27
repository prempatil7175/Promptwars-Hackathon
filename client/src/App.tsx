import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { ToastProvider } from './context/ToastContext';
import { buildClientMockAiResponse, PROMPT_PRESETS } from './data/mockData';
import { AIPlaygroundPage } from './pages/AIPlaygroundPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AiGenerateResponse, AiRunHistoryItem, NavTab } from './types';

function WorkspaceShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<AiRunHistoryItem[]>(() => [
    {
      id: 'seed-run-1',
      prompt: PROMPT_PRESETS[0].prompt,
      timestamp: 'Just now',
      result: buildClientMockAiResponse(PROMPT_PRESETS[0].prompt, 'Pre-seeded initial output'),
    },
  ]);

  const handleRunComplete = (prompt: string, result: AiGenerateResponse) => {
    setHistory((prev) => [
      {
        id: `run-${Date.now()}`,
        prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result,
      },
      ...prev.slice(0, 9),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-xs text-zinc-400">
        Initializing workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeTab={activeTab}
          onQuickPlayground={() => setActiveTab('playground')}
        />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardPage onRunComplete={handleRunComplete} />
                )}
                {activeTab === 'playground' && (
                  <AIPlaygroundPage history={history} onRunComplete={handleRunComplete} />
                )}
                {activeTab === 'analytics' && <AnalyticsPage />}
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
    <ToastProvider>
      <DemoModeProvider>
        <AuthProvider>
          <WorkspaceShell />
        </AuthProvider>
      </DemoModeProvider>
    </ToastProvider>
  );
}
