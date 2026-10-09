import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Calendar,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { formatDate, extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Textarea from '@/components/forms/Textarea';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const AdminDonorsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  // Verification modal states
  const [verifyingDonor, setVerifyingDonor] = useState(null);
  const [rejectingDonor, setRejectingDonor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending donors
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'pendingDonors', page],
    queryFn: () => adminApi.getPendingDonors({ page, size: 10 }),
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyDonor(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingDonors']);
      toast.success('Donor has been successfully verified.');
      setVerifyingDonor(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to verify donor.');
      toast.error(msg);
      setVerifyingDonor(null);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectDonor(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingDonors']);
      toast.success('Donor verification request has been rejected.');
      setRejectingDonor(null);
      setRejectReason('');
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to reject donor.');
      toast.error(msg);
    },
  });

  const donors = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Pending Donor Verifications
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Review, verify, or reject newly registered blood donors before adding them to the public network.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load pending donors.
          </div>
        ) : donors.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Heart}
              title="No pending donor verifications"
              description="All registered blood donors have been reviewed and processed."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-200 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Birth Date</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {donors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                      {donor.fullName}
                      <span className="block text-xs font-normal text-charcoal-400">
                        {donor.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-crimson-700">
                      {donor.bloodGroup || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {formatDate(donor.dateOfBirth)}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {donor.city ? `${donor.city}, ${donor.state || ''}` : 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {donor.phoneNumber || 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setVerifyingDonor(donor)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRejectingDonor(donor);
                          setRejectReason('');
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
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

      {/* Verify Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(verifyingDonor)}
        onClose={() => setVerifyingDonor(null)}
        onConfirm={() => verifyMutation.mutate(verifyingDonor.id)}
        title="Approve Donor Verification"
        message={`Confirm verification for donor ${verifyingDonor?.fullName}? This will grant full donor network participation.`}
        confirmText="Verify Donor"
        isLoading={verifyMutation.isPending}
      />

      {/* Reject Modal with Reason Field */}
      <Modal
        isOpen={Boolean(rejectingDonor)}
        onClose={() => setRejectingDonor(null)}
        title={`Reject Donor Verification — ${rejectingDonor?.fullName}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal-600">
            Please provide a specific reason for rejection. This reason will be logged and dispatched to the donor.
          </p>
          <Textarea
            id="rejectReason"
            label="Rejection Reason"
            required
            rows={3}
            placeholder="e.g. Incomplete identification, medical ineligibility, or invalid location."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingDonor(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectReason.trim()}
              isLoading={rejectMutation.isPending}
              onClick={() =>
                rejectMutation.mutate({
                  id: rejectingDonor.id,
                  reason: rejectReason.trim(),
                })
              }
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDonorsPage;
