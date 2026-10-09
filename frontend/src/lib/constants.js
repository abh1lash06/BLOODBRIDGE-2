// BloodBridge Application Constants & Mapping Rules

export const BLOOD_GROUPS = [
  { code: 'A_POSITIVE', label: 'A+' },
  { code: 'A_NEGATIVE', label: 'A-' },
  { code: 'B_POSITIVE', label: 'B+' },
  { code: 'B_NEGATIVE', label: 'B-' },
  { code: 'AB_POSITIVE', label: 'AB+' },
  { code: 'AB_NEGATIVE', label: 'AB-' },
  { code: 'O_POSITIVE', label: 'O+' },
  { code: 'O_NEGATIVE', label: 'O-' },
];

export const BLOOD_GROUP_MAP = Object.fromEntries(
  BLOOD_GROUPS.map((bg) => [bg.code, bg.label])
);

export const LABEL_TO_BLOOD_GROUP = Object.fromEntries(
  BLOOD_GROUPS.map((bg) => [bg.label, bg.code])
);

export const ROLES = {
  PATIENT: 'PATIENT',
  DONOR: 'DONOR',
  HOSPITAL: 'HOSPITAL',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  PATIENT: 'Patient / Recipient',
  DONOR: 'Blood Donor',
  HOSPITAL: 'Hospital / Blood Bank',
  ADMIN: 'System Administrator',
};

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  UNVERIFIED: 'UNVERIFIED',
};
export const VERIFICATION_STATUSES = VERIFICATION_STATUS;

export const URGENCIES = {
  NORMAL: 'NORMAL',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL',
};

export const URGENCY_LIST = [
  { code: 'NORMAL', label: 'Normal', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { code: 'URGENT', label: 'Urgent', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { code: 'CRITICAL', label: 'Critical', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};
export const REQUEST_STATUSES = REQUEST_STATUS;

/**
 * Checks if a status transition is legally permitted by the backend.
 * - PENDING -> APPROVED | REJECTED | CANCELLED
 * - APPROVED -> FULFILLED | CANCELLED
 * - Terminal states: FULFILLED, REJECTED, CANCELLED cannot transition further
 */
export function canTransitionRequestStatus(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus || currentStatus === targetStatus) return false;
  switch (currentStatus) {
    case REQUEST_STATUS.PENDING:
      return [REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED, REQUEST_STATUS.CANCELLED].includes(targetStatus);
    case REQUEST_STATUS.APPROVED:
      return [REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(targetStatus);
    default:
      return false;
  }
}

export const GENDERS = [
  { code: 'MALE', label: 'Male' },
  { code: 'FEMALE', label: 'Female' },
  { code: 'OTHER', label: 'Other' },
];

export const STORAGE_KEYS = {
  TOKEN: 'bloodbridge_token',
  USER: 'bloodbridge_user',
};
