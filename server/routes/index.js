import { Router } from 'express';
import authRoutes from './auth.js';
import studentRoutes from './students.js';
import settingsRoutes from './settings.js';
import reminderRoutes from './reminders.js';
import feeRoutes from './fees.js';

const router = Router();

// Mount route groups
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/settings', settingsRoutes);
router.use('/reminders', reminderRoutes);
router.use('/fees', feeRoutes);

export default router;
