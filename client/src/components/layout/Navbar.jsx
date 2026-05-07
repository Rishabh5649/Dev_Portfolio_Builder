import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, Palette, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard',         icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
  { to: '/portfolio-builder', icon: <Palette size={15} />,         label: 'Portfolio' },
  { to: '/resume-builder',    icon: <FileText size={15} />,        label: 'Resume' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DP';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
          <div className="navbar-logo">
            <div className="navbar-logo-mark">DP</div>
            <span>DevPortfolio</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        {user ? (
          <div className="navbar-links">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />

            <Link
              to="/settings"
              className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
              title="Settings"
            >
              <Settings size={15} />
            </Link>

            <div className="nav-user" onClick={() => {}} title={user.name} style={{ gap: 8 }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="nav-avatar">{initials}</div>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon"
              title="Sign Out"
              style={{ marginLeft: 4 }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}

        {/* Mobile Hamburger */}
        {user && (
          <button
            className="btn-icon"
            style={{ display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && user && (
        <div style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="divider" style={{ margin: '8px 0' }} />
          <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--danger)' }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
