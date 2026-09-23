export default function formatCurrency(amount, { locale = 'en-KE', currency = 'KES', showZero = true } = {}) {
  if (amount === null || amount === undefined) return '—';
  if (!showZero && amount === 0) return '—';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
}
