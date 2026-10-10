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
  Users,
  Phone,
  MapPin,
  MessageSquare,
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
import Modal from '@/components/common/Modal';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const PatientRequestsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  // Fetch patient's blood requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['patient', 'requests', page],
    queryFn: () => bloodRequestApi.getMyRequests({ page, size: 10 }),
  });

  // Fetch responses for currently viewed request
  const {
    data: responses = [],
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useQuery({
    queryKey: ['blood-requests', viewingRequest?.id, 'responses'],
    queryFn: () => bloodRequestApi.getRequestResponses(viewingRequest.id),
    enabled: Boolean(viewingRequest?.id),
  });

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => bloodRequestApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'requests'] });
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
          <>
            {/* Mobile Cards View (phone/small tablet < 768px) */}
            <div className="block md:hidden divide-y divide-charcoal-100">
              {requests.map((req) => (
                <div key={req.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-crimson-600">
                        {req.bloodGroup || req.bloodGroupCode}
                      </span>
                      <span className="text-sm font-semibold text-charcoal-800">
                        {req.unitsRequired} {req.unitsRequired === 1 ? 'unit' : 'units'}
                      </span>
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
                    <div className="col-span-2">
                      <span className="text-charcoal-400 block mb-0.5">Hospital</span>
                      <span className="font-medium text-charcoal-800">
                        {req.hospitalName || 'Unassigned / Open'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingRequest(req)}
                      className="text-xs min-h-[38px]"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      Donor Responses
                    </Button>
                    {(req.status === REQUEST_STATUSES.PENDING ||
                      req.status === REQUEST_STATUSES.APPROVED) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancellingId(req.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs min-h-[38px]"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingRequest(req)}
                          className="text-xs"
                        >
                          <Users className="w-3.5 h-3.5 mr-1" />
                          Responses
                        </Button>
                        {/* Cancel allowed if PENDING or APPROVED */}
                        {(req.status === REQUEST_STATUSES.PENDING ||
                          req.status === REQUEST_STATUSES.APPROVED) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancellingId(req.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
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
          </>
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

      {/* Donor Responses Modal */}
      <Modal
        isOpen={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        title={
          viewingRequest
            ? `Donor Responses for Request #${viewingRequest.id} (${viewingRequest.bloodGroup || viewingRequest.bloodGroupCode})`
            : 'Donor Responses'
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-500">
            Below are registered and verified donors who received your emergency broadcast alert and responded. Authorized contact information is shared for approved donation coordination.
          </p>

          {isLoadingResponses ? (
            <div className="py-8 text-center text-sm text-charcoal-500">
              Loading donor responses...
            </div>
          ) : responsesError ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              Failed to load donor responses. Please try again.
            </div>
          ) : responses.length === 0 ? (
            <div className="py-8 px-4 text-center bg-charcoal-50 rounded-xl border border-dashed border-charcoal-300">
              <Users className="w-10 h-10 mx-auto text-charcoal-400 mb-2" />
              <h4 className="text-sm font-bold text-charcoal-800">No donor responses yet</h4>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                Notifications have been sent to verified compatible donors. When a donor accepts your blood request, their details and verified contact number will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((resp) => {
                const isAccepted = resp.status === 'ACCEPTED';
                return (
                  <div
                    key={resp.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isAccepted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-charcoal-50 border-charcoal-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-200 text-charcoal-600'
                          }`}
                        >
                          {resp.bloodGroupCode || resp.bloodGroup || '🩸'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal-900 text-sm">
                              {resp.donorName || 'Anonymous Donor'}
                            </span>
                            <Badge
                              variant={isAccepted ? 'success' : 'neutral'}
                              size="sm"
                            >
                              {resp.status}
                            </Badge>
                          </div>
                          {(resp.donorCity || resp.donorState) && (
                            <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-charcoal-400" />
                              {[resp.donorCity, resp.donorState].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {resp.respondedAt && (
                        <span className="text-[11px] text-charcoal-400">
                          Responded {formatDateTime(resp.respondedAt)}
                        </span>
                      )}
                    </div>

                    {isAccepted && resp.donorPhone && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                        <div className="text-xs text-charcoal-600">
                          <span className="text-charcoal-500 mr-1.5">Authorized Contact:</span>
                          <a
                            href={`tel:${resp.donorPhone}`}
                            className="font-bold text-crimson-600 hover:text-crimson-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {resp.donorPhone}
                          </a>
                        </div>
                        <a
                          href={`tel:${resp.donorPhone}`}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Call Donor
                        </a>
                      </div>
                    )}

                    {resp.message && (
                      <div className="mt-2 text-xs text-charcoal-600 bg-white/60 p-2 rounded border border-charcoal-100 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-charcoal-400 mt-0.5 shrink-0" />
                        <span>"{resp.message}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-charcoal-200 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewingRequest(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientRequestsPage;
