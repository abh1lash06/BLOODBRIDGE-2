import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Droplet,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Hospital,
  Activity,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/api/notification.api';
import { ROLES } from '@/lib/constants';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unread notification count query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (role) {
      case ROLES.DONOR:
        return '/donor';
      case ROLES.PATIENT:
        return '/patient';
      case ROLES.HOSPITAL:
        return '/hospital';
      case ROLES.ADMIN:
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white border-b border-charcoal-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-crimson-600 flex items-center justify-center text-white shadow-sm group-hover:bg-crimson-700 transition-colors">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-charcoal-900">
                Blood<span className="text-crimson-600">Bridge</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-charcoal-600">
              <Link to="/about" className="hover:text-crimson-600 transition-colors">
                About
              </Link>
              <Link
                to="/how-it-works"
                className="hover:text-crimson-600 transition-colors"
              >
                How It Works
              </Link>
              {isAuthenticated && (
                <Link
                  to={getDashboardPath()}
                  className="text-crimson-600 hover:text-crimson-700 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User / Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-100 rounded-lg transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-crimson-600 text-[10px] font-bold text-white leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Pill */}
                <div className="flex items-center gap-3 pl-2 border-l border-charcoal-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-charcoal-900 leading-tight">
                      {user?.fullName || user?.email}
                    </p>
                    <p className="text-xs text-charcoal-500 font-medium">
                      {role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-charcoal-700 hover:text-charcoal-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-crimson-600 hover:bg-crimson-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-700 hover:text-crimson-600"
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-700 hover:text-crimson-600"
          >
            How It Works
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-crimson-600 hover:text-crimson-700"
              >
                Dashboard ({role})
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-charcoal-700 hover:text-crimson-600"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-crimson-100 text-crimson-700 font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </Link>
              <div className="pt-3 border-t border-charcoal-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-charcoal-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 rounded-lg"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-charcoal-200 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium text-charcoal-700 border border-charcoal-300 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium text-white bg-crimson-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
