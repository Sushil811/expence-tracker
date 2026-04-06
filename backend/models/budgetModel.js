import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    },
    period: {
        type: String,
        enum: ['monthly', 'weekly', 'yearly'],
        default: 'monthly'
    }
}, { timestamps: true });

// Unique: one budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const budgetModel = mongoose.model('budget', budgetSchema);
export default budgetModel;
