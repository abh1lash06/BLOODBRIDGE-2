import { z } from 'zod';
import { BLOOD_GROUPS, ROLES, URGENCIES, GENDERS } from './constants';

const bloodGroupCodes = BLOOD_GROUPS.map((b) => b.code);
const urgencyCodes = Array.isArray(URGENCIES)
  ? URGENCIES.map((u) => u.code)
  : Object.values(URGENCIES);
const genderCodes = GENDERS.map((g) => g.code);

/**
 * Public Registration Schema
 * Only PATIENT and DONOR allowed. Follows RegisterRequest DTO.
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  role: z.enum([ROLES.PATIENT, ROLES.DONOR], {
    errorMap: () => ({ message: 'Please select a valid account role (Patient or Donor)' }),
  }),
  phoneNumber: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Blood Request Creation Schema
 * Follows BloodRequestCreateDTO.
 */
export const bloodRequestCreateSchema = z.object({
  bloodGroup: z.enum(bloodGroupCodes, {
    errorMap: () => ({ message: 'Please select a valid blood group' }),
  }),
  unitsRequired: z.coerce
    .number({ invalid_type_error: 'Units must be a number' })
    .int('Units must be an integer')
    .min(1, 'At least 1 unit is required')
    .max(100, 'Maximum 100 units allowed per request'),
  urgency: z.enum(urgencyCodes, {
    errorMap: () => ({ message: 'Please select urgency level' }),
  }),
  requiredDate: z
    .string()
    .min(1, 'Required date is required')
    .refine((val) => {
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected > today;
    }, { message: 'Required date must be in the future' }),
  hospitalId: z.coerce
    .number()
    .nullable()
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Blood Request Update Schema
 * Follows BloodRequestUpdateDTO.
 */
export const bloodRequestUpdateSchema = z.object({
  unitsRequired: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 unit is required')
    .max(100, 'Maximum 100 units allowed')
    .optional(),
  urgency: z.enum(urgencyCodes).optional(),
  requiredDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const selected = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected > today;
    }, { message: 'Required date must be in the future' }),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  status: z.string().optional(),
});

/**
 * Donor Profile Update Schema
 * Follows DonorProfileUpdateRequest.
 * Privileged fields (verificationStatus, owner ID) are strictly excluded.
 */
export const donorProfileUpdateSchema = z.object({
  bloodGroup: z.enum(bloodGroupCodes, {
    errorMap: () => ({ message: 'Please select a blood group' }),
  }),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const dob = new Date(val);
      const today = new Date();
      return dob < today;
    }, { message: 'Date of birth must be in the past' }),
  gender: z.enum(genderCodes, {
    errorMap: () => ({ message: 'Please select gender' }),
  }),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(500, 'Address cannot exceed 500 characters'),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  availableToDonate: z.boolean().optional(),
});

/**
 * Patient Profile Update Schema
 * Follows PatientProfileUpdateRequest.
 */
export const patientProfileUpdateSchema = z.object({
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactName: z
    .string()
    .max(20, 'Contact name cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .max(20, 'Contact phone cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Hospital Profile Update Schema
 * Follows HospitalUpdateRequest.
 */
export const hospitalUpdateSchema = z.object({
  hospitalName: z
    .string()
    .max(255, 'Hospital name cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .max(20, 'Contact phone cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Blood Inventory Update Schema
 * Follows InventoryUpdateRequest.
 */
export const inventoryUpdateSchema = z.object({
  bloodGroup: z.enum(bloodGroupCodes, {
    errorMap: () => ({ message: 'Please select a blood group' }),
  }),
  availableUnits: z.coerce
    .number({ invalid_type_error: 'Units must be a number' })
    .int('Units must be an integer')
    .min(0, 'Available units cannot be negative'),
});

/**
 * Admin Create Hospital Account Schema
 * Follows CreateHospitalAccountRequest.
 */
export const createHospitalAccountSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Administrator/Contact full name is required')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .min(1, 'Hospital email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  phoneNumber: z
    .string()
    .max(20, 'Phone cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
  hospitalName: z
    .string()
    .min(1, 'Hospital name is required')
    .max(255, 'Hospital name cannot exceed 255 characters'),
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .max(50, 'Registration number cannot exceed 50 characters'),
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .max(20, 'Contact phone cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Admin Reject Donor Schema
 * Follows RejectRequest.
 */
export const rejectDonorSchema = z.object({
  reason: z
    .string()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});
