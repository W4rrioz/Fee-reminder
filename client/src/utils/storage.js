// Client-side storage and offline sync queue helpers
import {
  INITIAL_INSTITUTE,
  INITIAL_CLASSES_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_FEE_DUES,
  INITIAL_ATTENDANCE
} from '../data/mockData';

const KEYS = {
  INSTITUTE: 'edumanage_institute',
  CLASSES_BATCHES: 'edumanage_classes_batches',
  STUDENTS: 'edumanage_students',
  FEE_DUES: 'edumanage_fee_dues',
  ATTENDANCE: 'edumanage_attendance',
  SYNC_QUEUE: 'edumanage_sync_queue',
  AUTH: 'edumanage_auth',
  FIRST_TIME: 'edumanage_first_time',
  ONBOARDED: 'edumanage_onboarded',
  ATTENDANCE_ENABLED: 'edumanage_attendance_enabled',
  LAST_CALENDAR_SYNC_MONTH: 'edumanage_last_calendar_sync_month'
};

export const getStoredData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage for', key, e);
    return fallback;
  }
};

export const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage for', key, e);
  }
};

export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.INSTITUTE)) {
    setStoredData(KEYS.INSTITUTE, INITIAL_INSTITUTE);
  }
  if (!localStorage.getItem(KEYS.CLASSES_BATCHES)) {
    setStoredData(KEYS.CLASSES_BATCHES, INITIAL_CLASSES_BATCHES);
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    setStoredData(KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  if (!localStorage.getItem(KEYS.FEE_DUES)) {
    setStoredData(KEYS.FEE_DUES, INITIAL_FEE_DUES);
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    setStoredData(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  }
  if (!localStorage.getItem(KEYS.SYNC_QUEUE)) {
    setStoredData(KEYS.SYNC_QUEUE, []);
  }
};

export const enqueueOfflineAction = (action) => {
  const queue = getStoredData(KEYS.SYNC_QUEUE, []);
  const newItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...action
  };
  const updated = [...queue, newItem];
  setStoredData(KEYS.SYNC_QUEUE, updated);
  return updated;
};

export const getSyncQueue = () => {
  return getStoredData(KEYS.SYNC_QUEUE, []);
};

export const clearSyncQueue = () => {
  setStoredData(KEYS.SYNC_QUEUE, []);
};

export { KEYS };
