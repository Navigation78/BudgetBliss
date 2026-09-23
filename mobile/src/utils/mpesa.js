// Backend requires mpesaNumber in strict 254XXXXXXXXX format
// (see backend/middleware/validators.js userSchemas).
export function normalizeMpesaNumber(phone) {
  const digits = (phone || '').replace(/[^\d]/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return `254${digits}`;
}

export function isValidMpesaNumber(phone) {
  return /^254[0-9]{9}$/.test(normalizeMpesaNumber(phone));
}
