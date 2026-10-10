import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Hospital, UserPlus, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { createHospitalAccountSchema } from '@/lib/validation';
import { extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import ErrorMessage from '@/components/feedback/ErrorMessage';

export const CreateHospitalPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createHospitalAccountSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      hospitalName: '',
      registrationNumber: '',
      address: '',
      city: '',
      state: '',
      contactPhone: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createHospitalAccount(data),
    onSuccess: (res) => {
      toast.success(
        `Hospital account for "${res.hospitalName}" created successfully!`
      );
      navigate('/admin/hospitals');
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        setServerError({
          message:
            'A hospital account or facility with this email or registration number already exists.',
        });
      } else {
        const msg = extractErrorMessage(err, 'Failed to create hospital account.');
        setServerError({
          message: msg,
          details: err.response?.data?.details || [],
        });
      }
    },
  });

  const onSubmit = (data) => {
    setServerError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-charcoal-900">
          Create Hospital Account
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Authorized admin provisioning of hospital credentials and official blood bank records.
        </p>
      </div>

      <Card
        title="Hospital Administrator & Facility Details"
        subtitle="This provisioned account will be given ROLE_HOSPITAL and linked directly to the facility."
      >
        {serverError && (
          <ErrorMessage
            message={serverError.message}
            details={serverError.details}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Facility Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-charcoal-800 uppercase tracking-wider border-b border-charcoal-100 pb-2 flex items-center gap-2">
              <Hospital className="w-4 h-4 text-crimson-600" />
              1. Hospital / Facility Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="hospitalName"
                  label="Official Hospital Name"
                  placeholder="e.g. Metro General Hospital"
                  required
                  error={errors.hospitalName?.message}
                  {...register('hospitalName')}
                />
              </div>

              <Input
                id="registrationNumber"
                label="State / National Registration #"
                placeholder="REG-HOSP-001"
                required
                hint="Unique license identifier"
                error={errors.registrationNumber?.message}
                {...register('registrationNumber')}
              />

              <Input
                id="contactPhone"
                type="tel"
                label="Hospital Emergency Contact Phone"
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
                  label="Street Address"
                  placeholder="100 Health Blvd Suite 200"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          {/* Account Login Credentials */}
          <div className="space-y-4 pt-4 border-t border-charcoal-200">
            <h3 className="text-sm font-bold text-charcoal-800 uppercase tracking-wider border-b border-charcoal-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-crimson-600" />
              2. Hospital Administrator Login Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="fullName"
                label="Administrator Full Name"
                placeholder="Dr. Sarah Connor"
                required
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                id="phoneNumber"
                type="tel"
                label="Admin Phone Number"
                placeholder="+1-212-555-0144"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
              />

              <Input
                id="email"
                type="email"
                label="Official Hospital Email (Login ID)"
                placeholder="admin@metrohealth.org"
                required
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                id="password"
                label="Initial Temporary Password"
                placeholder="••••••••"
                required
                isPassword
                hint="At least 8 characters long"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-h-[44px]"
              isLoading={isSubmitting || createMutation.isPending}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create & Provision Hospital
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateHospitalPage;
