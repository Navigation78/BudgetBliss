/**
 * Utility to parse raw M-Pesa text messages/payloads.
 */

// Regex patterns based on standard Safaricom M-Pesa SMS formats
const PATTERNS = {
  // e.g. "QJK1234567 Confirmed. Ksh1,500.00 sent to..." or "paid to..."
  transactionCode: /^\s*([A-Z0-9]{10})\b/i,
  amount: /(?:Ksh|KSH)\s*([\d,]+\.?\d*)/i,
  senderOrRecipient: /(?:sent to|paid to|received from)\s+([A-Za-z0-9\s]+?)(?=\s+on|\s+at|\.|$)/i,
  dateTime: /on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i
};

/**
 * Parses a raw M-Pesa SMS text string into structured transaction data.
 * 
 * @param {string} text - The raw M-Pesa text string
 * @returns {Object} Parsed transaction details
 */
function parseMpesaText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: expected non-empty string');
  }

  const codeMatch = text.match(PATTERNS.transactionCode);
  const amountMatch = text.match(PATTERNS.amount);
  const partyMatch = text.match(PATTERNS.senderOrRecipient);
  const dateTimeMatch = text.match(PATTERNS.dateTime);

  const parsedAmount = amountMatch 
    ? parseFloat(amountMatch[1].replace(/,/g, '')) 
    : 0;

  return {
    transactionCode: codeMatch ? codeMatch[1].toUpperCase() : null,
    amount: parsedAmount,
    recipientOrSender: partyMatch ? partyMatch[1].trim() : null,
    date: dateTimeMatch ? dateTimeMatch[1] : null,
    time: dateTimeMatch ? dateTimeMatch[2] : null,
    rawText: text
  };
}

module.exports = {
  parseMpesaText
};