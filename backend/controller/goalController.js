import goalModel from "../models/goalModel.js";

// Add a new goal
export const addGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, category, description } = req.body;
        const userId = req.user.id;

        if (!title || !targetAmount || !deadline) {
            return res.status(400).json({
                success: false,
                message: "Title, target amount, and deadline are required"
            });
        }

        const goal = new goalModel({
            title,
            targetAmount: Number(targetAmount),
            deadline: new Date(deadline),
            category: category || 'General',
            description,
            userId
        });

        await goal.save();

        res.status(201).json({
            success: true,
            message: "Goal added successfully",
            data: goal
        });
    } catch (err) {
        console.error("Add Goal Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get all goals for a user
export const getGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const goals = await goalModel.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: goals
        });
    } catch (err) {
        console.error("Get Goals Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, targetAmount, currentAmount, deadline, category, description, isCompleted } = req.body;
        const userId = req.user.id;

        const goal = await goalModel.findOneAndUpdate(
            { _id: id, userId },
            {
                title,
                targetAmount: targetAmount ? Number(targetAmount) : undefined,
                currentAmount: currentAmount ? Number(currentAmount) : undefined,
                deadline: deadline ? new Date(deadline) : undefined,
                category,
                description,
                isCompleted
            },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Goal updated successfully",
            data: goal
        });
    } catch (err) {
        console.error("Update Goal Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const goal = await goalModel.findOneAndDelete({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Goal deleted successfully"
        });
    } catch (err) {
        console.error("Delete Goal Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Update goal progress (add to current amount)
export const updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const userId = req.user.id;

        const goal = await goalModel.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        goal.currentAmount += Number(amount);

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }

        await goal.save();

        res.status(200).json({
            success: true,
            message: "Goal progress updated successfully",
            data: goal
        });
    } catch (err) {
        console.error("Update Goal Progress Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};