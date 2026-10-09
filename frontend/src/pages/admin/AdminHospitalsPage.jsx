import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
} from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { formatDate, extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const AdminHospitalsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const [verifyingHospital, setVerifyingHospital] = useState(null);
  const [unverifyingHospital, setUnverifyingHospital] = useState(null);

  // Fetch pending hospitals
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'pendingHospitals', page],
    queryFn: () => adminApi.getPendingHospitals({ page, size: 10 }),
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyHospital(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingHospitals']);
      toast.success('Hospital verified successfully.');
      setVerifyingHospital(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to verify hospital.');
      toast.error(msg);
      setVerifyingHospital(null);
    },
  });

  // Unverify mutation
  const unverifyMutation = useMutation({
    mutationFn: (id) => adminApi.unverifyHospital(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingHospitals']);
      toast.success('Hospital status set to unverified.');
      setUnverifyingHospital(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to unverify hospital.');
      toast.error(msg);
      setUnverifyingHospital(null);
    },
  });

  const hospitals = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Pending Hospital Verifications
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Validate hospital medical licenses and registration numbers before authorizing inventory operations.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load pending hospitals.
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No pending hospitals"
              description="There are currently no hospitals pending administrative verification."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-200 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Hospital Name</th>
                  <th className="py-3.5 px-4">Registration #</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {hospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                      {hosp.hospitalName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-charcoal-700">
                      {hosp.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {hosp.city ? `${hosp.city}, ${hosp.state || ''}` : 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {hosp.contactPhone || 'None'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="warning">{hosp.verificationStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setVerifyingHospital(hosp)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUnverifyingHospital(hosp)}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        Unverify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>

      {/* Verify Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(verifyingHospital)}
        onClose={() => setVerifyingHospital(null)}
        onConfirm={() => verifyMutation.mutate(verifyingHospital.id)}
        title="Verify Hospital Facility"
        message={`Authorize ${verifyingHospital?.hospitalName} (Reg: ${verifyingHospital?.registrationNumber})? This will unlock blood inventory management and blood request processing for this facility.`}
        confirmText="Verify Hospital"
        isLoading={verifyMutation.isPending}
      />

      {/* Unverify Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(unverifyingHospital)}
        onClose={() => setUnverifyingHospital(null)}
        onConfirm={() => unverifyMutation.mutate(unverifyingHospital.id)}
        title="Unverify Hospital Facility"
        message={`Revoke verification for ${unverifyingHospital?.hospitalName}? The hospital staff will be blocked from managing blood stocks until re-verified.`}
        confirmText="Revoke Verification"
        isDanger
        isLoading={unverifyMutation.isPending}
      />
    </div>
  );
};

export default AdminHospitalsPage;
