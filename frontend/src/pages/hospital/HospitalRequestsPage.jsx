import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
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

export const HospitalRequestsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  // Transition dialog state: { id, targetStatus, title, message }
  const [transitionAction, setTransitionAction] = useState(null);

  // Fetch assigned hospital blood requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['hospital', 'assignedRequests', page],
    queryFn: () => bloodRequestApi.listHospitalRequests({ page, size: 10 }),
  });

  // Status transition mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      bloodRequestApi.updateRequest(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital', 'assignedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', 'inventory'] });
      toast.success('Request status has been updated successfully.');
      setTransitionAction(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update request status.');
      toast.error(msg);
      setTransitionAction(null);
    },
  });

  const requests = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Assigned Blood Requests
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Review, approve, fulfill, or reject blood requests directly assigned to your facility.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load assigned requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="No requests assigned"
              description="There are currently no blood requests directly assigned to your hospital."
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
                    <Badge variant={getStatusBadgeVariant(req.status)}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-600">
                    <div>
                      <span className="text-charcoal-400 block mb-0.5">Urgency</span>
                      <Badge variant={getUrgencyBadgeVariant(req.urgency)} size="sm">
                        {req.urgency}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block mb-0.5">Required By</span>
                      <span className="font-medium text-charcoal-800">
                        {formatDate(req.requiredDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-charcoal-100 flex flex-wrap justify-end gap-2">
                    {req.status === REQUEST_STATUSES.PENDING && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            setTransitionAction({
                              id: req.id,
                              targetStatus: REQUEST_STATUSES.APPROVED,
                              title: 'Approve Request',
                              message: `Approve ${req.unitsRequired} units of ${req.bloodGroup} for ${req.patientName}?`,
                            })
                          }
                          className="min-h-[38px] text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setTransitionAction({
                              id: req.id,
                              targetStatus: REQUEST_STATUSES.REJECTED,
                              title: 'Reject Request',
                              message: `Are you sure you want to reject this request for ${req.patientName}?`,
                            })
                          }
                          className="min-h-[38px] text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {req.status === REQUEST_STATUSES.APPROVED && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setTransitionAction({
                            id: req.id,
                            targetStatus: REQUEST_STATUSES.FULFILLED,
                            title: 'Mark as Fulfilled',
                            message: `Confirm that ${req.unitsRequired} units have been dispensed and delivered to ${req.patientName}?`,
                          })
                        }
                        className="min-h-[38px] text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Fulfill
                      </Button>
                    )}
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
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
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
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(req.status)}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {/* Legal transitions:
                            PENDING -> APPROVED, REJECTED
                            APPROVED -> FULFILLED
                        */}
                        {req.status === REQUEST_STATUSES.PENDING && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() =>
                                setTransitionAction({
                                  id: req.id,
                                  targetStatus: REQUEST_STATUSES.APPROVED,
                                  title: 'Approve Request',
                                  message: `Approve ${req.unitsRequired} units of ${req.bloodGroup} for ${req.patientName}?`,
                                })
                              }
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setTransitionAction({
                                  id: req.id,
                                  targetStatus: REQUEST_STATUSES.REJECTED,
                                  title: 'Reject Request',
                                  message: `Are you sure you want to reject this request for ${req.patientName}?`,
                                })
                              }
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {req.status === REQUEST_STATUSES.APPROVED && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setTransitionAction({
                                id: req.id,
                                targetStatus: REQUEST_STATUSES.FULFILLED,
                                title: 'Mark as Fulfilled',
                                message: `Confirm that ${req.unitsRequired} units have been dispensed and delivered to ${req.patientName}?`,
                              })
                            }
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Fulfill
                          </Button>
                        )}
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

      {/* Confirmation Dialog for Legal Status Transitions */}
      <ConfirmDialog
        isOpen={Boolean(transitionAction)}
        onClose={() => setTransitionAction(null)}
        onConfirm={() =>
          updateStatusMutation.mutate({
            id: transitionAction.id,
            status: transitionAction.targetStatus,
          })
        }
        title={transitionAction?.title || 'Confirm Transition'}
        message={transitionAction?.message || 'Proceed with state transition?'}
        confirmText={
          transitionAction?.targetStatus === REQUEST_STATUSES.REJECTED
            ? 'Reject Request'
            : 'Confirm'
        }
        isDanger={transitionAction?.targetStatus === REQUEST_STATUSES.REJECTED}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default HospitalRequestsPage;
