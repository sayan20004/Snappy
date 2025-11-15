import express from 'express';
import { getUsers, getUserById } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Routes
router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;
