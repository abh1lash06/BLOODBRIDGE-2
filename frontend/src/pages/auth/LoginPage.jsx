import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/lib/formatters';
import { ROLES } from '@/lib/constants';
import Input from '@/components/forms/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      toast.success(`Welcome back, ${response.fullName}!`);

      // Redirect based on role
      switch (response.role) {
        case ROLES.DONOR:
          navigate('/donor');
          break;
        case ROLES.PATIENT:
          navigate('/patient');
          break;
        case ROLES.HOSPITAL:
          navigate('/hospital');
          break;
        case ROLES.ADMIN:
          navigate('/admin');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to log in. Please check your credentials.');
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Welcome to BloodBridge
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Sign in to access your donation dashboard, blood requests, or hospital inventory.
          </p>
        </div>

        <Card className="p-8 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="name@example.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              placeholder="••••••••"
              required
              isPassword
              autoComplete="current-password"
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
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-charcoal-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-crimson-600 hover:text-crimson-700"
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
