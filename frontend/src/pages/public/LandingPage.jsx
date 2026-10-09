import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Heart,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export const LandingPage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-crimson-700 via-crimson-600 to-crimson-800 text-white p-8 md:p-16 shadow-lg">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-crimson-100 border border-white/20">
            <Droplet className="w-4 h-4 fill-crimson-300 text-crimson-300" />
            Reliable Blood Network
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Connecting Lifelines When Every Second Counts.
          </h1>
          <p className="text-lg md:text-xl text-crimson-100 max-w-2xl font-normal leading-relaxed">
            BloodBridge bridges the critical gap between blood donors, patients in urgent need, and verified hospital blood banks through a secure, coordinated platform.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-crimson-700 hover:bg-crimson-50 font-bold shadow-md"
              >
                Become a Blood Donor
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Request Blood
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Droplet className="w-96 h-96 fill-white" />
        </div>
      </section>

      {/* Trust & Safety Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-crimson-600 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-crimson-100 rounded-lg text-crimson-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">
              Admin-Verified Hospitals
            </h3>
          </div>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Every hospital and blood bank is verified by system administrators before managing inventory or fulfilling emergency requests.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-crimson-600 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-crimson-100 rounded-lg text-crimson-600">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">
              Dedicated Donor Community
            </h3>
          </div>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Donors maintain their blood group, location, and real-time availability to respond swiftly when matching requests arise.
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-crimson-600 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-crimson-100 rounded-lg text-crimson-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">
              Urgency Prioritization
            </h3>
          </div>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Blood requests are flagged with explicit urgency levels (Normal, Urgent, Critical) ensuring clinical operations are prioritized.
          </p>
        </Card>
      </section>

      {/* How it Works */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-charcoal-900">
            How BloodBridge Operates
          </h2>
          <p className="text-sm text-charcoal-600">
            A transparent 3-step workflow connecting patients directly to verified medical resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-charcoal-200">
            <div className="w-12 h-12 rounded-full bg-crimson-100 text-crimson-700 font-bold text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h4 className="font-bold text-charcoal-900 mb-2">Create a Request</h4>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              Patients or relatives specify required blood group, units, hospital, and urgency level.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-charcoal-200">
            <div className="w-12 h-12 rounded-full bg-crimson-100 text-crimson-700 font-bold text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h4 className="font-bold text-charcoal-900 mb-2">Hospital Matching</h4>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              Verified hospital blood banks review incoming requests and cross-reference their live inventory.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-charcoal-200">
            <div className="w-12 h-12 rounded-full bg-crimson-100 text-crimson-700 font-bold text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h4 className="font-bold text-charcoal-900 mb-2">Safe Fulfillment</h4>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              The request is approved, inventory is allocated, and the blood units are dispensed securely to the patient.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action card */}
      <section className="bg-charcoal-900 text-white rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Ready to save a life today?
        </h2>
        <p className="text-sm sm:text-base text-charcoal-300 max-w-xl mx-auto">
          Sign up as a voluntary blood donor or register your family account to coordinate emergency requests with certified medical institutions.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button variant="primary" size="lg">
              Get Started Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="border-charcoal-700 text-white hover:bg-charcoal-800">
              Sign In
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
