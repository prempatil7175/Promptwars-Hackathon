import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileLock2,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import type { NavTab } from '../../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'workspace', label: 'Sanitization Workspace', Icon: FileLock2 },
  { id: 'analytics', label: 'Detection Analytics', Icon: BarChart3 },
  { id: 'verification', label: 'Verification Suite', Icon: CheckSquare },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-white/10 bg-[#0c0c10] transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-zinc-100">
                PII GUARD
              </p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                Privacy Platform
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              title={collapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-400'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            <Lock className="h-3.5 w-3.5" />
            Local-Only Engine
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
            Documents never leave browser memory. Press{' '}
            <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-zinc-200">
              Ctrl+Shift+D
            </kbd>{' '}
            to toggle Demo Mode.
          </p>
        </div>
      )}
    </aside>
  );
}
