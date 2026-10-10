import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initializeStorage,
  getStoredData,
  setStoredData,
  enqueueOfflineAction,
  getSyncQueue,
  clearSyncQueue,
  KEYS
} from '../utils/storage';
import {
  INITIAL_INSTITUTE,
  INITIAL_CLASSES_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_FEE_DUES,
  INITIAL_ATTENDANCE
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [institute, setInstituteState] = useState(INITIAL_INSTITUTE);
  const [classesBatches, setClassesBatchesState] = useState(INITIAL_CLASSES_BATCHES);
  const [students, setStudentsState] = useState(INITIAL_STUDENTS);
  const [feeDues, setFeeDuesState] = useState(INITIAL_FEE_DUES);
  const [attendance, setAttendanceState] = useState(INITIAL_ATTENDANCE);
  const [syncQueue, setSyncQueueState] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'attendance', 'fees', 'students', 'defaulters', 'settings'

  // Auth & Onboarding state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register' | 'onboarding'

  // Attendance Feature Toggle State
  const [attendanceEnabled, setAttendanceEnabledState] = useState(() => {
    const local = localStorage.getItem('edumanage_attendance_enabled');
    if (local !== null) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return true;
      }
    }
    const inst = getStoredData(KEYS.INSTITUTE, INITIAL_INSTITUTE);
    if (inst) {
      if (inst.attendance_enabled !== undefined) return Boolean(inst.attendance_enabled);
      if (inst.enable_attendance !== undefined) return Boolean(inst.enable_attendance);
    }
    return true;
  });

  // Real-time Calendar & Server Time State
  const pad = (n) => String(n).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const initialNow = new Date();
  const initialDateStr = `${initialNow.getFullYear()}-${pad(initialNow.getMonth() + 1)}-${pad(initialNow.getDate())}`;
  const initialMonthStr = `${monthNames[initialNow.getMonth()]} ${initialNow.getFullYear()}`;

  const [serverTime, setServerTime] = useState(initialNow.toISOString());
  const [currentDate, setCurrentDate] = useState(initialDateStr);
  const [currentMonth, setCurrentMonth] = useState(initialMonthStr);

  // Synchronize with real-time server calendar and perform monthly rollover check
  const syncServerTimeAndRollover = async (activeStudents, activeDues) => {
    let now = new Date();
    let dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    let monthStr = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    let isoStr = now.toISOString();

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/calendar/current-time');
        if (res.ok) {
          const data = await res.json();
          if (data.serverTime) isoStr = data.serverTime;
          if (data.currentDate) dateStr = data.currentDate;
          if (data.currentMonth) monthStr = data.currentMonth;
        }
      } catch (err) {
        console.warn('Real-time server clock sync unavailable, using local device time:', err);
      }
    }

    setServerTime(isoStr);
    setCurrentDate(dateStr);
    setCurrentMonth(monthStr);

    // Automated monthly rollover & unpaid dues check
    const currentStdList = activeStudents || students;
    const currentDueList = activeDues || feeDues;

    let duesChanged = false;
    // 1. Mark past pending dues as overdue if due_date < dateStr
    let updatedDues = currentDueList.map((due) => {
      if (due.status === 'pending' && due.due_date && due.due_date < dateStr) {
        duesChanged = true;
        return { ...due, status: 'overdue' };
      }
      return due;
    });

    // 2. Ensure each active student has a due for the current month
    const newDues = [];
    currentStdList.forEach((st) => {
      if (st.status === 'active' || !st.status) {
        const hasDueForMonth = updatedDues.some(
          (d) =>
            d.student_id === st.id &&
            (d.month === monthStr || d.due_date?.startsWith(dateStr.substring(0, 7)))
        );

        if (!hasDueForMonth) {
          duesChanged = true;
          const dueDay = '10';
          const dueDateStr = `${dateStr.substring(0, 7)}-${dueDay}`;
          const isOverdue = dueDateStr < dateStr;
          newDues.push({
            id: `due-auto-${st.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            student_id: st.id,
            fee_head: `${monthStr} Tuition Fee`,
            amount: Number(st.monthly_fee || 1500),
            due_date: dueDateStr,
            status: isOverdue ? 'overdue' : 'pending',
            month: monthStr
          });
        }
      }
    });

    if (duesChanged) {
      const mergedDues = [...newDues, ...updatedDues];
      setFeeDuesState(mergedDues);
      setStoredData(KEYS.FEE_DUES, mergedDues);
    }

    // Call server monthly rollover if online
    if (navigator.onLine) {
      try {
        await fetch('/api/calendar/monthly-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            institute_id: institute?.id,
            month: monthStr,
            due_date: `${dateStr.substring(0, 7)}-10`
          })
        });
      } catch (err) {
        console.warn('Server monthly-reset call failed:', err);
      }
    }
  };

  // Initialize from storage on mount
  useEffect(() => {
    initializeStorage();
    const loadedInst = getStoredData(KEYS.INSTITUTE, INITIAL_INSTITUTE);
    const loadedBatches = getStoredData(KEYS.CLASSES_BATCHES, INITIAL_CLASSES_BATCHES);
    const loadedStudents = getStoredData(KEYS.STUDENTS, INITIAL_STUDENTS);
    const loadedFeeDues = getStoredData(KEYS.FEE_DUES, INITIAL_FEE_DUES);
    const loadedAttendance = getStoredData(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);

    setInstituteState(loadedInst);
    setClassesBatchesState(loadedBatches);
    setStudentsState(loadedStudents);
    setFeeDuesState(loadedFeeDues);
    setAttendanceState(loadedAttendance);
    setSyncQueueState(getSyncQueue());

    // Sync with real-time server calendar & perform monthly rollover
    syncServerTimeAndRollover(loadedStudents, loadedFeeDues);

    // Check user auth and onboarding state
    const storedAuth = getStoredData(KEYS.AUTH, null);
    const storedOnboarded = getStoredData(KEYS.ONBOARDED, null);

    if (storedAuth && storedAuth.user) {
      setUser(storedAuth.user);
      setIsAuthenticated(true);
      if (storedOnboarded || storedAuth.institute) {
        setIsOnboarded(true);
        if (storedAuth.institute) {
          setInstituteState(storedAuth.institute);
          if (storedAuth.institute.attendance_enabled !== undefined && localStorage.getItem('edumanage_attendance_enabled') === null) {
            setAttendanceEnabledState(Boolean(storedAuth.institute.attendance_enabled));
          }
        }
      } else {
        setIsOnboarded(false);
        setAuthView('onboarding');
      }
    } else {
      // First-time or not logged in
      setIsAuthenticated(false);
      setIsOnboarded(false);
      setAuthView('landing');
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineChanges();
      syncServerTimeAndRollover();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when back online
  const syncOfflineChanges = async () => {
    const queue = getSyncQueue();
    if (queue.length === 0) return;
    setIsSyncing(true);
    // Simulate backend sync latency for 2G/3G realistic feel
    setTimeout(() => {
      clearSyncQueue();
      setSyncQueueState([]);
      setIsSyncing(false);
    }, 1200);
  };

  // Helper for terminology
  const isSchool = institute.type === 'school';
  const terms = {
    classOrBatch: isSchool ? 'Class & Section' : 'Batch',
    classesOrBatches: isSchool ? 'Classes & Sections' : 'Batches',
    studentOrLearner: isSchool ? 'Student' : 'Learner / Student',
    headOrSubject: isSchool ? 'Subject' : 'Topic / Course'
  };

  // Update Institute Settings
  const updateInstitute = (updated) => {
    const newInst = { ...institute, ...updated };
    if (updated.attendance_enabled !== undefined) {
      setAttendanceEnabledState(Boolean(updated.attendance_enabled));
      localStorage.setItem('edumanage_attendance_enabled', JSON.stringify(Boolean(updated.attendance_enabled)));
    }
    setInstituteState(newInst);
    setStoredData(KEYS.INSTITUTE, newInst);
  };

  // Set/Toggle Attendance Enabled feature across app and server
  const setAttendanceEnabled = async (enabled) => {
    const boolVal = Boolean(enabled);
    setAttendanceEnabledState(boolVal);
    localStorage.setItem('edumanage_attendance_enabled', JSON.stringify(boolVal));

    const updatedInst = {
      ...institute,
      attendance_enabled: boolVal,
      enable_attendance: boolVal
    };
    setInstituteState(updatedInst);
    setStoredData(KEYS.INSTITUTE, updatedInst);

    // If stored in auth, keep auth synced
    const currentAuth = getStoredData(KEYS.AUTH, null);
    if (currentAuth && currentAuth.institute) {
      currentAuth.institute.attendance_enabled = boolVal;
      currentAuth.institute.enable_attendance = boolVal;
      setStoredData(KEYS.AUTH, currentAuth);
    }

    // If online, update on server
    if (institute?.id && navigator.onLine) {
      try {
        await fetch(`/api/institutes/${institute.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendance_enabled: boolVal })
        });
      } catch (err) {
        console.warn('Could not sync attendance_enabled to server:', err);
      }
    } else if (institute?.id && !navigator.onLine) {
      const q = enqueueOfflineAction({
        type: 'UPDATE_SETTINGS',
        payload: { instituteId: institute.id, attendance_enabled: boolVal }
      });
      setSyncQueueState(q);
    }
  };

  // Helper for student unpaid months counter
  const getStudentUnpaidMonthsCount = (studentId) => {
    const studentUnpaidDues = feeDues.filter(
      (d) => d.student_id === studentId && (d.status === 'pending' || d.status === 'overdue')
    );
    const unpaidMonths = new Set(
      studentUnpaidDues.map((d) => d.month || d.due_date?.substring(0, 7) || 'Current Month')
    );
    return unpaidMonths.size;
  };

  // Record Attendance
  const markBulkAttendance = (classBatchId, date, recordsMap) => {
    const key = `${date}_${classBatchId}`;
    const newAttendance = {
      ...attendance,
      [key]: {
        ...(attendance[key] || {}),
        ...recordsMap
      }
    };
    setAttendanceState(newAttendance);
    setStoredData(KEYS.ATTENDANCE, newAttendance);

    const queueAction = {
      type: 'MARK_ATTENDANCE',
      payload: { classBatchId, date, records: recordsMap }
    };
    if (!navigator.onLine) {
      const q = enqueueOfflineAction(queueAction);
      setSyncQueueState(q);
    }
  };

  // Record Payment
  const recordPayment = (dueId, paymentData) => {
    const updatedDues = feeDues.map((due) => {
      if (due.id === dueId) {
        return {
          ...due,
          status: 'paid',
          paid_at: new Date().toISOString().split('T')[0],
          payment_method: paymentData.method || 'cash',
          reference_id: paymentData.referenceId || `PAY-${Date.now()}`
        };
      }
      return due;
    });

    setFeeDuesState(updatedDues);
    setStoredData(KEYS.FEE_DUES, updatedDues);

    const queueAction = {
      type: 'RECORD_PAYMENT',
      payload: { dueId, ...paymentData }
    };
    if (!navigator.onLine) {
      const q = enqueueOfflineAction(queueAction);
      setSyncQueueState(q);
    }
  };

  // Add new student
  const addStudent = (studentData) => {
    const newId = `std-${Date.now()}`;
    const newStd = {
      id: newId,
      attendance_rate: 100,
      status: 'active',
      ...studentData
    };
    const updatedStudents = [newStd, ...students];
    setStudentsState(updatedStudents);
    setStoredData(KEYS.STUDENTS, updatedStudents);

    // Auto-create initial fee due for current month
    const newDue = {
      id: `due-${Date.now()}`,
      student_id: newId,
      fee_head: 'Current Month Tuition',
      amount: Number(studentData.monthly_fee || 1500),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      month: 'October 2026'
    };
    const updatedDues = [newDue, ...feeDues];
    setFeeDuesState(updatedDues);
    setStoredData(KEYS.FEE_DUES, updatedDues);

    if (!navigator.onLine) {
      const q = enqueueOfflineAction({ type: 'ADD_STUDENT', payload: newStd });
      setSyncQueueState(q);
    }
    return newStd;
  };

  // Bulk import students from CSV
  const bulkImportStudents = (newStudentsList) => {
    const formatted = newStudentsList.map((item, index) => ({
      id: `std-bulk-${Date.now()}-${index}`,
      name: item.name || 'Student',
      roll_no: item.roll_no || `${students.length + index + 1}`,
      class_batch_id: item.class_batch_id || classesBatches[0]?.id || 'cb-1',
      phone: item.phone || '',
      guardian_name: item.guardian_name || item.name + ' Parent',
      guardian_phone: item.guardian_phone || item.phone || '',
      monthly_fee: Number(item.monthly_fee) || 1500,
      attendance_rate: 100,
      status: 'active'
    }));

    const updatedStudents = [...formatted, ...students];
    setStudentsState(updatedStudents);
    setStoredData(KEYS.STUDENTS, updatedStudents);

    // Create due entries for each
    const newDues = formatted.map((st, i) => ({
      id: `due-bulk-${Date.now()}-${i}`,
      student_id: st.id,
      fee_head: 'Admission / Current Fee',
      amount: st.monthly_fee,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      month: 'October 2026'
    }));

    const updatedDues = [...newDues, ...feeDues];
    setFeeDuesState(updatedDues);
    setStoredData(KEYS.FEE_DUES, updatedDues);

    if (!navigator.onLine) {
      const q = enqueueOfflineAction({ type: 'BULK_IMPORT', payload: { count: formatted.length } });
      setSyncQueueState(q);
    }
    return formatted.length;
  };

  // Login method
  const loginUser = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(true);
    if (authData.institute) {
      setInstituteState(authData.institute);
      setStoredData(KEYS.INSTITUTE, authData.institute);
      setIsOnboarded(true);
      setStoredData(KEYS.ONBOARDED, true);
    } else {
      setIsOnboarded(false);
      setAuthView('onboarding');
    }
    setStoredData(KEYS.AUTH, authData);
    setStoredData(KEYS.FIRST_TIME, false);
  };

  // Register method (sets up authenticated user, moves to onboarding)
  const registerUser = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(true);
    setIsOnboarded(false);
    setStoredData(KEYS.AUTH, authData);
    setStoredData(KEYS.FIRST_TIME, false);
    setAuthView('onboarding');
  };

  // Complete Onboarding
  const completeOnboarding = (instituteData, newBatches = []) => {
    setInstituteState(instituteData);
    setStoredData(KEYS.INSTITUTE, instituteData);
    setIsOnboarded(true);
    setStoredData(KEYS.ONBOARDED, true);

    if (newBatches && newBatches.length > 0) {
      const formattedBatches = newBatches.map((b, idx) => ({
        id: b.id || `cb-new-${Date.now()}-${idx}`,
        name: typeof b === 'string' ? b : b.name,
        code: `B-${idx + 1}`,
        fee_amount: b.fee_amount || 1500
      }));
      setClassesBatchesState(formattedBatches);
      setStoredData(KEYS.CLASSES_BATCHES, formattedBatches);
    }

    // Update stored auth with institute
    const currentAuth = getStoredData(KEYS.AUTH, {}) || {};
    setStoredData(KEYS.AUTH, {
      ...currentAuth,
      institute: instituteData
    });

    setAuthView('landing');
  };

  // Logout method
  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsOnboarded(false);
    localStorage.removeItem(KEYS.AUTH);
    localStorage.removeItem(KEYS.ONBOARDED);
    setAuthView('landing');
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        setIsOnline,
        syncQueue,
        isSyncing,
        syncOfflineChanges,
        activeTab,
        setActiveTab,
        user,
        isAuthenticated,
        isOnboarded,
        authView,
        setAuthView,
        loginUser,
        registerUser,
        completeOnboarding,
        logoutUser,
        institute,
        updateInstitute,
        terms,
        classesBatches,
        students,
        addStudent,
        bulkImportStudents,
        feeDues,
        recordPayment,
        attendance,
        markBulkAttendance,
        attendanceEnabled,
        setAttendanceEnabled,
        serverTime,
        currentDate,
        currentMonth,
        syncServerTimeAndRollover,
        getStudentUnpaidMonthsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
