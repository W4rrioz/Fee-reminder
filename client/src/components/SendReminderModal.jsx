import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Download,
  Send,
  Edit3,
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye
} from 'lucide-react';
import { generateUpiLink } from '../utils/upi';

export const SendReminderModal = ({
  isOpen,
  onClose,
  due,
  student,
  institute,
  unpaidMonths = [],
  totalAmount = null
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');

  if (!isOpen || !student) return null;

  const isCumulative = Array.isArray(unpaidMonths) && unpaidMonths.length > 1;
  const targetAmount = Number(totalAmount !== null ? totalAmount : (due?.amount || 0));
  const cleanPhone = String(student.guardian_phone || student.phone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Build standard NPCI UPI Link with exact amount preset
  const note = isCumulative
    ? `Fees (${unpaidMonths.length} mos) for ${student.name}`
    : `Fees for ${student.name} - ${due?.month || 'Current Month'}`;
  
  const upiLink = generateUpiLink({
    upiId: institute.upi_id,
    upiName: institute.upi_name || institute.name,
    amount: targetAmount,
    note,
    refId: due?.id || `REM-${student.id}-${Date.now().toString().slice(-6)}`
  });

  // Generate high-resolution local QR code image for counter display & local saving
  useEffect(() => {
    if (institute?.upi_id) {
      QRCode.toDataURL(
        upiLink,
        {
          width: 500,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [upiLink, institute]);

  const monthsText = isCumulative
    ? unpaidMonths.join(', ')
    : (due?.month || 'Current Month');

  // Default clean message text without QR photo link
  const defaultMessage = 
`Namaste ${student.guardian_name || 'Parent'},
This is a gentle reminder from *${institute.name}*.

Student: *${student.name}*
Pending Fee Period: *${monthsText}*
*Exact Amount Due: ₹${targetAmount.toLocaleString('en-IN')}*

🔗 *Tap to Pay with UPI (GPay / PhonePe / Paytm):*
${upiLink}

*UPI ID:* \`${institute.upi_id}\`
*Payee Name:* ${institute.upi_name || institute.name}

If already paid, kindly reply with the transaction screenshot.
Thank you!`;

  // Initialize or reset edited message
  useEffect(() => {
    setEditedMessage(defaultMessage);
    setIsEditing(false);
  }, [isOpen, due, student]);

  const currentMessage = editedMessage || defaultMessage;
  const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(currentMessage)}`;

  // Download QR photo to local device
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `UPI_QR_${student.name.replace(/\s+/g, '_')}_Rs${targetAmount}.png`;
    link.click();
  };

  // Copy message text
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleResetMessage = () => {
    setEditedMessage(defaultMessage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-base font-black text-slate-900">
                Payment Reminder & QR
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.name} • <span className="font-bold text-slate-800">₹{targetAmount.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* QR PHOTO DISPLAY (In-App Only with exact amount preset) */}
          <div className="bg-linear-to-b from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full mb-2.5">
              <Sparkles size={13} />
              <span>Exact Amount UPI QR (₹{targetAmount.toLocaleString('en-IN')})</span>
            </div>

            {/* QR Photo Container */}
            <div className="relative bg-white p-3 rounded-2xl shadow-md border border-slate-200/90 mb-2">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`UPI QR Code for ${student.name}`} 
                  className="w-44 h-44 rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-xl text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
              <div className="mt-1 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
                Scan with GPay • PhonePe • Paytm
              </div>
            </div>

            <div className="text-sm font-black text-slate-900">
              {student.name}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Exact Amount: <span className="font-bold text-emerald-700">₹{targetAmount.toLocaleString('en-IN')}</span> ({monthsText})
            </div>

            {/* UPI ID Info & Save Button */}
            <div className="mt-2.5 w-full flex items-center justify-between gap-1.5">
              <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="font-mono text-slate-700 text-[11px] truncate">{institute.upi_id}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(institute.upi_id);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-[11px] ml-1 shrink-0"
                >
                  {copiedUpi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadQr}
                title="Save QR Photo to Device"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1 shrink-0"
              >
                <Download size={13} />
                <span>Save QR</span>
              </button>
            </div>
          </div>

          {/* MESSAGE PREVIEW & EDIT SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isEditing ? '✏️ Edit Reminder Message' : 'Message Preview'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleResetMessage}
                      className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 rounded bg-slate-200/70 flex items-center gap-1"
                    >
                      <RotateCcw size={11} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold px-2.5 py-1 rounded bg-blue-50 border border-blue-200 flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold px-2 py-1 rounded bg-blue-50 border border-blue-100 flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      <span>Edit Message</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-[11px] text-slate-600 hover:text-slate-800 font-bold px-2 py-1 rounded bg-slate-200/60 flex items-center gap-1 ml-1"
                    >
                      {copiedText ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedText ? 'Copied' : 'Copy'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div>
                <textarea
                  rows={6}
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  placeholder="Type custom fee reminder message here..."
                  className="w-full bg-white border border-blue-400 focus:ring-2 focus:ring-blue-500 rounded-xl p-2.5 text-xs font-mono text-slate-800 leading-relaxed outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Tip: You can customize any line above before sending to WhatsApp.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200/90 max-h-36 overflow-y-auto leading-relaxed">
                {currentMessage}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS (Clean Send without attaching QR photo) */}
          <div className="pt-1">
            <button
              onClick={() => window.open(waLink, '_blank')}
              className="w-full min-h-[50px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Send size={18} />
              <span>Send Message on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
