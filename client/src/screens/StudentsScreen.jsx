import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Phone,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentsScreen = () => {
  const {
    terms,
    classesBatches,
    students,
    addStudent,
    bulkImportStudents,
    feeDues,
    attendanceEnabled
  } = useApp();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'csv'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    class_batch_id: classesBatches[0]?.id || '',
    phone: '',
    guardian_name: '',
    guardian_phone: '',
    monthly_fee: '1500'
  });
  const [formSaved, setFormSaved] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [csvImportCount, setCsvImportCount] = useState(null);

  const getBatch = (id) => classesBatches.find((b) => b.id === id);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedBatchId !== 'all' && s.class_batch_id !== selectedBatchId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.roll_no).includes(q) ||
        String(s.phone || '').includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addStudent({
      ...formData,
      roll_no: formData.roll_no || `${students.length + 1}`,
      monthly_fee: Number(formData.monthly_fee) || 1500
    });

    setFormSaved(true);
    setTimeout(() => {
      setFormSaved(false);
      setActiveTab('list');
      setFormData({
        name: '',
        roll_no: '',
        class_batch_id: classesBatches[0]?.id || '',
        phone: '',
        guardian_name: '',
        guardian_phone: '',
        monthly_fee: '1500'
      });
    }, 1200);
  };

  // Sample CSV template generator
  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Roll No,Phone,Guardian Name,Guardian Phone,Monthly Fee\n' +
      'Karan Sharma,11,9876540001,Suresh Sharma,9876540001,1500\n' +
      'Pooja Gupta,12,9876540002,Vikas Gupta,9876540002,1500\n' +
      'Amit Kumar,13,9876540003,Deepak Kumar,9876540003,1200\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'edumanage_students_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV text
  const handleParseCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const parsed = [];

    // Skip header row if contains 'Name'
    const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim());
      if (row.length >= 2 && row[0]) {
        parsed.push({
          name: row[0],
          roll_no: row[1] || `${students.length + i}`,
          phone: row[2] || '',
          guardian_name: row[3] || row[0] + ' Parent',
          guardian_phone: row[4] || row[2] || '',
          monthly_fee: Number(row[5]) || 1500,
          class_batch_id: selectedBatchId !== 'all' ? selectedBatchId : classesBatches[0]?.id
        });
      }
    }

    if (parsed.length > 0) {
      const count = bulkImportStudents(parsed);
      setCsvImportCount(count);
      setTimeout(() => {
        setCsvImportCount(null);
        setCsvText('');
        setActiveTab('list');
      }, 1500);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Tab switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-900">
            {terms.studentOrLearner} Directory
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Total: {students.length}
          </span>
        </div>

        {/* Sub Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'add'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={14} />
            <span>Add Single</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'csv'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Bulk CSV</span>
          </button>
        </div>
      </div>

      {/* 1. STUDENT LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search name, roll number, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedBatchId('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedBatchId === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All {terms.classesOrBatches}
              </button>
              {classesBatches.map((cb) => (
                <button
                  key={cb.id}
                  onClick={() => setSelectedBatchId(cb.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedBatchId === cb.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cb.name}
                </button>
              ))}
            </div>
          </div>

          {/* Student Cards */}
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  No students found matching search.
                </p>
              </div>
            ) : (
              filteredStudents.map((st) => {
                const batch = getBatch(st.class_batch_id);
                const pendingDues = feeDues
                  .filter(
                    (d) =>
                      d.student_id === st.id &&
                      (d.status === 'pending' || d.status === 'overdue')
                  )
                  .reduce((sum, d) => sum + Number(d.amount), 0);

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                        #{st.roll_no}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {st.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {batch?.name || terms.classOrBatch} • {st.phone || 'No phone'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        {attendanceEnabled && (
                          <div className="text-xs font-bold text-slate-700">
                            Att: <span className={st.attendance_rate >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{st.attendance_rate}%</span>
                          </div>
                        )}
                        <div className="text-[11px] font-semibold text-slate-500">
                          {pendingDues > 0 ? (
                            <span className="text-rose-600 font-bold">₹{pendingDues} Due</span>
                          ) : (
                            <span className="text-emerald-600">All Clear</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. ADD SINGLE STUDENT */}
      {activeTab === 'add' && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          <h3 className="font-bold text-slate-900 text-sm">
            Add New {terms.studentOrLearner}
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Roll No / ID
              </label>
              <input
                type="text"
                placeholder="e.g. 08"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {terms.classOrBatch} *
              </label>
              <select
                value={formData.class_batch_id}
                onChange={(e) => setFormData({ ...formData, class_batch_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classesBatches.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                placeholder="Parent Name"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                WhatsApp Phone
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Monthly Fee (₹)
            </label>
            <input
              type="number"
              placeholder="1500"
              value={formData.monthly_fee}
              onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className={`w-full min-h-[48px] rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              formSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
            }`}
          >
            {formSaved ? (
              <>
                <Check size={18} /> Student Added!
              </>
            ) : (
              <span>Save & Onboard Student</span>
            )}
          </button>
        </form>
      )}

      {/* 3. CSV BULK IMPORT UI */}
      {activeTab === 'csv' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Bulk Import Students (CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Easily onboard 50+ students from Excel in under 1 minute.
              </p>
            </div>
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shrink-0"
            >
              <Download size={14} />
              <span>Sample CSV</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target {terms.classOrBatch}
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classesBatches.map((cb) => (
                <option key={cb.id} value={cb.id}>
                  {cb.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Paste CSV / Excel Data
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Name, Roll No, Phone, Guardian Name, Guardian Phone, Monthly Fee&#10;Karan Sharma, 11, 9876540001, Suresh Sharma, 9876540001, 1500&#10;Pooja Gupta, 12, 9876540002, Vikas Gupta, 9876540002, 1500"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleParseCsv}
            disabled={!csvText.trim()}
            className={`w-full min-h-[50px] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
              csvImportCount !== null
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 active:scale-98'
            }`}
          >
            {csvImportCount !== null ? (
              <>
                <Check size={18} />
                <span>Imported {csvImportCount} Students Successfully!</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload & Import Students</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Student Details Card Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Roll #{selectedStudent.roll_no}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {getBatch(selectedStudent.class_batch_id)?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className={`bg-slate-50 p-3 rounded-xl border border-slate-200 grid ${attendanceEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-center`}>
              {attendanceEnabled && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Attendance
                  </span>
                  <div className="text-base font-black text-slate-800">
                    {selectedStudent.attendance_rate}%
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Monthly Fee
                </span>
                <div className="text-base font-black text-slate-800">
                  ₹{selectedStudent.monthly_fee}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Parent / Guardian:</span>
                <span className="font-semibold text-slate-800">
                  {selectedStudent.guardian_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp Phone:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedStudent.guardian_phone || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600 uppercase">
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full min-h-[46px] bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
