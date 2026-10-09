import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  bloodRequestCreateSchema,
} from '@/lib/validation';

describe('Zod Validation Schemas', () => {
  it('should validate valid user registration payload', () => {
    const validData = {
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'StrongPassword123!',
      phoneNumber: '+1-555-0100',
      role: 'DONOR',
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid role in registration', () => {
    const invalidData = {
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'StrongPassword123!',
      role: 'ADMIN', // ADMIN is illegal for public registration
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject registration password with less than 8 characters', () => {
    const invalidData = {
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'short', // Min 8
      role: 'DONOR',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate blood request creation constraints', () => {
    const validRequest = {
      bloodGroup: 'O_POSITIVE',
      unitsRequired: 3,
      urgency: 'URGENT',
      requiredDate: '2026-12-31',
      notes: 'Elective procedure backup',
    };
    expect(bloodRequestCreateSchema.safeParse(validRequest).success).toBe(true);

    const invalidUnits = {
      ...validRequest,
      unitsRequired: 0, // Min is 1
    };
    expect(bloodRequestCreateSchema.safeParse(invalidUnits).success).toBe(false);
  });
});
