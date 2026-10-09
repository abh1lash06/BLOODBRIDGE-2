import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Droplet,
  ShieldAlert,
  Edit,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { hospitalApi } from '@/api/hospital.api';
import { inventoryApi } from '@/api/inventory.api';
import { BLOOD_GROUPS, VERIFICATION_STATUSES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/forms/Input';
import { CardSkeleton } from '@/components/feedback/Skeleton';

export const HospitalInventoryPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingStock, setEditingStock] = useState(null);
  const [unitsInput, setUnitsInput] = useState(0);

  // 1. Fetch Hospital Profile
  const { data: hospital, isLoading: isHospLoading } = useQuery({
    queryKey: ['hospital', 'me'],
    queryFn: () => hospitalApi.getMyHospital(),
  });

  const isVerified = hospital?.verificationStatus === VERIFICATION_STATUSES.VERIFIED;

  // 2. Fetch Hospital Inventory (only if verified)
  const {
    data: inventory = [],
    isLoading: isInvLoading,
    error: invError,
    refetch,
  } = useQuery({
    queryKey: ['hospital', 'inventory'],
    queryFn: () => inventoryApi.getMyHospitalInventory(),
    enabled: isVerified,
  });

  // 3. Update Inventory Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => inventoryApi.updateStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hospital', 'inventory']);
      toast.success('Inventory units updated successfully.');
      setEditingStock(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update stock units.');
      toast.error(msg);
    },
  });

  const handleOpenEdit = (item) => {
    setEditingStock(item);
    setUnitsInput(item.availableUnits);
  };

  const handleSaveStock = (e) => {
    e.preventDefault();
    if (!editingStock) return;
    updateMutation.mutate({
      bloodGroup: editingStock.bloodGroupCode || editingStock.bloodGroup,
      availableUnits: Number(unitsInput),
    });
  };

  if (isHospLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-charcoal-900">Hospital Inventory</h1>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hospital Header and Verification Gate Notice */}
      <div className="p-6 bg-white rounded-2xl border border-charcoal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-900">
            {hospital?.hospitalName}
          </h1>
          <p className="text-sm text-charcoal-500">
            Registration: <span className="font-semibold">{hospital?.registrationNumber}</span> • {hospital?.city}, {hospital?.state}
          </p>
        </div>

        <div>
          <Badge
            variant={isVerified ? 'success' : 'warning'}
            size="lg"
            className="font-bold px-3 py-1"
          >
            {isVerified ? 'VERIFIED HOSPITAL' : 'PENDING VERIFICATION'}
          </Badge>
        </div>
      </div>

      {!isVerified ? (
        <Card className="p-8 text-center bg-amber-50 border-amber-200">
          <div className="w-12 h-12 bg-amber-100 rounded-full text-amber-700 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-charcoal-900 mb-2">
            Verification Required to Manage Inventory
          </h2>
          <p className="text-sm text-charcoal-600 max-w-lg mx-auto leading-relaxed">
            Your hospital account is awaiting administrative review. Privileged actions such as updating inventory stock and accepting blood requests are disabled until verified by system administrators.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-charcoal-800">
              Live Blood Group Stock
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              title="Refresh inventory"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
          </div>

          {isInvLoading ? (
            <CardSkeleton />
          ) : invError ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl">
              Failed to load inventory. Please try refreshing.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Render all 8 blood groups */}
              {BLOOD_GROUPS.map((group) => {
                const item = inventory.find(
                  (inv) =>
                    inv.bloodGroupCode === group.code ||
                    inv.bloodGroup === group.label ||
                    inv.bloodGroup === group.code
                ) || {
                  bloodGroupCode: group.code,
                  bloodGroup: group.label,
                  availableUnits: 0,
                  reservedUnits: 0,
                };

                return (
                  <Card
                    key={group.code}
                    className="p-5 flex flex-col justify-between hover:border-crimson-300 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center font-black text-lg">
                        {group.label}
                      </div>
                      <span className="text-xs text-charcoal-400 font-medium">
                        {group.code}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <span className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold">
                        Available Units
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-3xl font-black ${
                            item.availableUnits > 0
                              ? 'text-charcoal-900'
                              : 'text-red-500'
                          }`}
                        >
                          {item.availableUnits}
                        </span>
                        <span className="text-xs text-charcoal-400">bags</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Update Stock
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Stock Edit Modal */}
      <Modal
        isOpen={Boolean(editingStock)}
        onClose={() => setEditingStock(null)}
        title={`Update Stock — ${editingStock?.bloodGroup || editingStock?.bloodGroupCode}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveStock} className="space-y-4">
          <Input
            id="unitsInput"
            type="number"
            label="Available Units"
            min={0}
            max={1000}
            required
            value={unitsInput}
            onChange={(e) => setUnitsInput(e.target.value)}
            hint="Enter minimum 0. Real-time updates reflect immediately."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingStock(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalInventoryPage;
