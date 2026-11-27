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
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#D8DCE8] bg-white text-[#131420] transition hover:bg-[#F4F5FA] active:scale-[0.97] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-[#E6E8F0] dark:hover:border-[#5A45F5] dark:hover:bg-[#23263B]"
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-[#A5B4FC]" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 text-[#5E6478]" aria-hidden="true" />
      )}
    </button>
  );
}
