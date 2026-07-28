/**
 * Utility to parse bank SMS messages and extract transaction details.
 * Specially tuned for Indian Bank SMS formats (UPI, IMPS, NEFT, POS).
 */

export function parseBankSMS(smsText) {
  if (!smsText) return null;

  const text = smsText.toLowerCase();

  // 1. Determine transaction type (expense or income)
  // Look for keywords indicating debit or credit
  const isDebit = /(debited|deducted|spent|paid|withdrawal|transfer to|sent to|dr)/i.test(text);
  const isCredit = /(credited|added|received|deposited|cr)/i.test(text);
  
  // Exclude failure messages
  if (/(failed|declined|unsuccessful)/i.test(text)) {
    return { error: 'Transaction failed or declined.' };
  }

  if (!isDebit && !isCredit) {
    return { error: 'Could not determine if transaction is credit or debit.' };
  }

  // 2. Extract Amount
  // Matches typical currency patterns like INR 500, Rs. 500, Rs 500.00, INR500
  const amountRegex = /(?:rs\.?|inr|usd|\$)\s*([\d,]+\.?\d*)/i;
  const amountMatch = smsText.match(amountRegex);
  
  // 3. Extract Available Balance
  const balanceRegex = /(?:balance|bal|avl bal|available balance|avail bal).+?(?:rs\.?|inr|usd|\$)\s*([\d,]+\.?\d*)/i;
  const balanceMatch = smsText.match(balanceRegex);

  // 4. Extract Account Number (usually last 3-4 digits masked like XX1234 or a/c 1234)
  const accountRegex = /(?:a\/c|acct|account|a\/c no|card|x)[^\d]*(\d{3,4})\b/i;
  const accountMatch = smsText.match(accountRegex);

  // 5. Extract Date 
  // Supports DD-MM-YY, DD/MM/YYYY, DD-MMM-YY, etc.
  const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]{3}\s*\d{2,4}|\d{1,2}[a-zA-Z]{3}\d{2,4})/;
  const dateMatch = smsText.match(dateRegex);

  // Parse values safely
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
  const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : null;
  const account = accountMatch ? accountMatch[1] : null;
  
  // Format the date if we found one
  let displayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (dateMatch) {
    // Keep it as the raw matched string for simplicity, or we could parse it
    displayDate = dateMatch[1].toUpperCase(); 
  }

  if (!amount) {
    return { error: 'Could not extract transaction amount.' };
  }

  // Determine type
  // If both match, look closer: "debited" usually strongly implies expense.
  let type = 'expense';
  if (isCredit && !/(debited|deducted|spent|paid)/i.test(text)) {
    type = 'income';
  }

  return {
    type,
    amount,
    balance,
    account,
    date: displayDate,
    originalText: smsText,
    merchant: extractMerchant(text)
  };
}

// Advanced heuristic to find merchant/sender name
function extractMerchant(text) {
  let merchant = null;

  // 1. UPI Info string format (Info: UPI/123456789012/Merchant Name/vpa@bank/...)
  const upiMatch = text.match(/upi\/(?:\d+)\/([^\/]+)\/([^\/]+)/i);
  if (upiMatch && upiMatch[1]) {
    merchant = upiMatch[1];
  }

  // 2. VPA matches (e.g. "to VPA abc@okicici")
  if (!merchant) {
    const vpaMatch = text.match(/vpa\s+([a-z0-9._-]+@[a-z]+)/i);
    if (vpaMatch) merchant = vpaMatch[1];
  }

  // 3. standard "to XYZ" / "at XYZ" / "transfer to XYZ" / "by XYZ"
  if (!merchant) {
    const commonMatch = text.match(/(?:payment of(?:.+?)to|transfer to|sent to|at|to|by)\s+([a-z0-9\s*]+?)(?:\s+(?:on|via|ref|card|from|avl|bal|val|available)|$)/i);
    if (commonMatch && commonMatch[1]) {
      merchant = commonMatch[1].trim();
    }
  }

  if (merchant) {
    merchant = merchant.replace(/(?:a\/c|account).*$/i, '').trim(); // clean up trailing account info
    
    // Check if valid string length and doesn't just contain numbers
    if (merchant.length > 1 && merchant.length < 35 && /[a-z]/i.test(merchant)) {
      // Capitalize first letters
      return merchant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  return 'Unknown Transaction';
}
