import { Link } from 'react-router-dom';

export default function BottomNav({ active = 'dashboard' }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link
          to="/dashboard"
          className={`bottom-nav-item ${active === 'dashboard' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            dashboard
          </span>
          <span className="nav-label">Dashboard</span>
        </Link>

        <Link
          to="/attendance"
          className={`bottom-nav-item ${active === 'attendance' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            event_available
          </span>
          <span className="nav-label">Attendance</span>
        </Link>

        <Link
          to="/students/new"
          className={`bottom-nav-item ${active === 'add' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            person_add
          </span>
          <span className="nav-label">Add</span>
        </Link>

        <Link
          to="/settings"
          className={`bottom-nav-item ${active === 'settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            settings
          </span>
          <span className="nav-label">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
