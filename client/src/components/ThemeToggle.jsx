import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle button component
 * Displays 'dark_mode' or 'light_mode' icon with tactile feedback.
 */
export default function ThemeToggle({ className = '', style = {}, showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`nav-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        minWidth: '38px',
        ...style,
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: '19px',
          color: isDark ? 'var(--color-secondary-container)' : 'var(--color-primary-container)',
          transition: 'transform 0.25s ease, color 0.15s ease',
        }}
      >
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span style={{ fontSize: 'var(--font-size-xs)', marginLeft: '4px' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
