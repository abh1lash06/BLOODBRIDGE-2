// Date, string, and UI formatting utilities

export function formatDate(dateString, options = {}) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status) {
  switch (status) {
    case 'VERIFIED':
    case 'APPROVED':
    case 'FULFILLED':
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
    case 'CANCELLED':
    case 'UNVERIFIED':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function getVerificationBadgeVariant(status) {
  return getStatusBadgeVariant(status);
}

export function getUrgencyBadgeVariant(urgency) {
  switch (urgency) {
    case 'CRITICAL':
      return 'danger';
    case 'URGENT':
      return 'warning';
    case 'NORMAL':
    default:
      return 'info';
  }
}

export function extractErrorMessage(error, defaultMsg = 'An unexpected error occurred') {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMsg;
}
