import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, Building2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/firestore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserRole(profile?.role);
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setUserRole(null);
      }
    }
    fetchRole();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Heart className="h-8 w-8 text-brand-500 fill-brand-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">LifeLine</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Home</Link>
            <Link to="/search" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Find Blood</Link>
            <Link to="/camps" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Camps</Link>

            {currentUser ? (
              <>
                {userRole === 'organizer' ? (
                  <Link to="/organizer" className="text-slate-600 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    Organizer Portal
                  </Link>
                ) : userRole === 'hospital' ? (
                  <Link to="/hospital-dashboard" className="text-slate-600 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    Hospital Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Dashboard</Link>
                )}

                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors group"
                    title="Profile Settings"
                  >
                    <div className="bg-brand-100 p-1.5 rounded-full group-hover:bg-brand-200 transition-colors">
                      <User className="h-4 w-4 text-brand-600" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium transition-colors text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Home</Link>
            <Link to="/search" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Find Blood</Link>
            <Link to="/camps" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Donation Camps</Link>

            {currentUser ? (
              <>
                {userRole === 'organizer' ? (
                  <Link to="/organizer" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Organizer Portal</Link>
                ) : userRole === 'hospital' ? (
                  <Link to="/hospital-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Hospital Dashboard</Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Dashboard</Link>
                )}

                <div className="px-3 py-3 border-t border-slate-100 mt-2">
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-slate-600 mb-3 hover:text-brand-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{currentUser.displayName || currentUser.email}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-3 py-3 rounded-full text-base font-medium bg-brand-500 text-white hover:bg-brand-600 shadow-md">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
