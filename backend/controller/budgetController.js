import budgetModel from "../models/budgetModel.js";
import expenseModel from "../models/expenseModel.js";

// Get all budgets for user
export const getBudgets = async (req, res) => {
    try {
        const budgets = await budgetModel.find({ userId: req.user.id }).sort({ category: 1 });
        
        // Calculate current spending for each budget
        const now = new Date();
        const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
            let start;
            if (budget.period === 'weekly') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                start = new Date(now.getFullYear(), now.getMonth(), diff);
            } else if (budget.period === 'yearly') {
                start = new Date(now.getFullYear(), 0, 1);
            } else {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            const expenses = await expenseModel.find({
                userId: req.user.id,
                category: budget.category,
                date: { $gte: start, $lte: now }
            });

            const spent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

            return {
                _id: budget._id,
                category: budget.category,
                limit: budget.limit,
                period: budget.period,
                spent,
                percentage,
                remaining: budget.limit - spent,
                isOverBudget: spent > budget.limit,
                isNearLimit: percentage >= 80 && percentage < 100
            };
        }));

        res.status(200).json({ success: true, budgets: budgetsWithSpending });
    } catch (err) {
        console.error("Get Budgets Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Create or update budget
export const upsertBudget = async (req, res) => {
    try {
        const { category, limit, period } = req.body;
        if (!category || limit === undefined) {
            return res.status(400).json({ success: false, message: "Category and limit are required." });
        }
        if (limit < 0) {
            return res.status(400).json({ success: false, message: "Limit must be positive." });
        }

        const budget = await budgetModel.findOneAndUpdate(
            { userId: req.user.id, category },
            { limit, period: period || 'monthly' },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, budget, message: "Budget saved!" });
    } catch (err) {
        console.error("Upsert Budget Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Delete budget
export const deleteBudget = async (req, res) => {
    try {
        const budget = await budgetModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found." });
        }
        res.status(200).json({ success: true, message: "Budget deleted!" });
    } catch (err) {
        console.error("Delete Budget Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
