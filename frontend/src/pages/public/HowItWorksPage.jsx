import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
          How BloodBridge Works
        </h1>
        <p className="text-charcoal-600 max-w-2xl mx-auto text-base">
          A step-by-step breakdown of how donors contribute and patients receive blood safely.
        </p>
      </div>

      {/* For Donors */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-crimson-600 text-white flex items-center justify-center font-bold text-sm">
            D
          </div>
          <h2 className="text-xl font-bold text-charcoal-900">For Blood Donors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">1. Register Profile</h4>
            <p className="text-sm text-charcoal-600">
              Sign up as a DONOR, complete your blood group, date of birth, gender, and city information.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">2. Get Verified</h4>
            <p className="text-sm text-charcoal-600">
              An administrator verifies your credentials to protect patient safety. Once verified, your donor badge activates.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">3. Set Availability</h4>
            <p className="text-sm text-charcoal-600">
              Toggle your availability switch anytime. When active, medical centers can locate you for critical shortages.
            </p>
          </Card>
        </div>
      </div>

      {/* For Patients */}
      <div className="space-y-4 pt-6 border-t border-charcoal-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-crimson-600 text-white flex items-center justify-center font-bold text-sm">
            P
          </div>
          <h2 className="text-xl font-bold text-charcoal-900">For Patients & Families</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">1. Create Blood Request</h4>
            <p className="text-sm text-charcoal-600">
              Submit units needed, blood group, hospital facility, and required date with urgency level.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">2. Search Hospital Stocks</h4>
            <p className="text-sm text-charcoal-600">
              Check live blood inventory at verified hospitals to find available units matching your required group.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-charcoal-900 mb-2">3. Real-Time Tracking</h4>
            <p className="text-sm text-charcoal-600">
              Receive status updates and notifications immediately when the hospital reviews and approves your request.
            </p>
          </Card>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button variant="primary" size="lg">
            Create Free Account Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowItWorksPage;
