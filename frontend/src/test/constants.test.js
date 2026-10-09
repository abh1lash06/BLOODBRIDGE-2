import { describe, it, expect } from 'vitest';
import {
  BLOOD_GROUPS,
  canTransitionRequestStatus,
  REQUEST_STATUS,
  ROLES,
} from '@/lib/constants';

describe('Constants & Domain Rules', () => {
  it('should define all 8 standard blood groups with code and display labels', () => {
    expect(BLOOD_GROUPS).toHaveLength(8);
    const codes = BLOOD_GROUPS.map((bg) => bg.code);
    expect(codes).toContain('A_POSITIVE');
    expect(codes).toContain('O_NEGATIVE');
    expect(codes).toContain('AB_POSITIVE');
  });

  it('should enforce legal blood request status transitions according to API specification', () => {
    // PENDING can transition to APPROVED, REJECTED, or CANCELLED
    expect(canTransitionRequestStatus(REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED)).toBe(true);
    expect(canTransitionRequestStatus(REQUEST_STATUS.PENDING, REQUEST_STATUS.REJECTED)).toBe(true);
    expect(canTransitionRequestStatus(REQUEST_STATUS.PENDING, REQUEST_STATUS.CANCELLED)).toBe(true);
    expect(canTransitionRequestStatus(REQUEST_STATUS.PENDING, REQUEST_STATUS.FULFILLED)).toBe(false);

    // APPROVED can transition to FULFILLED or CANCELLED
    expect(canTransitionRequestStatus(REQUEST_STATUS.APPROVED, REQUEST_STATUS.FULFILLED)).toBe(true);
    expect(canTransitionRequestStatus(REQUEST_STATUS.APPROVED, REQUEST_STATUS.CANCELLED)).toBe(true);
    expect(canTransitionRequestStatus(REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED)).toBe(false);

    // Terminal states cannot transition further
    expect(canTransitionRequestStatus(REQUEST_STATUS.FULFILLED, REQUEST_STATUS.APPROVED)).toBe(false);
    expect(canTransitionRequestStatus(REQUEST_STATUS.REJECTED, REQUEST_STATUS.APPROVED)).toBe(false);
    expect(canTransitionRequestStatus(REQUEST_STATUS.CANCELLED, REQUEST_STATUS.PENDING)).toBe(false);
  });
});
