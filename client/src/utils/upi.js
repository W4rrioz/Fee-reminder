/**
 * Generates dynamic UPI Intent URL for seamless payment on PhonePe, GPay, Paytm, etc.
 * Spec: upi://pay?pa={upi_id}&pn={recipient_name}&am={amount}&cu=INR&tn={note}&tr={ref_id}
 */
export const generateUpiLink = ({ upiId, upiName, amount, note = '', refId = '' }) => {
  const cleanUpi = encodeURIComponent(upiId || 'institute@upi');
  const cleanName = encodeURIComponent(upiName || 'Institute Fees');
  const cleanAmount = Number(amount || 0).toFixed(2);
  const cleanNote = encodeURIComponent(note || 'Fee Payment');
  const cleanRef = encodeURIComponent(refId || `TR${Date.now()}`);

  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}&tr=${cleanRef}`;
};

/**
 * Builds pre-formatted WhatsApp message for fee reminders
 */
export const generateWhatsAppReminder = ({
  studentName,
  guardianName,
  guardianPhone,
  month,
  amount,
  dueDate,
  instituteName,
  upiId,
  upiName,
  dueId
}) => {
  const cleanPhone = String(guardianPhone || '').replace(/\D/g, '');
  // Format Indian phone number: if 10 digits, prepend 91
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const upiLink = generateUpiLink({
    upiId,
    upiName,
    amount,
    note: `Fee for ${studentName}`,
    refId: dueId || `REF${Date.now()}`
  });

  // Direct QR Code image URL generated specifically for this exact amount and UPI ID
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Due Soon';

  const message = 
`Namaste ${guardianName || 'Parent'},
This is a gentle reminder from *${instituteName}*.

The fee for *${studentName}* (${month || 'Current Month'}) of *₹${Number(amount).toLocaleString('en-IN')}* is due on *${formattedDueDate}*.

🔗 *Direct UPI App Link (GPay / PhonePe / Paytm):*
${upiLink}

*UPI ID:* \`${upiId}\`
*Payee:* ${upiName || instituteName}
*Amount:* ₹${Number(amount).toLocaleString('en-IN')}

If already paid, please ignore this message or reply with screenshot.
Thank you!`;

  const encodedUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  return {
    whatsappUrl: encodedUrl,
    messageText: message,
    upiLink,
    qrImageUrl,
    formattedPhone
  };
};

/**
 * Builds pre-formatted WhatsApp message for multiple unpaid months reminder
 */
export const generateCumulativeWhatsAppReminder = ({
  studentName,
  guardianName,
  guardianPhone,
  unpaidMonths = [],
  totalAmount,
  instituteName,
  upiId,
  upiName,
  studentId
}) => {
  const cleanPhone = String(guardianPhone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const upiLink = generateUpiLink({
    upiId,
    upiName,
    amount: totalAmount,
    note: `Fees (${unpaidMonths.length} mos) for ${studentName}`,
    refId: `CUM-${studentId || 'STD'}-${Date.now()}`
  });

  // Direct QR Code image URL generated specifically for this exact cumulative amount and UPI ID
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const monthsText = unpaidMonths.length > 0 ? unpaidMonths.join(', ') : 'Pending Dues';

  const message =
`Namaste ${guardianName || 'Parent'},
This is a gentle reminder from *${instituteName}*.

The total fee dues for *${studentName}* are *₹${Number(totalAmount).toLocaleString('en-IN')}* across ${unpaidMonths.length} unpaid month(s):
📌 *Months:* ${monthsText}

🔗 *Direct UPI App Link (GPay / PhonePe / Paytm):*
${upiLink}

*UPI ID:* \`${upiId}\`
*Payee:* ${upiName || instituteName}
*Exact Total Amount:* ₹${Number(totalAmount).toLocaleString('en-IN')}

If already paid, please ignore this message or reply with screenshot.
Thank you!`;

  const encodedUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  return {
    whatsappUrl: encodedUrl,
    messageText: message,
    upiLink,
    qrImageUrl,
    formattedPhone
  };
};

