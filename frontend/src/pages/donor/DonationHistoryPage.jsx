import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { donorApi } from '@/api/donor.api';
import { formatDate } from '@/lib/formatters';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { CardSkeleton, TableSkeleton } from '@/components/feedback/Skeleton';

export const DonationHistoryPage = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 1. Fetch current donor profile for header overview
  const { data: profile } = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: () => donorApi.getMyProfile(),
  });

  // 2. Fetch authenticated donor's donation records
  const {
    data: donationData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['donor', 'donations', page],
    queryFn: () => donorApi.getMyDonations({ page, size: pageSize }),
  });

  const donations = donationData?.content || [];
  const totalElements = donationData?.totalElements || 0;
  const totalPages = donationData?.totalPages || 0;

  // Calculate total units from current records
  const totalUnitsDonated = donations.reduce((acc, curr) => acc + (curr.unitsDonated || 1), 0);

  return (
    <div className="space-y-6">
      {/* Header and Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-charcoal-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal-900">
            My Donation History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Official record of verified blood donations and life-saving contributions.
          </p>
        </div>

        <Link to="/donor">
          <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
            Back to Profile
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Total Donations
            </span>
            <p className="text-2xl font-black text-charcoal-900">
              {totalElements}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Total Units
            </span>
            <p className="text-2xl font-black text-charcoal-900">
              {totalUnitsDonated} <span className="text-sm font-normal text-charcoal-400">bags</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Last Donation
            </span>
            <p className="text-base sm:text-lg font-bold text-charcoal-900">
              {profile?.lastDonationDate ? formatDate(profile.lastDonationDate) : 'No recorded date'}
            </p>
          </div>
        </Card>
      </div>

      {/* Donation Records Content */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-bold">Failed to load donation records.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 min-h-[44px]"
          >
            Retry
          </Button>
        </div>
      ) : donations.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-crimson-50 text-crimson-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 mb-2">
            No Donation Records Found
          </h2>
          <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed mb-6">
            When you respond to an emergency blood request or donate at a verified partner hospital, once the procedure is clinically completed and fulfilled, your verified record will appear here.
          </p>
          <Link to="/donor">
            <Button variant="primary" className="min-h-[44px]">
              View Matching Requests <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-white border border-charcoal-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm text-charcoal-800">
              <thead className="bg-charcoal-50 text-charcoal-600 uppercase tracking-wider text-xs border-b border-charcoal-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Blood Group</th>
                  <th className="py-3.5 px-4 font-semibold">Units Donated</th>
                  <th className="py-3.5 px-4 font-semibold">Hospital / Facility</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {donations.map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-50/70 transition-colors">
                    <td className="py-4 px-4 font-medium text-charcoal-900">
                      {formatDate(item.donationDate)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="primary" size="md">
                        {item.bloodGroup || item.bloodGroupCode || '—'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-semibold text-charcoal-900">
                      {item.unitsDonated} {item.unitsDonated === 1 ? 'unit' : 'units'}
                    </td>
                    <td className="py-4 px-4 font-medium text-charcoal-800">
                      {item.hospitalName || 'Verified Medical Partner'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="success" size="md" className="font-bold flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {item.status || 'COMPLETED'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-charcoal-500 max-w-xs truncate">
                      {item.notes || 'Routine verified donation'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Deck View (320px–767px) */}
          <div className="block md:hidden space-y-3">
            {donations.map((item) => (
              <Card key={item.id} className="p-4 space-y-3 border-charcoal-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-500">
                    {formatDate(item.donationDate)}
                  </span>
                  <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {item.status || 'COMPLETED'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-y border-charcoal-100 py-2.5">
                  <div>
                    <span className="text-xs text-charcoal-400 block">Blood Group</span>
                    <Badge variant="primary" size="md" className="mt-0.5">
                      {item.bloodGroup || item.bloodGroupCode || '—'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-charcoal-400 block">Units Donated</span>
                    <span className="font-extrabold text-charcoal-900 text-base">
                      {item.unitsDonated} bag(s)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-charcoal-400 block">Medical Facility</span>
                  <p className="text-sm font-semibold text-charcoal-800 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-crimson-600 shrink-0" />
                    {item.hospitalName || 'Verified Medical Partner'}
                  </p>
                </div>

                {item.notes && (
                  <p className="text-xs text-charcoal-500 bg-charcoal-50 p-2.5 rounded-lg">
                    {item.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-200">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <span className="text-xs text-charcoal-600">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationHistoryPage;
