import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';

const app = express();

const PORT = process.env.PORT || 3000

//Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//DB
connectDB()

//Routes
app.use('/api/user', userRouter);
app.use('/api/income', incomeRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})