import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  FileText,
  BadgeCheck,
  Calendar,
  CreditCard,
  User,
  Share2
} from 'lucide-react';

export const FeeReceiptModal = ({
  isOpen = true,
  onClose,
  due,
  student,
  batch,
  institute
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !due || !student) return null;

  const receiptNo = due.reference_id && due.reference_id.startsWith('REC-')
    ? due.reference_id
    : `REC-2026-${String(due.id || Math.floor(Math.random() * 89999 + 10000)).replace(/\D/g, '').slice(-5).padStart(5, '0')}`;

  const cleanAmount = Number(due.amount || 0);
  const paidDate = due.paid_at || new Date().toISOString().split('T')[0];
  const paymentMode = (due.payment_method || 'UPI').toUpperCase();
  const refId = due.reference_id || `TXN-${Date.now().toString().slice(-6)}`;
  const guardianPhone = String(student.guardian_phone || student.phone || '').replace(/\D/g, '');
  const formattedPhone = guardianPhone.length === 10 ? `91${guardianPhone}` : guardianPhone;
  const batchName = batch?.name || 'Class 10 Foundation';

  // Format amount in Indian words helper
  const amountInWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero Rupees';
    if (num < 20) return `${a[num]} Rupees Only`;
    if (num < 100) return `${b[Math.floor(num / 10)]} ${a[num % 10]}`.trim() + ' Rupees Only';
    if (num < 1000) return `${a[Math.floor(num / 100)]} Hundred ${amountInWords(num % 100)}`.replace('Only', '').trim() + ' Rupees Only';
    if (num < 100000) return `${a[Math.floor(num / 1000)] || amountInWords(Math.floor(num / 1000)).replace(' Rupees Only', '')} Thousand ${num % 1000 !== 0 ? amountInWords(num % 1000) : 'Rupees Only'}`.trim();
    return `₹${num.toLocaleString('en-IN')} Only`;
  };

  const receiptText = `🧾 *OFFICIAL FEE PAYMENT RECEIPT / फीस रसीद*
*${institute?.name || 'EduManage Academy'}*
📍 ${institute?.city || 'Bharat'} | UPI: ${institute?.upi_id || 'N/A'}
------------------------------------
*Receipt No:* ${receiptNo}
*Date:* ${paidDate}
*Student Name:* ${student.name}
*Roll No:* #${student.roll_no || 'N/A'}
*Class / Batch:* ${batchName}
*Guardian:* ${student.guardian_name || 'Parent'}
*Fee Period:* ${due.fee_head || due.month || 'Current Month'}
------------------------------------
*Amount Paid:* ₹${cleanAmount.toLocaleString('en-IN')}
*Payment Mode:* ${paymentMode}
*Transaction Ref:* ${refId}
*Status:* ✅ VERIFIED & RECEIVED (सत्यापित भुगतान)
------------------------------------
_Thank you for your prompt payment! This is an official digitally generated receipt._
- *${institute?.name || 'EduManage Bharat'}*`;

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(receiptText);
    const targetUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Payment Recorded</span>
              <h4 className="text-sm font-bold text-white">Official Fee Receipt Voucher</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div className="p-6 bg-[#FAF7F2] font-body text-stone-900" id="fee-receipt-printable">
          {/* Institutional Header */}
          <div className="bg-white border-2 border-stone-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
            
            {/* Watermark Stamp */}
            <div className="absolute right-4 top-10 pointer-events-none select-none opacity-15 rotate-[-18deg] border-4 border-emerald-700 text-emerald-800 px-4 py-1 rounded-lg text-2xl font-black uppercase tracking-widest">
              PAID • रसीद
            </div>

            {/* Crest & Title */}
            <div className="text-center pb-4 border-b border-stone-200">
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider mb-1">
                <Building2 size={12} />
                <span>EduManage Bharat Verified Institute</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 tracking-tight">
                {institute?.name || 'Apex Tutorials & Science Academy'}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                {institute?.city || 'Kanpur, Uttar Pradesh'} • Direct Bank UPI: <span className="font-mono font-semibold">{institute?.upi_id || 'apextutorials@upi'}</span>
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="text-xs font-bold text-emerald-800 tracking-wide">
                  OFFICIAL FEE RECEIPT / आधिकारिक शुल्क रसीद
                </span>
              </div>
            </div>

            {/* Receipt Meta (Voucher No & Date) */}
            <div className="grid grid-cols-2 gap-2 py-3 border-b border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] font-bold uppercase">Receipt / Voucher No:</span>
                <span className="font-mono font-bold text-stone-900">{receiptNo}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block text-[10px] font-bold uppercase">Date of Payment:</span>
                <span className="font-semibold text-stone-900">{paidDate}</span>
              </div>
            </div>

            {/* Student & Parent Particulars */}
            <div className="py-3.5 space-y-2 border-b border-stone-200 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Student Name:</span>
                  <span className="font-bold text-stone-900 text-sm">{student.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block text-[10px] uppercase">Roll Number:</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">#{student.roll_no || '101'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Batch / Class:</span>
                  <span className="font-medium text-stone-800">{batchName}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block text-[10px] uppercase">Parent / Guardian:</span>
                  <span className="font-medium text-stone-800">{student.guardian_name || 'Parent'}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Fee Period / Head:</span>
                <span className="font-semibold text-stone-900">{due.fee_head || due.month || 'Current Tuition'}</span>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="mt-4 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Amount Received
                </span>
                <div className="text-2xl font-black text-emerald-900 font-serif tabular-nums">
                  ₹{cleanAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-700 italic">
                  {amountInWords(cleanAmount)}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full uppercase">
                  <BadgeCheck size={13} className="text-emerald-700" />
                  {paymentMode}
                </span>
                <div className="text-[10px] font-mono text-stone-500 mt-1 truncate max-w-[130px]">
                  Ref: {refId}
                </div>
              </div>
            </div>

            {/* Footer Signatory */}
            <div className="mt-5 pt-3 border-t border-dashed border-stone-300 flex items-end justify-between text-[10px] text-stone-500">
              <div>
                <span>Generated via EduManage Bharat</span>
                <div className="text-[9px] text-stone-400">0% Commission Direct Bank UPI</div>
              </div>
              <div className="text-right">
                <div className="h-6 w-24 border-b border-stone-400 mx-auto mb-1"></div>
                <span className="font-bold text-stone-700 uppercase">Authorized Cashier</span>
              </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS (Non-printable) */}
        <div className="p-4 bg-white border-t border-stone-200 space-y-2 print:hidden">
          
          {/* Primary Action: 1-Tap WhatsApp Share */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Send size={18} />
            <span>Send Official Receipt to Parent on WhatsApp</span>
          </button>

          {/* Secondary Actions: Print & Copy */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>Print Slip / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{copied ? 'Copied Receipt!' : 'Copy Receipt Text'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>

      </div>
    </div>
  );
};
