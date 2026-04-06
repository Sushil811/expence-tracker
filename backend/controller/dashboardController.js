import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";
import goalModel from "../models/goalModel.js";

// Helper: get date range from query params
function getDateRange(query) {
    const now = new Date();
    const range = query.range || 'monthly';

    if (range === 'custom' && query.startDate && query.endDate) {
        return {
            start: new Date(query.startDate),
            end: new Date(new Date(query.endDate).setHours(23, 59, 59, 999)),
            label: 'Custom'
        };
    }

    switch (range) {
        case 'weekly': {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
            const start = new Date(now.getFullYear(), now.getMonth(), diff);
            start.setHours(0, 0, 0, 0);
            return { start, end: now, label: 'This Week' };
        }
        case 'yearly': {
            const start = new Date(now.getFullYear(), 0, 1);
            return { start, end: now, label: 'This Year' };
        }
        case 'monthly':
        default: {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end: now, label: 'This Month' };
        }
    }
}

// Helper: get previous period range for comparison
function getPreviousRange(start, end) {
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return { start: prevStart, end: prevEnd };
}

export const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end, label } = getDateRange(req.query);
        const prev = getPreviousRange(start, end);

        // Current period data
        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).lean();

        const expenses = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).lean();

        // Previous period data (for comparison)
        const prevIncomes = await incomeModel.find({
            userId,
            date: { $gte: prev.start, $lte: prev.end },
        }).lean();

        const prevExpenses = await expenseModel.find({
            userId,
            date: { $gte: prev.start, $lte: prev.end },
        }).lean();

        // Calculate current period
        const periodIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const periodExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const periodSaving = periodIncome - periodExpense;

        // Previous period totals
        const prevPeriodIncome = prevIncomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const prevPeriodExpense = prevExpenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

        // All-time totals
        const allIncomes = await incomeModel.find({ userId }).lean();
        const allExpenses = await expenseModel.find({ userId }).lean();
        const totalIncome = allIncomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalExpense = allExpenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalSaving = totalIncome - totalExpense;

        const savingRate = periodIncome === 0 ? 0 : Math.round((periodSaving / periodIncome) * 100);
        const totalTransactions = allIncomes.length + allExpenses.length;

        // Goals
        const goals = await goalModel.find({ userId }).sort({ createdAt: -1 });

        // Recent transactions in period
        const recentTransactions = [
            ...incomes.map((i) => ({ ...i, type: 'income' })),
            ...expenses.map((e) => ({ ...e, type: 'expense' })),
        ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        // Expense distribution
        const spendByCategory = {};
        for (const exp of expenses) {
            const cat = exp.category || 'Others';
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }
        const expenseDistribution = Object.entries(spendByCategory)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: periodExpense === 0 ? 0 : Math.round((amount / periodExpense) * 100)
            }))
            .sort((a, b) => b.amount - a.amount);

        // Income distribution
        const incomeByCategory = {};
        for (const inc of incomes) {
            const cat = inc.category || 'Others';
            incomeByCategory[cat] = (incomeByCategory[cat] || 0) + Number(inc.amount || 0);
        }
        const incomeDistribution = Object.entries(incomeByCategory)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: periodIncome === 0 ? 0 : Math.round((amount / periodIncome) * 100)
            }))
            .sort((a, b) => b.amount - a.amount);

        return res.status(200).json({
            success: true,
            data: {
                rangeLabel: label,
                monthlyIncome: periodIncome,
                monthlyExpense: periodExpense,
                monthlySaving: periodSaving,
                totalSaving,
                savingRate,
                lastMonthIncome: prevPeriodIncome,
                lastMonthExpense: prevPeriodExpense,
                totalTransactions,
                goals,
                recentTransactions,
                spendByCategory,
                expenseDistribution,
                incomeDistribution,
            }
        });

    } catch (err) {
        console.error("Get Dashboard Overview Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
