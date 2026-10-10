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
  Heart,
  Building2,
  ClipboardList,
  Search,
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

  const getRoleLinks = () => {
    switch (role) {
      case ROLES.DONOR:
        return [
          { to: '/donor', label: 'My Donor Profile', icon: User },
          { to: '/donor/history', label: 'Donation History', icon: Heart },
        ];
      case ROLES.PATIENT:
        return [
          { to: '/patient', label: 'My Blood Requests', icon: ClipboardList },
          { to: '/patient/new-request', label: 'Request Blood', icon: Droplet },
          { to: '/patient/profile', label: 'Patient Profile', icon: User },
          { to: '/patient/inventory-search', label: 'Search Inventory', icon: Search },
        ];
      case ROLES.HOSPITAL:
        return [
          { to: '/hospital', label: 'Blood Inventory', icon: Droplet },
          { to: '/hospital/requests', label: 'Assigned Requests', icon: ClipboardList },
          { to: '/hospital/open-requests', label: 'Incoming Open Requests', icon: Search },
          { to: '/hospital/profile', label: 'Hospital Profile', icon: Hospital },
        ];
      case ROLES.ADMIN:
        return [
          { to: '/admin', label: 'Pending Donors', icon: Heart },
          { to: '/admin/hospitals', label: 'Pending Hospitals', icon: Building2 },
          { to: '/admin/create-hospital', label: 'Create Hospital', icon: Hospital },
          { to: '/admin/open-requests', label: 'All Open Requests', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white border-b border-charcoal-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          {/* Desktop User / Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-100 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
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
                    className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
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
                  className="text-sm font-medium text-charcoal-700 hover:text-charcoal-900 px-3 py-2 transition-colors min-h-[40px] flex items-center"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-crimson-600 hover:bg-crimson-700 px-4 py-2 rounded-lg transition-colors shadow-sm min-h-[40px] flex items-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls (Bell + Hamburger) */}
          <div className="flex md:hidden items-center gap-1">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2.5 text-charcoal-600 hover:text-charcoal-900 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-crimson-600 text-[10px] font-bold text-white leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 bg-white px-4 pt-3 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-1">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-charcoal-700 hover:text-crimson-600 hover:bg-charcoal-50"
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-charcoal-700 hover:text-crimson-600 hover:bg-charcoal-50"
            >
              How It Works
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {/* Role-tailored workspace navigation */}
              <div className="pt-2 border-t border-charcoal-100">
                <span className="px-3 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
                  {role} Workspace
                </span>
                <div className="space-y-1">
                  {getRoleLinks().map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-charcoal-700 hover:text-crimson-600 hover:bg-crimson-50/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-charcoal-500 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium text-charcoal-700 hover:text-crimson-600 hover:bg-crimson-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-charcoal-500 shrink-0" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-crimson-100 text-crimson-700 font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </Link>

              <div className="pt-3 border-t border-charcoal-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 truncate">
                    {user?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-charcoal-500 font-mono">{role}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 px-3.5 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors min-h-[38px] flex items-center"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-charcoal-200 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-medium text-charcoal-700 border border-charcoal-300 rounded-lg hover:bg-charcoal-50 min-h-[44px] flex items-center justify-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-medium text-white bg-crimson-600 hover:bg-crimson-700 rounded-lg min-h-[44px] flex items-center justify-center shadow-sm"
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
