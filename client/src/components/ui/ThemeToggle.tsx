import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#AFB4CE] bg-white text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0] active:scale-[0.97] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#8B93C9] dark:hover:bg-[#2E334B]"
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-[#A5B4FC]" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 text-[#4F5580]" aria-hidden="true" />
      )}
    </button>
  );
}
