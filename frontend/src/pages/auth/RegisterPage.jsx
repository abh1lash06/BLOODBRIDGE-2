import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Heart, Users } from 'lucide-react';
import { registerSchema } from '@/lib/validation';
import { authApi } from '@/api/auth.api';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/lib/formatters';
import { ROLES } from '@/lib/constants';
import Input from '@/components/forms/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/feedback/ErrorMessage';

export const RegisterPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: ROLES.DONOR,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await authApi.register(data);
      toast.success(
        'Registration successful! Please sign in with your new credentials.'
      );
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 409) {
        setServerError({
          message: 'An account with this email address already exists. Please sign in or use a different email.',
        });
      } else {
        const msg = extractErrorMessage(err, 'Failed to complete registration.');
        setServerError({
          message: msg,
          details: err.response?.data?.details || [],
        });
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Join BloodBridge to donate blood or request emergency blood supplies.
          </p>
        </div>

        <Card className="p-8 shadow-md">
          {serverError && (
            <ErrorMessage
              message={serverError.message}
              details={serverError.details}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Account Type Selector */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                I want to join as: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', ROLES.DONOR)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedRole === ROLES.DONOR
                      ? 'border-crimson-600 bg-crimson-50 text-crimson-700 ring-2 ring-crimson-500'
                      : 'border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50'
                  }`}
                >
                  <Heart className="w-4 h-4 text-crimson-600" />
                  Blood Donor
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', ROLES.PATIENT)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedRole === ROLES.PATIENT
                      ? 'border-crimson-600 bg-crimson-50 text-crimson-700 ring-2 ring-crimson-500'
                      : 'border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-crimson-600" />
                  Patient / Family
                </button>
              </div>
              {errors.role && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <Input
              id="fullName"
              label="Full Name"
              placeholder="e.g. Jane Doe"
              required
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="phoneNumber"
              type="tel"
              label="Phone Number"
              placeholder="+1-555-0199"
              autoComplete="tel"
              hint="Optional. Used for urgent blood request contacts."
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <Input
              id="password"
              label="Password"
              placeholder="At least 8 characters"
              required
              isPassword
              autoComplete="new-password"
              hint="Must be between 8 and 100 characters long."
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-charcoal-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-crimson-600 hover:text-crimson-700"
            >
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
