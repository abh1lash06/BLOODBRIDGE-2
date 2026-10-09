import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Droplet, ArrowLeft, Send } from 'lucide-react';
import { bloodRequestCreateSchema } from '@/lib/validation';
import { bloodRequestApi } from '@/api/bloodRequest.api';
import { hospitalApi } from '@/api/hospital.api';
import { BLOOD_GROUPS, URGENCIES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import Textarea from '@/components/forms/Textarea';

export const CreateRequestPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  // Load verified hospitals list for optional dropdown
  const { data: hospitalData } = useQuery({
    queryKey: ['hospitals', 'list'],
    queryFn: () => hospitalApi.listVerifiedHospitals({ page: 0, size: 50 }),
  });

  const hospitals = hospitalData?.content || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bloodRequestCreateSchema),
    defaultValues: {
      bloodGroup: '',
      unitsRequired: 1,
      urgency: 'NORMAL',
      requiredDate: '',
      hospitalId: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Format payload according to API contract
      const payload = {
        bloodGroup: data.bloodGroup,
        unitsRequired: Number(data.unitsRequired),
        urgency: data.urgency,
        requiredDate: data.requiredDate,
        notes: data.notes || '',
      };
      if (data.hospitalId) {
        payload.hospitalId = Number(data.hospitalId);
      }
      return bloodRequestApi.createRequest(payload);
    },
    onSuccess: () => {
      toast.success('Your blood request has been created successfully.');
      navigate('/patient');
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to create blood request.');
      toast.error(msg);
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/patient">
          <Button variant="ghost" size="sm" aria-label="Go back">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <Card
        title="Submit New Blood Request"
        subtitle="Fill in the clinical requirements to dispatch to medical facilities and registered donors."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="bloodGroup"
              label="Blood Group Required"
              required
              options={BLOOD_GROUPS.map((b) => ({
                value: b.code,
                label: `${b.label} (${b.code})`,
              }))}
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
            />

            <Input
              id="unitsRequired"
              type="number"
              label="Units Required (Bags)"
              min={1}
              max={100}
              required
              error={errors.unitsRequired?.message}
              {...register('unitsRequired')}
            />

            <Select
              id="urgency"
              label="Urgency Level"
              required
              options={[
                { value: URGENCIES.NORMAL, label: 'Normal (Routine Procedure)' },
                { value: URGENCIES.URGENT, label: 'Urgent (Within 24-48 Hours)' },
                { value: URGENCIES.CRITICAL, label: 'Critical (Immediate ICU / ER)' },
              ]}
              error={errors.urgency?.message}
              {...register('urgency')}
            />

            <Input
              id="requiredDate"
              type="date"
              label="Required By Date"
              required
              hint="Must be a future date"
              error={errors.requiredDate?.message}
              {...register('requiredDate')}
            />

            <div className="sm:col-span-2">
              <Select
                id="hospitalId"
                label="Assign Specific Hospital (Optional)"
                placeholder="Open to all verified hospitals"
                options={hospitals.map((h) => ({
                  value: String(h.id),
                  label: `${h.hospitalName} (${h.city}, ${h.state})`,
                }))}
                hint="Leave empty if this is a general open request across the region."
                error={errors.hospitalId?.message}
                {...register('hospitalId')}
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                id="notes"
                label="Clinical Notes / Patient Details"
                placeholder="Include doctor's notes, operation details, ward number, or instructions (max 1000 characters)"
                rows={4}
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
            <Link to="/patient">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1.5" />
              Submit Blood Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateRequestPage;
