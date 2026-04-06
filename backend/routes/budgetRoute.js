import express from 'express';
import { getBudgets, upsertBudget, deleteBudget } from '../controller/budgetController.js';
import { authMiddleware } from '../middleware/auth.js';

const budgetRouter = express.Router();

budgetRouter.get('/', authMiddleware, getBudgets);
budgetRouter.post('/', authMiddleware, upsertBudget);
budgetRouter.delete('/:id', authMiddleware, deleteBudget);

export default budgetRouter;
