import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileLock2,
  LayoutDashboard,
  Lock,
  Settings,
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
      className={`relative z-30 flex shrink-0 flex-col overflow-visible border-r border-[#2E314A] bg-[#131420] text-[#E6E8F0] transition-all duration-200 ${
        collapsed ? 'w-[60px] sm:w-[72px]' : 'w-60 lg:w-64'
      }`}
    >
      {/* Border-mounted collapse/expand toggle seated above header stacking context */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3.5 top-[18px] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-[#D8DCE8] bg-white text-[#131420] shadow-md transition-all hover:border-[#5A45F5] hover:bg-[#F4F5FA] active:scale-[0.96] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-white dark:hover:border-[#5A45F5] dark:hover:bg-[#23263B]"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      {/* Brand header */}
      <div
        className={`flex h-16 items-center border-b border-[#2E314A] ${
          collapsed ? 'justify-center px-2' : 'justify-start px-4'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-white"
          >
            <rect
              x="2.5"
              y="2.5"
              width="14"
              height="14"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <rect
              x="11.5"
              y="11.5"
              width="14"
              height="14"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
          </svg>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-brand truncate text-sm font-bold tracking-tight text-white">
                PII GUARD
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#B0B5C9]">
                Privacy Platform
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2.5 sm:p-3" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-[#5A45F5] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)]'
                  : 'font-medium text-[#E6E8F0] hover:bg-[#1B1D2E] hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-[#B0B5C9]'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-2xl border border-[#2E314A] bg-[#1B1D2E] p-3.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
            <Lock className="h-3.5 w-3.5 text-[#B0B5C9]" aria-hidden="true" />
            Local-Only Engine
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#B0B5C9]">
            Documents never leave browser memory. Press{' '}
            <kbd className="rounded border border-[#2E314A] bg-[#131420] px-1 py-0.5 font-mono text-[10px] text-[#E6E8F0]">
              Ctrl+Shift+D
            </kbd>{' '}
            to toggle Demo Mode.
          </p>
        </div>
      )}
    </aside>
  );
}
