import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";

export const getDashboardOverview = async(req, res)=>{
    try{
        const userId = req.user.id;
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const incomes = await incomeModel.find({
            userId,
            date: {$gte: startOfMonth, $lte: now},
        }).lean();

        const expenses = await expenseModel.find({
             userId,
            date: {$gte: startOfMonth, $lte: now},
        }).lean();

        const monthlyIncome = incomes.reduce((acc, cur)=> acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expenses.reduce((acc, cur)=> acc + Number(cur.amount || 0), 0);
        const saving = monthlyIncome - monthlyExpense;
        const savingRate = monthlyIncome === 0 ? 0 : Math.round((saving / monthlyIncome) * 100);

        const recentTransactions = [
            ...incomes.map((i)=>({...i, type: 'income'})),
            ...expenses.map((e)=>({...e, type: 'expense'})),

        ].sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt));

        const spendByCategory = {};
        for(const exp of expenses){
            const cat = exp.category || 'Others';
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount])=>({
            category,
            amount,
            percentage: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense)*100)
        }));   //for chart

        return res.status(200).json({
            success: true,
            data: {
                monthlyIncome,
                monthlyExpense,
                saving,
                savingRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution,
            }
        })

    
    }catch (err) {
        console.error("Get Dashboard Overview Error:", err);
        res.status(500).json({ success: false, message: "Server error." });
      }

}
