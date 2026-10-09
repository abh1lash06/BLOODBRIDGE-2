import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Heart,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Edit,
  Save,
} from 'lucide-react';
import { donorApi } from '@/api/donor.api';
import { donorProfileUpdateSchema } from '@/lib/validation';
import { BLOOD_GROUPS, VERIFICATION_STATUSES } from '@/lib/constants';
import {
  formatDate,
  getVerificationBadgeVariant,
  extractErrorMessage,
} from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import { CardSkeleton } from '@/components/feedback/Skeleton';

export const DonorDashboardPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current donor profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: () => donorApi.getMyProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donorProfileUpdateSchema),
    values: profile
      ? {
          bloodGroup: profile.bloodGroup || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          availableToDonate: profile.availableToDonate ?? true,
        }
      : undefined,
  });

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (data) => donorApi.updateProfile(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['donor', 'profile'], updatedData);
      toast.success('Your donor profile has been updated.');
      setIsEditing(false);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update profile.');
      toast.error(msg);
    },
  });

  const onUpdateSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case VERIFICATION_STATUSES.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case VERIFICATION_STATUSES.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case VERIFICATION_STATUSES.PENDING:
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-charcoal-900">Donor Profile</h1>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Failed to load donor profile. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner with Verification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-charcoal-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-crimson-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
            {profile.bloodGroup ? (
              BLOOD_GROUPS.find((b) => b.code === profile.bloodGroup)?.label || 'O+'
            ) : (
              <Heart className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-charcoal-900">
              {profile.fullName}
            </h1>
            <p className="text-sm text-charcoal-500">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-charcoal-200 bg-charcoal-50">
            {getVerificationIcon(profile.verificationStatus)}
            <div className="text-xs">
              <span className="text-charcoal-500 block leading-none">Verification</span>
              <span className="font-bold text-charcoal-800">
                {profile.verificationStatus}
              </span>
            </div>
          </div>

          <Badge
            variant={profile.availableToDonate ? 'success' : 'default'}
            size="lg"
          >
            {profile.availableToDonate ? 'Available to Donate' : 'Unavailable'}
          </Badge>
        </div>
      </div>

      {/* Profile Details or Edit Form */}
      <Card
        title="Donor Information"
        subtitle="Manage your personal medical eligibility and contact details"
        action={
          !isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          )
        }
      >
        {isEditing ? (
          <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="bloodGroup"
                label="Blood Group"
                required
                options={BLOOD_GROUPS.map((b) => ({
                  value: b.code,
                  label: `${b.label} (${b.code})`,
                }))}
                error={errors.bloodGroup?.message}
                {...register('bloodGroup')}
              />

              <Input
                id="dateOfBirth"
                type="date"
                label="Date of Birth"
                required
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />

              <Select
                id="gender"
                label="Gender"
                required
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                error={errors.gender?.message}
                {...register('gender')}
              />

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="availableToDonate"
                  className="w-4 h-4 text-crimson-600 rounded border-charcoal-300 focus:ring-crimson-500"
                  {...register('availableToDonate')}
                />
                <label
                  htmlFor="availableToDonate"
                  className="text-sm font-medium text-charcoal-700 cursor-pointer"
                >
                  I am currently available for blood donation
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Input
                  id="city"
                  label="City"
                  placeholder="e.g. Springfield"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  id="state"
                  label="State / Province"
                  placeholder="e.g. IL"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  id="address"
                  label="Full Residential Address"
                  placeholder="Street and building details"
                  required
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
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-charcoal-500 block text-xs">Blood Group</span>
              <p className="font-semibold text-charcoal-900 mt-1">
                {profile.bloodGroup
                  ? BLOOD_GROUPS.find((b) => b.code === profile.bloodGroup)?.label ||
                    profile.bloodGroup
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-charcoal-500 block text-xs">Date of Birth</span>
              <p className="font-semibold text-charcoal-900 mt-1">
                {formatDate(profile.dateOfBirth)}
              </p>
            </div>

            <div>
              <span className="text-charcoal-500 block text-xs">Gender</span>
              <p className="font-semibold text-charcoal-900 mt-1 capitalize">
                {profile.gender ? profile.gender.toLowerCase() : 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-charcoal-500 block text-xs">Phone Number</span>
              <p className="font-semibold text-charcoal-900 mt-1">
                {profile.phoneNumber || 'None'}
              </p>
            </div>

            <div>
              <span className="text-charcoal-500 block text-xs">Location</span>
              <p className="font-semibold text-charcoal-900 mt-1">
                {profile.city ? `${profile.city}, ${profile.state || ''}` : 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-charcoal-500 block text-xs">Last Donation</span>
              <p className="font-semibold text-charcoal-900 mt-1">
                {formatDate(profile.lastDonationDate)}
              </p>
            </div>

            <div className="sm:col-span-2 md:col-span-3 pt-2">
              <span className="text-charcoal-500 block text-xs">Address</span>
              <p className="font-medium text-charcoal-800 mt-1">
                {profile.address || 'No address provided'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DonorDashboardPage;
