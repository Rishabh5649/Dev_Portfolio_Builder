import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
              DP
            </div>
            <a href="/" className="text-xl font-bold hover:text-blue-400 transition">
              DevPortfolio
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/portfolio-builder')}
                  className="hover:text-blue-400 transition text-sm"
                >
                  Build
                </button>
                <button
                  onClick={() => navigate('/resume-builder')}
                  className="hover:text-blue-400 transition text-sm"
                >
                  Resume
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="hover:text-blue-400 transition text-sm"
                >
                  Settings
                </button>
                <div className="flex items-center space-x-3 border-l border-slate-700 pl-6">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-slate-800 rounded transition"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-blue-400 transition text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate('/portfolio-builder');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-800 transition"
                >
                  Build Portfolio
                </button>
                <button
                  onClick={() => {
                    navigate('/resume-builder');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-800 transition"
                >
                  Build Resume
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-800 transition"
                >
                  Settings
                </button>
                <div className="px-4 py-2 border-t border-slate-700 mt-2 pt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-2 py-1 hover:bg-slate-800 rounded transition text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-800 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-slate-800 transition bg-blue-500 mx-4 rounded"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
