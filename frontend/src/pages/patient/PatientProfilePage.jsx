import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, MapPin, Edit, Save } from 'lucide-react';
import { patientApi } from '@/api/patient.api';
import { patientProfileUpdateSchema } from '@/lib/validation';
import { extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import { CardSkeleton } from '@/components/feedback/Skeleton';

export const PatientProfilePage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['patient', 'profile'],
    queryFn: () => patientApi.getMyProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientProfileUpdateSchema),
    values: profile
      ? {
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          emergencyContactName: profile.emergencyContactName || '',
          emergencyContactPhone: profile.emergencyContactPhone || '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => patientApi.updateProfile(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['patient', 'profile'], updatedData);
      toast.success('Patient profile updated successfully.');
      setIsEditing(false);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update patient profile.');
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-charcoal-900">Patient Profile</h1>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Failed to load patient profile.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-6 bg-white rounded-2xl border border-charcoal-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-600 text-white flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              {profile.fullName}
            </h1>
            <p className="text-sm text-charcoal-500">{profile.email}</p>
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
        title="Contact & Emergency Information"
        subtitle="Keep your address and emergency contact details updated for hospital coordination"
      >
        {isEditing ? (
          <form
            onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="emergencyContactName"
                label="Emergency Contact Name"
                placeholder="e.g. Mary Doe"
                error={errors.emergencyContactName?.message}
                {...register('emergencyContactName')}
              />

              <Input
                id="emergencyContactPhone"
                type="tel"
                label="Emergency Contact Phone"
                placeholder="+1-555-4321"
                error={errors.emergencyContactPhone?.message}
                {...register('emergencyContactPhone')}
              />

              <Input
                id="city"
                label="City"
                placeholder="e.g. Springfield"
                error={errors.city?.message}
                {...register('city')}
              />

              <Input
                id="state"
                label="State / Province"
                placeholder="e.g. IL"
                error={errors.state?.message}
                {...register('state')}
              />

              <div className="sm:col-span-2">
                <Input
                  id="address"
                  label="Residential Address"
                  placeholder="Street address"
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
              <span className="text-charcoal-500 block text-xs">Primary Phone</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {profile.phoneNumber || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500 block text-xs">Location</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {profile.city ? `${profile.city}, ${profile.state || ''}` : 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500 block text-xs">Emergency Contact</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {profile.emergencyContactName || 'None'}
              </p>
            </div>
            <div>
              <span className="text-charcoal-500 block text-xs">Emergency Phone</span>
              <p className="font-semibold text-charcoal-800 mt-1">
                {profile.emergencyContactPhone || 'None'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-charcoal-500 block text-xs">Full Address</span>
              <p className="font-medium text-charcoal-700 mt-1">
                {profile.address || 'Not provided'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientProfilePage;
