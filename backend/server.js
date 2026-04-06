import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRouter.js';
import dashboardRouter from './routes/dashboardRoute.js';
import goalRouter from './routes/goalRoute.js';
import budgetRouter from './routes/budgetRoute.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api/user', authLimiter);    // Strict limit on auth routes
app.use('/api', apiLimiter);          // General limit on all API routes

// DB
if (process.env.NODE_ENV !== 'test') {
    connectDB()
}

// Routes
app.use('/api/user', userRouter);
app.use('/api/income', incomeRouter);
app.use('/api/expense', expenseRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/goal', goalRouter);
app.use('/api/budget', budgetRouter);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export default app;