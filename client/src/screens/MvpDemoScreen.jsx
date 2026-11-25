import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  Smartphone,
  Monitor,
  RotateCcw,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  IndianRupee,
  Building2,
  BookOpen,
  QrCode,
  Receipt,
  Share2,
  X,
  Zap,
  Info,
  Settings,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateUpiLink, generateWhatsAppReminder } from '../utils/upi';

export const MvpDemoScreen = () => {
  const {
    institute,
    updateInstitute,
    terms,
    classesBatches,
    students,
    feeDues,
    recordPayment,
    addStudent,
    resetToInitial,
    toggleDueStatus
  } = useApp();

  // Responsive & View states (default to wide dashboard layout on desktop)
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'overdue' | 'pending' | 'paid'
  const [batchFilter, setBatchFilter] = useState('all');

  // Modals state
  const [whatsappModalData, setWhatsappModalData] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Editable Institute Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: institute.name || 'Pratibha Coaching Institute',
    upi_id: institute.upi_id || 'pratibha.edu@okaxis',
    upi_name: institute.upi_name || 'Pratibha Coaching Classes',
    city: institute.city || 'Kanpur',
    type: institute.type || 'coaching_center'
  });

  // New Student Form State
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    class_batch_id: classesBatches[0]?.id || 'cb-1',
    guardian_name: '',
    guardian_phone: '',
    monthly_fee: 1500,
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper to find student & batch
  const getStudent = (studentId) => students.find((s) => s.id === studentId);
  const getBatch = (batchId) => classesBatches.find((b) => b.id === batchId);

  // 1. Calculate Real-Time Metrics
  const metrics = useMemo(() => {
    const totalFees = feeDues.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const paidFees = feeDues
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const pendingFees = feeDues
      .filter((d) => d.status === 'pending')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const overdueFees = feeDues
      .filter((d) => d.status === 'overdue')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const overdueCount = feeDues.filter((d) => d.status === 'overdue').length;
    const pendingCount = feeDues.filter((d) => d.status === 'pending').length;
    const paidCount = feeDues.filter((d) => d.status === 'paid').length;
    const collectionPercentage = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

    return {
      totalFees,
      paidFees,
      pendingFees,
      overdueFees,
      overdueCount,
      pendingCount,
      paidCount,
      collectionPercentage
    };
  }, [feeDues]);

  // 2. Filter Dues
  const filteredDues = useMemo(() => {
    return feeDues.filter((due) => {
      const student = getStudent(due.student_id);
      if (!student) return false;

      // Status filter
      if (statusFilter !== 'all' && due.status !== statusFilter) return false;

      // Batch filter
      if (batchFilter !== 'all' && student.class_batch_id !== batchFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name?.toLowerCase().includes(q);
        const matchesRoll = student.roll_no?.toLowerCase().includes(q);
        const matchesPhone = student.guardian_phone?.toLowerCase().includes(q);
        const matchesHead = due.fee_head?.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesPhone && !matchesHead) return false;
      }

      return true;
    });
  }, [feeDues, students, statusFilter, batchFilter, searchQuery]);

  // Handle Institute Type Toggle (Coaching vs School)
  const handleToggleInstituteType = () => {
    const nextType = institute.type === 'school' ? 'coaching_center' : 'school';
    updateInstitute({
      type: nextType,
      name: nextType === 'school' ? 'Pratibha Public School' : 'Pratibha Coaching Institute'
    });
    showToast(`Switched mode: ${nextType === 'school' ? 'School (Classes & Sections)' : 'Coaching (Batches)'}`);
  };

  // Open WhatsApp Reminder Modal
  const handleOpenReminder = (due) => {
    const student = getStudent(due.student_id);
    if (!student) return;

    const reminder = generateWhatsAppReminder({
      studentName: student.name,
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      month: due.month || 'Current Month',
      amount: due.amount,
      dueDate: due.due_date,
      instituteName: institute.name,
      upiId: institute.upi_id || 'pratibha.edu@okaxis',
      upiName: institute.upi_name || institute.name,
      dueId: due.id
    });

    setWhatsappModalData({
      due,
      student,
      reminder
    });
  };

  // Open Payment Recording Modal
  const handleOpenPayment = (due) => {
    const student = getStudent(due.student_id);
    setPaymentModalData({
      due,
      student,
      method: 'upi',
      referenceId: `UPI-${Date.now().toString().slice(-6)}`
    });
  };

  // Confirm Payment
  const handleConfirmPayment = () => {
    if (!paymentModalData) return;
    const { due, method, referenceId } = paymentModalData;
    recordPayment(due.id, { method, referenceId });
    setPaymentModalData(null);
    showToast(`Payment of ₹${due.amount} marked as PAID via ${method.toUpperCase()}!`);
  };

  // View Receipt for Paid Due
  const handleViewReceipt = (due) => {
    const student = getStudent(due.student_id);
    const batch = getBatch(student?.class_batch_id);
    setReceiptModalData({
      due,
      student,
      batch
    });
  };

  // Handle Add Student Submit
  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    addStudent({
      name: newStudentForm.name.trim(),
      class_batch_id: newStudentForm.class_batch_id,
      guardian_name: newStudentForm.guardian_name.trim() || `${newStudentForm.name.trim()} Guardian`,
      guardian_phone: newStudentForm.guardian_phone.trim() || '9876500000',
      monthly_fee: Number(newStudentForm.monthly_fee) || 1500,
      roll_no: String(students.length + 1).padStart(2, '0')
    });

    setShowAddStudentModal(false);
    showToast(`Added ${newStudentForm.name} with ₹${newStudentForm.monthly_fee} due!`);
    setNewStudentForm({
      name: '',
      class_batch_id: classesBatches[0]?.id || 'cb-1',
      guardian_name: '',
      guardian_phone: '',
      monthly_fee: 1500,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    });
  };

  // Handle Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateInstitute({
      name: settingsForm.name,
      upi_id: settingsForm.upi_id,
      upi_name: settingsForm.upi_name,
      city: settingsForm.city,
      type: settingsForm.type
    });
    setShowSettingsModal(false);
    showToast('Updated institute details and UPI payment route!');
  };

  // Core Tracker Content
  const renderTrackerContent = () => (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-slate-900 leading-none">
                EduManage
              </h1>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                0% Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate max-w-[200px]">
              {institute.name} • UPI: <span className="text-blue-600 font-bold">{institute.upi_id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Settings Icon */}
          <button
            type="button"
            onClick={() => {
              setSettingsForm({
                name: institute.name,
                upi_id: institute.upi_id,
                upi_name: institute.upi_name,
                city: institute.city || 'Kanpur',
                type: institute.type
              });
              setShowSettingsModal(true);
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-colors"
            title="Configure Institute Name & UPI ID"
          >
            <Settings size={16} />
          </button>

          {/* Add Student Trigger Button */}
          <button
            type="button"
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      {/* 2. Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-3.5 py-4 space-y-4 max-w-5xl mx-auto w-full">
        {/* 3. Executive Metrics Dashboard */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <IndianRupee size={15} className="text-blue-600" />
              <span>Current Fee Cycle (October 2026)</span>
            </div>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {metrics.collectionPercentage}% Collected
            </span>
          </div>

          {/* Collection Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${metrics.collectionPercentage}%` }}
              title={`Collected: ₹${metrics.paidFees}`}
            />
            <div
              className="bg-blue-400 h-full transition-all duration-500"
              style={{ width: `${(metrics.pendingFees / (metrics.totalFees || 1)) * 100}%` }}
              title={`Pending: ₹${metrics.pendingFees}`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${(metrics.overdueFees / (metrics.totalFees || 1)) * 100}%` }}
              title={`Overdue: ₹${metrics.overdueFees}`}
            />
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
            {/* Total Pool */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Dues Pool
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                ₹{metrics.totalFees.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {feeDues.length} students
              </p>
            </div>

            {/* Collected */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Collected
              </p>
              <p className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5">
                ₹{metrics.paidFees.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {metrics.paidCount} cleared
              </p>
            </div>

            {/* Pending */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Pending
              </p>
              <p className="text-lg sm:text-xl font-black text-blue-800 mt-0.5">
                ₹{metrics.pendingFees.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                {metrics.pendingCount} due soon
              </p>
            </div>

            {/* Overdue */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Overdue Defaulters
              </p>
              <p className="text-lg sm:text-xl font-black text-rose-800 mt-0.5">
                ₹{metrics.overdueFees.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                {metrics.overdueCount} follow-ups
              </p>
            </div>
          </div>
        </div>

        {/* 4. Search and Filters */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${terms.studentOrLearner.toLowerCase()} name, phone or roll...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Batch Filter Dropdown */}
            <div className="sm:w-56">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="all">All {terms.classesOrBatches}</option>
                {classesBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Dues ({feeDues.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                statusFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle size={13} />
              <span>Overdue Defaulters ({metrics.overdueCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Clock size={13} />
              <span>Pending ({metrics.pendingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Paid ({metrics.paidCount})</span>
            </button>
          </div>
        </div>

        {/* 5. Student Dues Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold">
            <span>Showing {filteredDues.length} student records</span>
            <span className="text-[11px] text-blue-600 font-semibold">
              Direct UPI • WhatsApp • Mark Paid
            </span>
          </div>

          {filteredDues.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold text-slate-800">No matching student dues found</p>
              <p className="text-xs text-slate-500">Try changing your search query or filter pills above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDues.map((due) => {
                const student = getStudent(due.student_id);
                if (!student) return null;
                const batch = getBatch(student.class_batch_id);

                const isOverdue = due.status === 'overdue';
                const isPaid = due.status === 'paid';
                const isPending = due.status === 'pending';

                return (
                  <div
                    key={due.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between ${
                      isOverdue
                        ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200/50'
                        : isPaid
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top line: Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700'
                                : isPaid
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-black text-slate-900 leading-tight">
                                {student.name}
                              </h3>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {batch ? batch.code || batch.name : 'General'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              Parent: {student.guardian_name} • {student.guardian_phone}
                            </p>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <div className="shrink-0">
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                              <AlertCircle size={11} />
                              Overdue
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              <Clock size={11} />
                              Pending
                            </span>
                          )}
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                              <CheckCircle2 size={11} />
                              Paid
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Line: Fee Details & Amount */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">
                            {due.fee_head || 'Monthly Tuition'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Due: {due.due_date || '10 Oct 2026'}
                            {isPaid && due.payment_method && (
                              <span className="ml-1 text-emerald-700 font-bold uppercase">
                                • via {due.payment_method}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-black text-slate-900 leading-tight">
                            ₹{Number(due.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold">0% Direct Bank</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                      {/* WhatsApp Reminder Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenReminder(due)}
                        className="flex-1 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
                      >
                        <Send size={13} className="text-white" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Payment Action: Mark as Paid OR View Receipt */}
                      {!isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(due)}
                          className="flex-1 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(due)}
                          className="flex-1 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-98"
                        >
                          <Receipt size={13} className="text-slate-600" />
                          <span>Receipt</span>
                        </button>
                      )}

                      {/* Quick Toggle for testing */}
                      <button
                        type="button"
                        onClick={() => toggleDueStatus(due.id)}
                        title="Fast toggle payment status"
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 transition-all shrink-0 active:scale-95"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center">
      {/* ========================================================
          TOP EVALUATOR CONTROLS BAR
      ======================================================== */}
      <div className="w-full bg-slate-950 border-b border-slate-800 px-4 py-2.5 z-30 sticky top-0 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Branding & Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">
                  EduManage Fee Tracker
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  MVP Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                0% Gateway Fee Reminders • Instant UPI Links & QR • Direct Reconciliation
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
            {/* Multi-tenant Switcher: Coaching vs School */}
            <button
              type="button"
              onClick={handleToggleInstituteType}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Toggle institute type to observe terminology changes"
            >
              {institute.type === 'school' ? (
                <>
                  <Building2 size={13} className="text-amber-400" />
                  <span>School Mode</span>
                </>
              ) : (
                <>
                  <BookOpen size={13} className="text-blue-400" />
                  <span>Coaching Mode</span>
                </>
              )}
            </button>

            {/* View Switcher: Mobile Phone vs Desktop View */}
            <button
              type="button"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Switch between mobile phone mockup and wide view"
            >
              {isMobileFrame ? (
                <>
                  <Monitor size={13} className="text-teal-400" />
                  <span className="hidden sm:inline">Desktop Wide</span>
                </>
              ) : (
                <>
                  <Smartphone size={13} className="text-teal-400" />
                  <span className="hidden sm:inline">Mobile Frame</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={() => {
                resetToInitial();
                showToast('Reset data to initial state!');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Reset all demo data to initial state"
            >
              <RotateCcw size={13} className="text-slate-400" />
              <span>Reset</span>
            </button>

            {/* Guide Toggle */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                showGuide
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Info size={13} />
              <span>Walkthrough</span>
              {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          COLLAPSIBLE WALKTHROUGH GUIDE
      ======================================================== */}
      {showGuide && (
        <div className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-3">
          <div className="max-w-4xl mx-auto space-y-2 text-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    ⚡ 3-Step MVP Verification
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Verify the core fee reminder outcome in 30 seconds:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-bold text-white">1. WhatsApp Reminder</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Click <span className="text-emerald-400 font-bold">WhatsApp</span> on any student to view pre-filled message & dynamic NPCI UPI QR code.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-bold text-white">2. Mark as Paid</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Click <span className="text-blue-400 font-bold">Mark Paid</span> on an overdue student and watch the live collection meters update instantly.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-bold text-white">3. Add New Student</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Click <span className="text-blue-400 font-bold">+ Add Student</span> to add a learner; auto-generates current month tuition fee.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white shrink-0 p-1"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PROTOTYPE CONTAINER (Mobile Phone Frame or Desktop Wide)
      ======================================================== */}
      <div className="flex-1 w-full flex justify-center py-4 px-2 sm:px-4">
        {isMobileFrame ? (
          /* Mobile Phone Mockup Shell */
          <div className="w-full max-w-[430px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>

            <div className="w-full bg-slate-50 rounded-[34px] overflow-hidden min-h-[720px] max-h-[820px] overflow-y-auto relative border border-slate-200">
              {renderTrackerContent()}
            </div>
          </div>
        ) : (
          /* Desktop Responsive Container */
          <div className="w-full max-w-5xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            {renderTrackerContent()}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: WHATSAPP REMINDER & DYNAMIC UPI QR
      ======================================================== */}
      {whatsappModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header: WhatsApp Style Green */}
            <div className="bg-[#075E54] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white shadow-xs">
                  <Send size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight">
                    WhatsApp Fee Reminder
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    To: {whatsappModalData.student.guardian_name} ({whatsappModalData.student.guardian_phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalData(null)}
                className="text-emerald-100 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="p-4 bg-[#EFEAE2] max-h-[380px] overflow-y-auto space-y-3">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-emerald-100 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {whatsappModalData.reminder.messageText}
              </div>

              {/* Dynamic NPCI UPI QR Code Card */}
              <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800">
                  <QrCode size={16} className="text-blue-600" />
                  <span>Dynamic UPI Payment QR</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pre-encoded with exact due amount: <span className="font-extrabold text-slate-900">₹{whatsappModalData.due.amount}</span>
                </p>

                {/* QR Code Image */}
                <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-100 w-fit mx-auto">
                  <img
                    src={whatsappModalData.reminder.qrImageUrl}
                    alt="Dynamic UPI QR Code"
                    className="w-36 h-36 rounded-lg object-contain"
                  />
                </div>

                <div className="text-[10px] text-slate-500 font-medium space-y-0.5">
                  <p>Payable directly to: <span className="font-bold text-slate-700">{institute.upi_id}</span></p>
                  <p className="text-emerald-600 font-bold">0% Gateway Cuts • NPCI Compliant</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Copy Message */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(whatsappModalData.reminder.messageText);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex-1 min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-all"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Text'}</span>
                </button>

                {/* Open WhatsApp (wa.me) */}
                <a
                  href={whatsappModalData.reminder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[42px] rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink size={14} />
                  <span>Open WhatsApp</span>
                </a>
              </div>

              {/* Fast Simulation: Simulate Guardian Paid */}
              <button
                type="button"
                onClick={() => {
                  recordPayment(whatsappModalData.due.id, {
                    method: 'upi',
                    referenceId: `UPI-WA-${Date.now().toString().slice(-6)}`
                  });
                  setWhatsappModalData(null);
                  showToast(`Simulated: Guardian paid ₹${whatsappModalData.due.amount} via UPI!`);
                }}
                className="w-full min-h-[38px] rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-all"
              >
                <Zap size={14} className="text-blue-600" />
                <span>Simulate Guardian Payment Received</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: MANUAL PAYMENT RECORDING MODAL
      ======================================================== */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black">Record Payment</h3>
                <p className="text-xs text-blue-100 font-medium mt-0.5">
                  {paymentModalData.student.name} • ₹{paymentModalData.due.amount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalData(null)}
                className="text-blue-100 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'cash', 'bank'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentModalData({ ...paymentModalData, method: m })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold uppercase border transition-all ${
                        paymentModalData.method === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Transaction / Receipt Ref
                </label>
                <input
                  type="text"
                  value={paymentModalData.referenceId}
                  onChange={(e) =>
                    setPaymentModalData({ ...paymentModalData, referenceId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Fee Head:</span>
                  <span className="font-bold text-slate-800">{paymentModalData.due.fee_head}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Due Date:</span>
                  <span className="font-bold text-slate-800">{paymentModalData.due.due_date}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold pt-1 border-t border-slate-200">
                  <span>Amount to Reconcile:</span>
                  <span className="text-emerald-700">₹{paymentModalData.due.amount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalData(null)}
                className="flex-1 min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={16} />
                <span>Confirm Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: RECEIPT VIEWER MODAL
      ======================================================== */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-400" />
                <h3 className="text-sm font-black">Fee Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-black text-slate-900">{institute.name}</h2>
                <p className="text-[11px] text-slate-500">{institute.city || 'Kanpur'} • UPI: {institute.upi_id}</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-2">
                  <CheckCircle2 size={12} />
                  <span>Payment Settled Direct to Bank</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Student Name:</span>
                  <span className="font-bold text-slate-900">{receiptModalData.student.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Roll / ID:</span>
                  <span className="font-bold text-slate-900">{receiptModalData.student.roll_no}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Batch / Class:</span>
                  <span className="font-bold text-slate-900">{receiptModalData.batch?.name || 'Class 10'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Date:</span>
                  <span className="font-bold text-slate-900">{receiptModalData.due.paid_at || 'Today'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-900 uppercase">{receiptModalData.due.payment_method || 'UPI'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Txn Ref No:</span>
                  <span className="font-mono text-slate-800">{receiptModalData.due.reference_id || 'UPI9823419024'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-sm font-black text-emerald-900">
                <span>Total Amount Paid:</span>
                <span className="text-base">₹{receiptModalData.due.amount}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleDueStatus(receiptModalData.due.id);
                  setReceiptModalData(null);
                  showToast('Reverted status back to Unpaid for demo testing!');
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Revert to Unpaid
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptModalData(null);
                  showToast('Receipt saved / shared successfully!');
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2 size={14} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ADD NEW STUDENT MODAL
      ======================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-black">Add New {terms.studentOrLearner}</h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-blue-100 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ishaan Verma"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {terms.classOrBatch}
                </label>
                <select
                  value={newStudentForm.class_batch_id}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, class_batch_id: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classesBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code || 'B'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="Mr. Verma"
                    value={newStudentForm.guardian_name}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, guardian_name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newStudentForm.guardian_phone}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, guardian_phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Monthly Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={newStudentForm.monthly_fee}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, monthly_fee: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * An automated current month tuition due will be immediately assigned to this student.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={15} />
                  <span>Save Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: CONFIGURE INSTITUTE & UPI ID
      ======================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-blue-400" />
                <h3 className="text-sm font-black">Institute & UPI Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Institute Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Your Direct UPI ID (0% Cuts)
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@upi or mobile@paytm"
                  value={settingsForm.upi_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  WhatsApp reminders and dynamic QR codes will route payments directly to this UPI address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Payee Display Name
                </label>
                <input
                  type="text"
                  value={settingsForm.upi_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
