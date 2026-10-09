import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Droplet,
  Clock,
  Building2,
  Calendar,
  XCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { bloodRequestApi } from '@/api/bloodRequest.api';
import {
  formatDate,
  formatDateTime,
  getStatusBadgeVariant,
  getUrgencyBadgeVariant,
  extractErrorMessage,
} from '@/lib/formatters';
import { REQUEST_STATUSES } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const PatientRequestsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch patient's blood requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['patient', 'requests', page],
    queryFn: () => bloodRequestApi.getMyRequests({ page, size: 10 }),
  });

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => bloodRequestApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient', 'requests']);
      toast.success('Blood request has been cancelled.');
      setCancellingId(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to cancel blood request.');
      toast.error(msg);
      setCancellingId(null);
    },
  });

  const requests = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-900">
            My Blood Requests
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Track and manage your submitted requests for donor and hospital matching.
          </p>
        </div>
        <Link to="/patient/new-request">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Request
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load your requests. Please try again later.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Droplet}
              title="No blood requests found"
              description="You have not submitted any blood requests yet. Click below to submit an urgent or scheduled blood request."
              actionText="Create Blood Request"
              onAction={() => (window.location.href = '/patient/new-request')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-200 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Hospital</th>
                  <th className="py-3.5 px-4">Required Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-charcoal-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-crimson-700">
                      {req.bloodGroup || req.bloodGroupCode}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-800 font-medium">
                      {req.unitsRequired} {req.unitsRequired === 1 ? 'unit' : 'units'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getUrgencyBadgeVariant(req.urgency)}>
                        {req.urgency}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600">
                      {req.hospitalName || 'Unassigned / Open'}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                      {formatDate(req.requiredDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(req.status)}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Cancel allowed if PENDING or APPROVED */}
                      {(req.status === REQUEST_STATUSES.PENDING ||
                        req.status === REQUEST_STATUSES.APPROVED) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingId(req.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
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

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        onConfirm={() => cancelMutation.mutate(cancellingId)}
        title="Cancel Blood Request"
        message="Are you sure you want to cancel this blood request? Once cancelled, it cannot be reopened."
        confirmText="Cancel Request"
        isDanger
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

export default PatientRequestsPage;
