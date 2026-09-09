import { Router } from 'express';
import authRoutes from './auth.js';
import studentRoutes from './students.js';
import importRoutes from './import.js';
import settingsRoutes from './settings.js';
import reminderRoutes from './reminders.js';
import feeRoutes from './fees.js';
import attendanceRoutes from './attendance.js';

const router = Router();

// Mount route groups
router.use('/auth', authRoutes);
router.use('/students', importRoutes);
router.use('/students', studentRoutes);
router.use('/settings', settingsRoutes);
router.use('/reminders', reminderRoutes);
router.use('/fees', feeRoutes);
router.use('/attendance', attendanceRoutes);

export default router;

