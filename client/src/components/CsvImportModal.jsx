import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Validates an Indian mobile number.
 */
function validateIndianPhone(phone) {
  if (!phone) return false;
  let cleaned = String(phone).trim().replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Format phone to E.164 if valid.
 */
function formatPhone(phone) {
  if (!phone) return phone;
  let cleaned = String(phone).trim().replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  return phone;
}

/**
 * Validate a single row in the frontend table.
 */
function validateRowData(row) {
  const errors = [];
  const name = String(row.name || '').trim();
  if (!name) {
    errors.push('Student name is required.');
  }

  const phone = String(row.parent_phone || '').trim();
  if (!phone) {
    errors.push('Parent WhatsApp number is required.');
  } else if (!validateIndianPhone(phone)) {
    errors.push('Invalid phone number format (must be 10 digits starting with 6-9).');
  }

  const amountStr = String(row.fee_amount !== undefined ? row.fee_amount : row.amount || '').replace(/[^0-9.-]+/g, '');
  const parsedAmount = parseFloat(amountStr);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Fee amount must be a number greater than 0.');
  }

  const dueDate = String(row.due_date || '').trim();
  if (!dueDate) {
    errors.push('Due date is required.');
  } else {
    let normalizedDate = dueDate;
    const ddmmyyyy = dueDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      normalizedDate = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      errors.push('Invalid due date format (use YYYY-MM-DD).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse CSV text into array of structured row objects.
 */
function parseCsvString(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[\s_-]+/g, '_'));

  const parsedRows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => !v)) continue;

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });

    const name = rowObj.name || rowObj.student_name || rowObj.student || '';
    const phone = rowObj.parent_phone || rowObj.phone || rowObj.parent_phone_number || rowObj.mobile || '';
    const amount = rowObj.fee_amount || rowObj.amount || rowObj.fee || '';
    let dueDate = rowObj.due_date || rowObj.date || rowObj.duedate || '';
    const note = rowObj.note || rowObj.notes || rowObj.remarks || '';

    // Handle DD/MM/YYYY date strings
    const ddmmyyyy = String(dueDate).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      dueDate = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
    }

    parsedRows.push({
      id: `row-${i}-${Date.now()}`,
      name,
      parent_phone: phone,
      fee_amount: amount,
      due_date: dueDate || new Date().toISOString().split('T')[0],
      note,
      included: true,
    });
  }

  return parsedRows;
}

export default function CsvImportModal({ isOpen, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  const [fileInfo, setFileInfo] = useState(null);
  const [rows, setRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Re-evaluate validation whenever rows change
  const rowsWithValidation = useMemo(() => {
    return rows.map((r) => {
      const val = validateRowData(r);
      return {
        ...r,
        isValid: val.isValid,
        errors: val.errors,
      };
    });
  }, [rows]);

  const validRowsToImport = useMemo(() => {
    return rowsWithValidation.filter((r) => r.included && r.isValid);
  }, [rowsWithValidation]);

  const invalidRowsCount = useMemo(() => {
    return rowsWithValidation.filter((r) => !r.isValid).length;
  }, [rowsWithValidation]);

  if (!isOpen) return null;

  function handleDownloadTemplate() {
    const today = new Date().toISOString().split('T')[0];
    const sampleCsv =
      'name,parent_phone,fee_amount,due_date,note\n' +
      `Rahul Sharma,9876543210,2500,${today},Class 10 A\n` +
      `Priya Patel,9123456780,3200,${today},Sibling discount\n` +
      `Sneha Kulkarni,9811223344,2000,${today},Class 9 B\n`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleFileSelected(file) {
    if (!file) return;
    setServerError('');

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setServerError('Please select a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCsvString(text);
        if (parsed.length === 0) {
          setServerError('The selected CSV file has no student data rows or is formatted incorrectly.');
          return;
        }

        setFileInfo({
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
        });
        setRows(parsed);
      } catch {
        setServerError('Could not read or parse the CSV file.');
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleRowFieldChange(rowId, field, value) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  }

  function handleToggleInclude(rowId) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, included: !r.included } : r))
    );
  }

  function handleDeleteRow(rowId) {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  function handleReset() {
    setFileInfo(null);
    setRows([]);
    setEditingRowId(null);
    setServerError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleConfirmImport() {
    if (validRowsToImport.length === 0) {
      setServerError('No valid rows are selected to import.');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const token = getToken();
      const payloadRows = validRowsToImport.map((r) => ({
        name: r.name.trim(),
        parent_phone: r.parent_phone.trim(),
        amount: parseFloat(String(r.fee_amount).replace(/[^0-9.-]+/g, '')),
        due_date: r.due_date.trim(),
        note: r.note?.trim() || null,
      }));

      const res = await fetch('/api/students/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows: payloadRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import student list.');
      }

      if (onSuccess) {
        onSuccess(data.summary?.imported || validRowsToImport.length);
      }
      onClose();
    } catch (err) {
      setServerError(err.message || 'An error occurred during import.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                upload_file
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, margin: 0, color: 'var(--color-on-surface)' }}>
                Import Students
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                Bulk upload ledger from spreadsheet (.csv)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="nav-btn"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
            aria-label="Close"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {serverError && <div className="alert alert-error">{serverError}</div>}

          {/* STEP 1: Upload View */}
          {!fileInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'rgba(55, 48, 163, 0.35)'}`,
                  backgroundColor: isDragging ? 'var(--color-primary-fixed)' : 'var(--color-surface-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6) var(--space-4)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-fixed)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                    table_chart
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, margin: 0, color: 'var(--color-on-surface)' }}>
                    Tap to select a CSV file
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px', margin: 0 }}>
                    or drag and drop your spreadsheet here
                  </p>
                </div>
                <div style={{ marginTop: 'var(--space-2)', width: '100%', maxWidth: '420px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    Columns needed: name, parent_phone, fee_amount, due_date, note (optional)
                  </div>
                </div>
              </div>

              {/* Template Download Option */}
              <div style={{ textAlign: 'center', marginTop: 'var(--space-1)' }}>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    download
                  </span>
                  Download Sample Template CSV
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Preview & Validation Table */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Validation Summary Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)' }}>
                    Validation Summary
                  </span>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-on-surface)', marginTop: '2px' }}>
                    {validRowsToImport.length} of {rows.length} rows ready to import
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span
                    style={{
                      backgroundColor: 'rgba(21, 128, 61, 0.12)',
                      color: '#15803D',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                    {validRowsToImport.length} Valid
                  </span>
                  {invalidRowsCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.12)',
                        color: 'var(--color-error)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                      {invalidRowsCount} Invalid
                    </span>
                  )}
                </div>
              </div>

              {/* File Info Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-low)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>
                    table_chart
                  </span>
                  <span style={{ fontWeight: 600 }}>{fileInfo.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'monospace' }}>
                    {fileInfo.sizeKb} KB
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                    }}
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Preview Table Container */}
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflowX: 'auto',
                  maxHeight: '340px',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-low)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '8px 10px', width: '38px', textAlign: 'center' }}>Inc.</th>
                      <th style={{ padding: '8px 10px', width: '36px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 10px' }}>Name</th>
                      <th style={{ padding: '8px 10px' }}>Phone</th>
                      <th style={{ padding: '8px 10px' }}>Amount</th>
                      <th style={{ padding: '8px 10px' }}>Due Date</th>
                      <th style={{ padding: '8px 10px' }}>Note</th>
                      <th style={{ padding: '8px 10px', width: '50px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsWithValidation.map((row, idx) => {
                      const isEditing = editingRowId === row.id;
                      return (
                        <tr key={row.id} style={{ display: 'contents' }}>
                          <tr
                            style={{
                              backgroundColor: !row.isValid
                                ? 'rgba(239, 68, 68, 0.05)'
                                : idx % 2 === 0
                                ? 'var(--color-surface)'
                                : 'var(--color-surface-low)',
                              borderBottom: !row.isValid ? 'none' : '1px solid var(--color-border)',
                              opacity: row.included ? 1 : 0.45,
                            }}
                          >
                            {/* Included Checkbox */}
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={row.included}
                                onChange={() => handleToggleInclude(row.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>

                            {/* Status Icon */}
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              {row.isValid ? (
                                <span
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'rgba(21, 128, 61, 0.15)',
                                    color: '#15803D',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>
                                </span>
                              ) : (
                                <span
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                                    color: 'var(--color-error)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>priority_high</span>
                                </span>
                              )}
                            </td>

                            {/* Name */}
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ fontSize: '11px', padding: '4px 6px', minHeight: '28px' }}
                                  value={row.name}
                                  onChange={(e) => handleRowFieldChange(row.id, 'name', e.target.value)}
                                />
                              ) : (
                                <span style={{ color: !row.name?.trim() ? 'var(--color-error)' : 'inherit' }}>
                                  {row.name || '—'}
                                </span>
                              )}
                            </td>

                            {/* Phone */}
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ fontSize: '11px', padding: '4px 6px', minHeight: '28px' }}
                                  value={row.parent_phone}
                                  onChange={(e) => handleRowFieldChange(row.id, 'parent_phone', e.target.value)}
                                />
                              ) : (
                                <span style={{ color: !validateIndianPhone(row.parent_phone) ? 'var(--color-error)' : 'inherit' }}>
                                  {formatPhone(row.parent_phone) || '—'}
                                </span>
                              )}
                            </td>

                            {/* Amount */}
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--color-primary)' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ fontSize: '11px', padding: '4px 6px', minHeight: '28px', width: '70px' }}
                                  value={row.fee_amount}
                                  onChange={(e) => handleRowFieldChange(row.id, 'fee_amount', e.target.value)}
                                />
                              ) : (
                                <span>₹{row.fee_amount ? Number(row.fee_amount).toLocaleString('en-IN') : '0'}</span>
                              )}
                            </td>

                            {/* Due Date */}
                            <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                              {isEditing ? (
                                <input
                                  type="date"
                                  className="form-input"
                                  style={{ fontSize: '11px', padding: '4px 6px', minHeight: '28px' }}
                                  value={row.due_date}
                                  onChange={(e) => handleRowFieldChange(row.id, 'due_date', e.target.value)}
                                />
                              ) : (
                                <span>{row.due_date || '—'}</span>
                              )}
                            </td>

                            {/* Note */}
                            <td style={{ padding: '8px 10px', color: 'var(--color-on-surface-variant)' }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ fontSize: '11px', padding: '4px 6px', minHeight: '28px' }}
                                  value={row.note}
                                  onChange={(e) => handleRowFieldChange(row.id, 'note', e.target.value)}
                                />
                              ) : (
                                <span>{row.note || '—'}</span>
                              )}
                            </td>

                            {/* Action */}
                            <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => setEditingRowId(isEditing ? null : row.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--color-primary)',
                                  padding: '2px',
                                  marginRight: '4px',
                                }}
                                title={isEditing ? 'Done Editing' : 'Edit Row'}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                  {isEditing ? 'check_circle' : 'edit'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--color-error)',
                                  padding: '2px',
                                }}
                                title="Remove Row"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                  delete
                                </span>
                              </button>
                            </td>
                          </tr>

                          {/* Error Banner Row for Invalid Records */}
                          {!row.isValid && (
                            <tr style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                              <td colSpan={8} style={{ padding: '6px 12px', color: 'var(--color-error)', fontSize: '10.5px', fontWeight: 600 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '4px' }}>
                                  error
                                </span>
                                Row {idx + 1} Issue: {row.errors.join(' ')}
                              </td>
                            </tr>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {fileInfo && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmImport}
              disabled={validRowsToImport.length === 0 || submitting}
              style={{
                minHeight: '44px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {submitting ? (
                <span className="spinner spinner-primary" />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    cloud_upload
                  </span>
                  <span>Import {validRowsToImport.length} Valid Students</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
            style={{ minHeight: '40px', fontSize: 'var(--font-size-sm)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
