import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Send,
  ExternalLink,
  QrCode as QrIcon,
  Sparkles,
  Smartphone
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
  const [isSharingImage, setIsSharingImage] = useState(false);
  const canvasRef = useRef(null);

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

  // Direct QR Code web image URL (shows instant image preview & allows 1-tap open/download)
  const qrWebImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}`;

  // Generate high-resolution local canvas QR dataURL for direct device sharing & download
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

  // Pre-formatted message text
  const messageText = 
`Namaste ${student.guardian_name || 'Parent'},
This is a fee reminder from *${institute.name}*.

Student: *${student.name}*
Pending Period: *${monthsText}*
*Exact Amount Due: ₹${targetAmount.toLocaleString('en-IN')}*

📷 *Attached Instant UPI QR Code:*
${qrWebImageUrl}

🔗 *Direct UPI Payment Link (GPay / PhonePe / Paytm):*
${upiLink}

*UPI ID:* \`${institute.upi_id}\`
*Institute:* ${institute.upi_name || institute.name}

Please scan the QR photo above or tap the link to pay the exact amount directly.
If already paid, kindly reply with the transaction screenshot.
Thank you!`;

  const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;

  // 1. Native Web Share API with actual QR image file (Direct WhatsApp image send on Android & Mobile)
  const handleShareQrImageAndMessage = async () => {
    setIsSharingImage(true);
    try {
      if (qrDataUrl && navigator.canShare) {
        // Convert dataURL to Blob / File
        const res = await fetch(qrDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `fee_qr_${student.name.replace(/\s+/g, '_')}_${targetAmount}.png`, {
          type: 'image/png'
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Fee QR Code - ${student.name}`,
            text: messageText
          });
          setIsSharingImage(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Native share error or dismissed:', err);
    }
    setIsSharingImage(false);
    // Fallback: Open WhatsApp with full message and direct QR link
    window.open(waLink, '_blank');
  };

  // 2. Download QR photo to device
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `UPI_QR_${student.name.replace(/\s+/g, '_')}_Rs${targetAmount}.png`;
    link.click();
  };

  // 3. Copy message text
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
                Send Fee Reminder with UPI QR
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
          {/* QR PHOTO CARD - Pre-configured with exact amount */}
          <div className="bg-linear-to-b from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full mb-2.5">
              <Sparkles size={13} />
              <span>UPI QR Preset to ₹{targetAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* QR Photo Container with Indian UPI Badge */}
            <div className="relative bg-white p-3 rounded-2xl shadow-md border border-slate-200/90 mb-2">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`UPI QR Code for ${student.name}`} 
                  className="w-48 h-48 rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
              <div className="mt-1 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
                BHIM UPI • GPay • PhonePe • Paytm
              </div>
            </div>

            <div className="text-sm font-black text-slate-900">
              {student.name}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Exact Amount: <span className="font-bold text-emerald-700">₹{targetAmount.toLocaleString('en-IN')}</span> ({monthsText})
            </div>

            {/* UPI ID Info */}
            <div className="mt-2.5 w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-mono text-slate-700 text-[11px] truncate">{institute.upi_id}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(institute.upi_id);
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                }}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-[11px] ml-2 shrink-0"
              >
                {copiedUpi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
              </button>
            </div>
          </div>

          {/* MESSAGE PREVIEW */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Message Preview
              </span>
              <button
                onClick={handleCopyMessage}
                className="text-[11px] text-blue-600 font-bold flex items-center gap-1"
              >
                {copiedText ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200/80 max-h-28 overflow-y-auto leading-relaxed">
              {messageText}
            </p>
          </div>

          {/* ACTION BUTTONS (48px+ Touch targets for ₹8,000 Android phones) */}
          <div className="space-y-2 pt-1">
            {/* Primary Action: Share QR Image & Message directly */}
            <button
              onClick={handleShareQrImageAndMessage}
              className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Send size={18} />
              <span>Send QR Photo & Message on WhatsApp</span>
            </button>

            {/* Secondary: Download QR Photo & Open Chat */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQr}
                className="min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 active:scale-98 transition-transform"
              >
                <Download size={15} />
                <span>Save QR Photo</span>
              </button>

              <button
                onClick={() => window.open(waLink, '_blank')}
                className="min-h-[44px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 active:scale-98 transition-transform"
              >
                <Smartphone size={15} />
                <span>Open WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
