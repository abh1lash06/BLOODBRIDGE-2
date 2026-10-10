import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
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
  Droplet,
  Building2,
  Send,
  History,
  ShieldCheck,
} from 'lucide-react';
import { donorApi } from '@/api/donor.api';
import { bloodRequestApi } from '@/api/bloodRequest.api';
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

  const isVerified = profile?.verificationStatus === VERIFICATION_STATUSES.VERIFIED;
  const isAvailable = profile?.availableToDonate === true;

  // Matching emergency blood requests
  const { data: matchingData, isLoading: isMatchingLoading } = useQuery({
    queryKey: ['donor', 'matching-requests'],
    queryFn: () => bloodRequestApi.getMatchingRequestsForDonor({ page: 0, size: 10 }),
    enabled: Boolean(profile?.bloodGroup),
  });

  const matchingRequests = matchingData?.content || [];

  const respondMutation = useMutation({
    mutationFn: ({ id, action }) => bloodRequestApi.respondToRequest(id, { action }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donor', 'matching-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (variables.action === 'ACCEPT') {
        toast.success('You have accepted this blood request! The patient and hospital have been notified.');
      } else {
        toast.info('You have declined this blood request.');
      }
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to submit response.');
      toast.error(msg);
    },
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-charcoal-200 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-crimson-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-sm shrink-0">
            {profile.bloodGroup ? (
              BLOOD_GROUPS.find((b) => b.code === profile.bloodGroup)?.label || 'O+'
            ) : (
              <Heart className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 truncate">
              {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 truncate">{profile.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

      {/* Quick Navigation to Donation History */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-crimson-50/60 border border-crimson-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson-600 text-white flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-charcoal-900 text-sm">Official Donation History</h3>
            <p className="text-xs text-charcoal-600">
              {profile?.lastDonationDate
                ? `Last donation recorded on ${formatDate(profile.lastDonationDate)}`
                : 'View verified donation receipts and hospital completion records.'}
            </p>
          </div>
        </div>
        <Link to="/donor/history">
          <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
            View Donation History
          </Button>
        </Link>
      </div>

      {/* Matching Emergency Blood Requests Section */}
      <Card
        title="Emergency Blood Requests Matching Your Blood Group"
        subtitle={`Live requests clinically compatible with your ${profile.bloodGroup ? BLOOD_GROUPS.find((b) => b.code === profile.bloodGroup)?.label || profile.bloodGroup : 'blood'} type`}
      >
        {!isVerified ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verification Pending</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your profile is awaiting administrative review. Once verified, you will be able to directly accept emergency blood requests.
              </p>
            </div>
          </div>
        ) : !isAvailable ? (
          <div className="p-4 bg-charcoal-50 border border-charcoal-200 rounded-xl flex items-start gap-3 text-charcoal-700 text-sm">
            <Clock className="w-5 h-5 text-charcoal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Marked as Unavailable</p>
              <p className="text-xs text-charcoal-600 mt-0.5">
                You are currently marked as unavailable for donations. Edit your profile below to toggle availability back ON when ready to help.
              </p>
            </div>
          </div>
        ) : isMatchingLoading ? (
          <CardSkeleton />
        ) : matchingRequests.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500 space-y-2">
            <Droplet className="w-10 h-10 text-crimson-400 mx-auto" />
            <p className="text-sm font-semibold text-charcoal-700">No urgent requests awaiting donors right now</p>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Your profile is active and eligible. Whenever a matching emergency blood request is submitted by a hospital or patient, you will receive an immediate notification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-charcoal-200 bg-white hover:border-crimson-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="lg" className="font-black text-sm">
                      {req.bloodGroup}
                    </Badge>
                    <span className="text-xs font-bold text-charcoal-800">
                      {req.unitsRequired} {req.unitsRequired === 1 ? 'unit' : 'units'} needed
                    </span>
                  </div>
                  <Badge
                    variant={req.urgency === 'CRITICAL' ? 'danger' : req.urgency === 'URGENT' ? 'warning' : 'default'}
                    size="sm"
                    className="font-bold"
                  >
                    {req.urgency}
                  </Badge>
                </div>

                <div className="text-xs text-charcoal-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-charcoal-800">
                    <Building2 className="w-3.5 h-3.5 text-crimson-600 shrink-0" />
                    <span>{req.hospitalName || 'Regional Medical Facility'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Required by: {formatDate(req.requiredDate)}</span>
                  </div>
                  {req.notes && (
                    <p className="text-charcoal-600 italic bg-charcoal-50 p-2 rounded mt-1.5">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-charcoal-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-h-[44px] text-xs"
                    disabled={respondMutation.isPending}
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'DECLINE' })}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 min-h-[44px] text-xs"
                    isLoading={respondMutation.isPending && respondMutation.variables?.id === req.id}
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'ACCEPT' })}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Accept Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
