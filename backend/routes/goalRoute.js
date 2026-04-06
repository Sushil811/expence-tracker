import express from 'express';
import { addGoal, getGoals, updateGoal, deleteGoal, updateGoalProgress } from '../controller/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Add goal
router.post('/add', authMiddleware, addGoal);

// Get all goals
router.get('/get', authMiddleware, getGoals);

// Update goal
router.put('/update/:id', authMiddleware, updateGoal);

// Delete goal
router.delete('/delete/:id', authMiddleware, deleteGoal);

// Update goal progress
router.put('/progress/:id', authMiddleware, updateGoalProgress);

export default router;