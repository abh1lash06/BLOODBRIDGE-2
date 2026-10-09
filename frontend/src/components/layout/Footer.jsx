import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Shield, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center text-white">
                <Droplet className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Blood<span className="text-crimson-500">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              Connecting donors, patients, and verified healthcare providers to ensure immediate access to life-saving blood supplies.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Join as Donor
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Request Blood
                </Link>
              </li>
            </ul>
          </div>

          {/* Safe & Verified */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-400">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-crimson-400 shrink-0" />
                <span>Verified Hospital Records</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-crimson-400 shrink-0" />
                <span>Screened Voluntary Donors</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-crimson-400 shrink-0" />
                <span>Strict Role-Based Security</span>
              </li>
            </ul>
          </div>

          {/* Legal / System */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              System
            </h4>
            <p className="text-xs text-charcoal-400 leading-relaxed mb-3">
              BloodBridge operates 24/7 with real-time inventory tracking and secure request coordination.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-charcoal-800 rounded-full text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} BloodBridge Platform. All rights reserved.</p>
          <p className="text-charcoal-500">
            Dedicated to fast, reliable, and verified blood distribution.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
