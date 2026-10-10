import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Check, AlertCircle, Droplet } from 'lucide-react';
import { bloodRequestApi } from '@/api/bloodRequest.api';
import { REQUEST_STATUSES } from '@/lib/constants';
import {
  formatDate,
  formatDateTime,
  getStatusBadgeVariant,
  getUrgencyBadgeVariant,
  extractErrorMessage,
} from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const OpenRequestsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [acceptingReq, setAcceptingReq] = useState(null);

  // List open/pending requests across system
  const { data, isLoading, error } = useQuery({
    queryKey: ['requests', 'open', page],
    queryFn: () => bloodRequestApi.listOpenRequests({ page, size: 10 }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id) =>
      bloodRequestApi.updateRequest(id, { status: REQUEST_STATUSES.APPROVED }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'open'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'assignedRequests'] });
      toast.success('You have accepted and approved this blood request.');
      setAcceptingReq(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to accept blood request.');
      toast.error(msg);
      setAcceptingReq(null);
    },
  });

  const requests = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Incoming Open Requests
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Open blood requests from patients in the region looking for hospital fulfillment.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load open requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Droplet}
              title="No open requests available"
              description="There are currently no unassigned pending blood requests in the system."
            />
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< 768px) */}
            <div className="block md:hidden divide-y divide-charcoal-100">
              {requests.map((req) => (
                <div key={req.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-charcoal-900 text-sm">
                        {req.patientName || `Patient #${req.patientId}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-crimson-600 text-base">
                          {req.bloodGroup || req.bloodGroupCode}
                        </span>
                        <span className="text-xs text-charcoal-600">
                          {req.unitsRequired} {req.unitsRequired === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getUrgencyBadgeVariant(req.urgency)}>
                      {req.urgency}
                    </Badge>
                  </div>

                  <div className="text-xs text-charcoal-600 space-y-1">
                    <div>
                      <span className="text-charcoal-400">Required By: </span>
                      <span className="font-medium text-charcoal-800">{formatDate(req.requiredDate)}</span>
                    </div>
                    {req.notes && (
                      <p className="text-charcoal-500 italic bg-charcoal-50 p-2 rounded">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-charcoal-100 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAcceptingReq(req)}
                      className="min-h-[38px] text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Accept & Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-charcoal-50 border-b border-charcoal-200 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Units</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">Required Date</th>
                    <th className="py-3.5 px-4">Notes</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-charcoal-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                        {req.patientName || `Patient #${req.patientId}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-crimson-700">
                        {req.bloodGroup || req.bloodGroupCode}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-800">
                        {req.unitsRequired} units
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getUrgencyBadgeVariant(req.urgency)}>
                          {req.urgency}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-600 text-xs">
                        {formatDate(req.requiredDate)}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-500 text-xs max-w-xs truncate">
                        {req.notes || 'None'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setAcceptingReq(req)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Accept & Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>

      <ConfirmDialog
        isOpen={Boolean(acceptingReq)}
        onClose={() => setAcceptingReq(null)}
        onConfirm={() => acceptMutation.mutate(acceptingReq.id)}
        title="Accept Open Blood Request"
        message={`Are you sure your hospital wants to accept and approve this request for ${acceptingReq?.unitsRequired} units of ${acceptingReq?.bloodGroup} for ${acceptingReq?.patientName}?`}
        confirmText="Accept & Approve"
        isLoading={acceptMutation.isPending}
      />
    </div>
  );
};

export default OpenRequestsPage;
