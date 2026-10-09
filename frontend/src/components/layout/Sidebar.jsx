import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Heart,
  Droplet,
  Hospital,
  ShieldAlert,
  ClipboardList,
  Building2,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

export const Sidebar = () => {
  const { role } = useAuth();

  const getLinks = () => {
    switch (role) {
      case ROLES.DONOR:
        return [
          { to: '/donor', label: 'My Donor Profile', icon: User, end: true },
          { to: '/donor/history', label: 'Donation History', icon: Heart },
          { to: '/notifications', label: 'Notifications', icon: Bell },
        ];
      case ROLES.PATIENT:
        return [
          { to: '/patient', label: 'My Blood Requests', icon: ClipboardList, end: true },
          { to: '/patient/new-request', label: 'Request Blood', icon: Droplet },
          { to: '/patient/profile', label: 'Patient Profile', icon: User },
          { to: '/patient/inventory-search', label: 'Search Inventory', icon: Search },
          { to: '/notifications', label: 'Notifications', icon: Bell },
        ];
      case ROLES.HOSPITAL:
        return [
          { to: '/hospital', label: 'Blood Inventory', icon: Droplet, end: true },
          { to: '/hospital/requests', label: 'Assigned Requests', icon: ClipboardList },
          { to: '/hospital/open-requests', label: 'Incoming Open Requests', icon: Search },
          { to: '/hospital/profile', label: 'Hospital Profile', icon: Hospital },
          { to: '/notifications', label: 'Notifications', icon: Bell },
        ];
      case ROLES.ADMIN:
        return [
          { to: '/admin', label: 'Pending Donors', icon: Heart, end: true },
          { to: '/admin/hospitals', label: 'Pending Hospitals', icon: Building2 },
          { to: '/admin/create-hospital', label: 'Create Hospital', icon: Hospital },
          { to: '/admin/open-requests', label: 'All Open Requests', icon: ClipboardList },
          { to: '/notifications', label: 'Notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-charcoal-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-charcoal-100">
        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
          {role} Workspace
        </span>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-crimson-50 text-crimson-700 font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
