import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';

export const PaymentModal = ({ due, student, institute, onClose, onRecordPayment }) => {
  const [method, setMethod] = React.useState('upi');
  const [refId, setRefId] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const canvasRef = useRef(null);

  const cleanAmount = Number(due?.amount || 0);
  const upiLink = `upi://pay?pa=${encodeURIComponent(institute.upi_id || '')}&pn=${encodeURIComponent(institute.upi_name || institute.name)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Fees for ${student?.name}`)}&tr=${encodeURIComponent(due?.id || '')}`;

  useEffect(() => {
    if (canvasRef.current && institute?.upi_id) {
      QRCode.toCanvas(
        canvasRef.current,
        upiLink,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR code error', error);
        }
      );
    }
  }, [upiLink, institute]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(institute.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecordPayment(due.id, {
      method,
      referenceId: refId || `${method.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      amount: cleanAmount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Fee Payment</h3>
            <p className="text-xs text-slate-500">{student?.name} • ₹{cleanAmount.toLocaleString('en-IN')}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* QR Code Section for Counter Payment */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
              <QrIcon size={14} />
              <span>Instant QR for Parents at Counter</span>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-2">
              <canvas ref={canvasRef} className="rounded-lg max-w-full" />
            </div>

            <div className="text-sm font-semibold text-slate-900">
              Scan with Any UPI App (GPay / PhonePe / Paytm)
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Exact Amount: <span className="font-bold text-slate-800">₹{cleanAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* UPI ID quick copy */}
            <div className="mt-3 w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <span className="font-mono text-slate-700 truncate mr-2">{institute.upi_id}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                Payment Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'Cash' },
                  { id: 'upi', label: 'UPI' },
                  { id: 'bank', label: 'Bank' },
                  { id: 'cheque', label: 'Cheque' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border min-h-[48px] flex items-center justify-center ${
                      method === item.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Transaction / Receipt Ref (Optional)
              </label>
              <input
                type="text"
                placeholder={method === 'cash' ? 'e.g. Receipt #441' : 'e.g. UPI Ref / UTR #'}
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full px-3 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-base"
              >
                <span>Confirm & Mark as Paid</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
