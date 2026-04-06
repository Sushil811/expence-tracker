import expenseModel from '../models/expenseModel.js'
import getDateRange from '../utils/dateFilter.js';
import XLSX from 'xlsx'

//Add expense
export const addExpense = async(req, res)=>{
    try{ 
        const userId = req.user.id;

        const {description, amount, category, date} = req.body;

        if(!description || !amount || !category || !date){
            return res.status(400).json({
                success: false, 
                message:'All field are required'
            });
        }
        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        })
        await newExpense.save();
        res.json({
            success: true, 
            message:'Expense added successfully.'
        })

    }catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

//to get all expense
export const getAllExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    // const { page = 1, limit = 20, type, category, startDate, endDate } = req.query;

    // // Build query
    // const query = { userId };
    // if (type) query.type = type;
    // if (category) query.category = category;
    // if (startDate && endDate) {
    //   query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    // }

    // Fetch expenses with pagination
    // const expenses = await expenseModel
    //   .find(query)
    //   .sort({ date: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(parseInt(limit));

    // const total = await expenseModel.countDocuments(query);

    const expenses = await expenseModel.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      expenses,
      message: 'Expenses retrieved successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};


//Update expense
export const updateExpense =  async(req, res)=>{
    try{
        const {id} = req.params;
        const userId = req.user.id;
        const {description, amount} = req.body;

        const updatedExpense = await expenseModel.findOneAndUpdate(
            {_id: id, userId},
            {description, amount},
            {new: true}
        );
        if(!updatedExpense){
            return res.status(404).json({success: false, message:'Expense not found.'})
        }

        return res.status(200).json({success:true, message:'Expense updated successfully.'})

    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}


//Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deletedExpense = await expenseModel.findOneAndDelete({ _id: id, userId });

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or not authorized."
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully."
    });
  } catch (err) {
    console.error("Delete Expense Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//Download excel for expense
export const downloadExpenseExcel = async(req, res)=>{
    try{
        const userId = req.user.id;
        const expense = await expenseModel.find({userId}).sort({date: -1});
        const plainData = expense.map((exp)=>({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'expenseModel');
        XLSX.writeFile(workbook, 'expense_details.xlsx');
        res.download('expense_details.xlsx')
    }catch (err) {
    console.error("Download Expense Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//To get expense overviews
export const getExpenseOverview = async(req, res)=>{
    try{
        const userId = req.user.id;
        const {range = 'monthly'} = req.query;
        const{start, end} = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
            date: {$gte: start, $lte: end},
        }).sort({date:-1})

        const totalExpense = expense.reduce((acc, cur)=> acc + cur.amount, 0);
        const averageExpense = expense.length > 0 ? totalExpense / expense.length: 0;
        const numberOfTransactions = expense.length;

        const recentTransactions = expense.slice(0, 5);
        res.json({
            success:true, 
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })

    }catch (err) {
    console.error("Download Expense Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}



