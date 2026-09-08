/**
 * Utility to parse raw M-Pesa text messages/payloads.
 *
 * Callers (functions/async/mpesaWebhookHandler.js, services/transactionService.js)
 * call `parseMessage(text)` and read `amount`/`type`/`phoneNumber`/`mpesaCode`/
 * `merchant`/`description`/`reference`/`timestamp` off the result - this was
 * previously exported as `parseMpesaText` with a different field shape
 * (transactionCode/recipientOrSender/date/time), so every call site was silently
 * broken. Renamed and extended (type + phoneNumber extraction, epoch timestamp)
 * to match what's actually called, using the same regex approach as before.
 *
 * NOTE: patterns are based on documented Safaricom message formats and have not
 * been validated against live Daraja sandbox/production messages - verify against
 * real messages before relying on this for production transactions.
 */

// Regex patterns based on standard Safaricom M-Pesa SMS formats
const PATTERNS = {
  // e.g. "QJK1234567 Confirmed. Ksh1,500.00 sent to..." or "paid to..."
  transactionCode: /^\s*([A-Z0-9]{10})\b/i,
  amount: /(?:Ksh|KSH)\s*([\d,]+\.?\d*)/i,
  balance: /balance is (?:Ksh|KSH)\s*([\d,]+\.?\d*)/i,
  phoneNumber: /\b(0[71][0-9]{8}|254[71][0-9]{8})\b/,
  dateTime: /on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i
};

// Sender/recipient name capture, keyed by transaction type - "sent to"/"paid to"
// are followed directly by the name, but "received" messages read "...Ksh500.00
// from NAME..." so "from" isn't adjacent to "received". The optional phone number
// is excluded from the captured group so it doesn't get swallowed into the name.
const PARTY_PATTERNS = {
  sent: /sent to\s+([A-Za-z .'-]+?)(?:\s+(?:0[71][0-9]{8}|254[71][0-9]{8}))?\s*(?=\s+on|\.|$)/i,
  received: /\bfrom\s+([A-Za-z .'-]+?)(?:\s+(?:0[71][0-9]{8}|254[71][0-9]{8}))?\s*(?=\s+on|\.|$)/i,
  paid: /paid to\s+([A-Za-z0-9 .'-]+?)\s*(?=\s+on|\.|$)/i,
};

const parseType = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('received') || lower.includes('you have received')) return 'received';
  if (lower.includes('sent to')) return 'sent';
  if (lower.includes('paid to')) return 'paid';
  if (lower.includes('withdraw')) return 'withdrawn';
  return 'unknown';
};

const parseTimestamp = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return Date.now();

  const [day, month, yearRaw] = dateStr.split('/').map((n) => parseInt(n, 10));
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

  const timeMatch = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*([APap][Mm])?/);
  if (!timeMatch) return Date.now();

  const [, hourRaw, minute, meridiem] = timeMatch;
  let hour = parseInt(hourRaw, 10);
  if (meridiem) {
    if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
  }

  const date = new Date(year, month - 1, day, hour, parseInt(minute, 10));
  return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
};

/**
 * Parses a raw M-Pesa SMS text string into structured transaction data.
 * Returns null if the text doesn't look like an M-Pesa confirmation message.
 *
 * @param {string} text - The raw M-Pesa text string
 * @returns {Object|null} Parsed transaction details
 */
function parseMessage(text) {
  if (!text || typeof text !== 'string' || !/confirmed/i.test(text)) {
    return null;
  }

  const codeMatch = text.match(PATTERNS.transactionCode);
  const amountMatch = text.match(PATTERNS.amount);
  const balanceMatch = text.match(PATTERNS.balance);
  const phoneMatch = text.match(PATTERNS.phoneNumber);
  const dateTimeMatch = text.match(PATTERNS.dateTime);

  const mpesaCode = codeMatch ? codeMatch[1].toUpperCase() : null;
  const type = parseType(text);
  const partyPattern = PARTY_PATTERNS[type];
  const partyMatch = partyPattern ? text.match(partyPattern) : null;
  const merchant = partyMatch ? partyMatch[1].trim() : null;

  return {
    mpesaCode,
    reference: mpesaCode,
    amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
    balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : null,
    type,
    phoneNumber: phoneMatch ? phoneMatch[1] : null,
    merchant,
    description: merchant,
    timestamp: parseTimestamp(dateTimeMatch?.[1], dateTimeMatch?.[2]),
    raw: text,
  };
}

module.exports = {
  parseMessage
};