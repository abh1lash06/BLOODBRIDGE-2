import React from 'react';
import { ShieldCheck, Heart, Hospital, Activity } from 'lucide-react';
import Card from '@/components/common/Card';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
          About BloodBridge
        </h1>
        <p className="text-charcoal-600 max-w-2xl mx-auto text-base">
          Our mission is to eliminate preventable delays in emergency blood procurement through verified medical partnerships and real-time community coordination.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="p-3 bg-crimson-100 rounded-lg w-fit text-crimson-700 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">
            Rigorous Verification
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            In medical emergencies, legitimacy is paramount. BloodBridge requires administrative validation of hospital credentials before any facility can access requests or update blood stocks.
          </p>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-crimson-100 rounded-lg w-fit text-crimson-700 mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">
            Empowered Voluntary Donors
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Donors maintain privacy and control over their availability, while helping hospitals quickly find matching blood groups in nearby areas during inventory shortages.
          </p>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-crimson-100 rounded-lg w-fit text-crimson-700 mb-4">
            <Hospital className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">
            Centralized Hospital Inventory
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Hospitals can log available units across all eight standard blood groups, enabling rapid checks and inter-facility coordination without unnecessary delays.
          </p>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-crimson-100 rounded-lg w-fit text-crimson-700 mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">
            Transparent Lifecycle
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Every blood request adheres to deterministic lifecycle transitions (Pending, Approved, Fulfilled, Cancelled, or Rejected) so patients always know exact status.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
