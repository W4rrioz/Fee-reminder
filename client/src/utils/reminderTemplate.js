/**
 * Default reminder template used when no custom template is set or as safe fallback.
 */
export const DEFAULT_REMINDER_TEMPLATE = `Dear Parent,

This is a reminder from {institute_name} regarding the fee dues for {student_name}.

• Amount Due: ₹{amount}
• Due Date: {due_date}
• Status: {status}

Payment Details:
{payment_info}

Please share a screenshot after completing the payment. Thank you!`;

export const AVAILABLE_TEMPLATE_TAGS = [
  { tag: '{student_name}', label: 'Student Name', desc: 'e.g. Rahul Sharma' },
  { tag: '{amount}', label: 'Amount', desc: 'e.g. 2,500' },
  { tag: '{due_date}', label: 'Due Date', desc: 'e.g. 2026-09-01' },
  { tag: '{upi_id}', label: 'UPI ID', desc: 'e.g. institute@upi' },
  { tag: '{institute_name}', label: 'Institute Name', desc: 'e.g. Apex Academy' },
];

/**
 * Format payment information string from institute settings.
 */
export function formatPaymentInfo(settings) {
  const upiId = settings?.upi_id || '';
  const bankDetails = settings?.bank_details || '';

  const lines = [];
  if (upiId.trim()) {
    lines.push(`• UPI ID: ${upiId.trim()}`);
  }
  if (bankDetails.trim()) {
    lines.push(`• Bank Info: ${bankDetails.trim()}`);
  }

  return lines.length > 0 ? lines.join('\n') : '• Please contact institute for direct payment info.';
}

/**
 * Replace placeholders in a message template with actual student/fee/institute values.
 * Safely falls back to default template if substitution fails.
 */
export function formatReminderMessage({ template, student, fee, settings }) {
  try {
    const rawTemplate = (template && typeof template === 'string' && template.trim()) 
      ? template 
      : DEFAULT_REMINDER_TEMPLATE;

    const studentName = student?.name || 'Student';
    const amountVal = fee?.amount !== undefined && fee?.amount !== null 
      ? Number(fee.amount).toLocaleString('en-IN') 
      : '0';
    const dueDate = fee?.due_date || 'N/A';
    const status = fee?.status === 'overdue' ? 'Overdue' : 'Due Soon';
    const instituteName = settings?.name || 'our institute';
    const upiId = settings?.upi_id || '';
    const bankDetails = settings?.bank_details || '';
    const paymentInfo = formatPaymentInfo(settings);

    let message = rawTemplate
      .replace(/{student_name}/gi, studentName)
      .replace(/{amount}/gi, amountVal)
      .replace(/{due_date}/gi, dueDate)
      .replace(/{status}/gi, status)
      .replace(/{institute_name}/gi, instituteName)
      .replace(/{upi_id}/gi, upiId)
      .replace(/{bank_details}/gi, bankDetails)
      .replace(/{payment_info}/gi, paymentInfo);

    return message;
  } catch (err) {
    console.error('Error formatting custom reminder template, falling back to default:', err);
    // Safe fallback to default
    const studentName = student?.name || 'Student';
    const amountVal = fee?.amount !== undefined ? Number(fee.amount).toLocaleString('en-IN') : '0';
    const dueDate = fee?.due_date || 'N/A';
    const status = fee?.status === 'overdue' ? 'Overdue' : 'Due Soon';
    const instituteName = settings?.name || 'our institute';
    const paymentInfo = formatPaymentInfo(settings);

    return `Dear Parent,

This is a reminder from ${instituteName} regarding the fee dues for ${studentName}.

• Amount Due: ₹${amountVal}
• Due Date: ${dueDate}
• Status: ${status}

Payment Details:
${paymentInfo}

Please share a screenshot after completing the payment. Thank you!`;
  }
}

/**
 * Generate a standard WhatsApp wa.me click-to-chat URL with normalized phone.
 */
export function generateWhatsAppLink(phone, messageText) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone
    : cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
}
