import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    description: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }
}, { timestamps: true });

const goalModel = mongoose.model('goal', goalSchema);
export default goalModel;