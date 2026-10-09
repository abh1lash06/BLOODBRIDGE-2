import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hospital, Phone, MapPin, Edit, Save } from 'lucide-react';
import { hospitalApi } from '@/api/hospital.api';
import { hospitalUpdateSchema } from '@/lib/validation';
import { extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import { CardSkeleton } from '@/components/feedback/Skeleton';

export const HospitalProfilePage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: hospital, isLoading, error } = useQuery({
    queryKey: ['hospital', 'me'],
    queryFn: () => hospitalApi.getMyHospital(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(hospitalUpdateSchema),
    values: hospital
      ? {
          hospitalName: hospital.hospitalName || '',
          address: hospital.address || '',
          city: hospital.city || '',
          state: hospital.state || '',
          contactPhone: hospital.contactPhone || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => hospitalApi.updateHospital(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['hospital', 'me'], updatedData);
      toast.success('Hospital profile updated successfully.');
      setIsEditing(false);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update hospital profile.');
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-charcoal-900">Hospital Profile</h1>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl">
        Failed to load hospital profile.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-6 bg-white rounded-2xl border border-charcoal-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-600 text-white flex items-center justify-center font-bold">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              {hospital.hospitalName}
            </h1>
            <p className="text-sm text-charcoal-500">
              Registration No: <span className="font-semibold">{hospital.registrationNumber}</span>
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card
        title="Facility Information"
        subtitle="Manage hospital name, location coordinates, and operational contact phone"
      >
        {isEditing ? (
          <form
            onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="hospitalName"
                  label="Hospital / Clinic Name"
                  required
                  error={errors.hospitalName?.message}
                  {...register('hospitalName')}
                />
              </div>

              <Input
                id="contactPhone"
                type="tel"
                label="Emergency Contact Phone"
                placeholder="+1-212-555-0100"
                error={errors.contactPhone?.message}
                {...register('contactPhone')}
              />

              <Input
                id="city"
                label="City"
                placeholder="Metropolis"
                error={errors.city?.message}
                {...register('city')}
              />

              <Input
                id="state"
                label="State / Province"
                placeholder="NY"
                error={errors.state?.message}
                {...register('state')}
              />

              <div className="sm:col-span-2">
                <Input
                  id="address"
                  label="Physical Address"
                  placeholder="Street address & suite"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-charcoal-500 block text-xs">Contact Phone</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {hospital.contactPhone || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500 block text-xs">Location</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {hospital.city ? `${hospital.city}, ${hospital.state || ''}` : 'Not specified'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-charcoal-500 block text-xs">Address</span>
              <p className="font-medium text-charcoal-700 mt-1">
                {hospital.address || 'Not specified'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HospitalProfilePage;
