import incomeModel from "../models/incomeModel.js";
import XLSX from 'xlsx'
import getDateRange from "../utils/dateFilter.js";

//add income
export const addIncome = async (req, res)=>{
    try{
        const userId = req.user.id
        const {description, amount, category, date} = req.body;

        if(!description || !amount || !category || !date){
            return res.status(400).json({success: false, message:'All field are required.'})
        }

        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        })
        await newIncome.save()
        res.json({success: true, message:'Income added successfully.'})

    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

//To get all Income
export const getAllIncome = async (req, res) => {
  try {
    const userId = req.user.id;

    const income = await incomeModel.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      income
    });

  } catch (err) {
    console.error("Get All Income Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//Update a income
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;  // consistent with authMiddleware
    const { description, amount, category, date } = req.body;

    // Build the update object dynamically
    const updateData = {};
    if (description) updateData.description = description;
    if (amount != null) updateData.amount = amount; // allow 0
    if (category) updateData.category = category;
    if (date) updateData.date = new Date(date);

    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ success: false, message: "Income not found." });
    }

    res.status(200).json({
      success: true,
      message: "Income updated successfully.",
      income: updatedIncome
    });

  } catch (err) {
    console.error("Update Income Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//To delete an income
export const deleteIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deletedIncome = await incomeModel.findOneAndDelete({ _id: id, userId });

    if (!deletedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found or not authorized."
      });
    }

    res.status(200).json({
      success: true,
      message: "Income deleted successfully."
    });

  } catch (err) {
    console.error("Delete Income Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//Download excel
export const downloadIncomeExcel = async(req, res)=>{
    try{
        const userId = req.user.id;
        const income = await incomeModel.find({userId}).sort({date: -1});
        const plainData = income.map((inc)=>({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'incomeModel');
        XLSX.writeFile(workbook, 'income_details.xlsx');
        res.download('income_details.xlsx')
    }catch (err) {
    console.error("Download Income Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//To get income overviews
export const getIncomeOverview = async(req, res)=>{
    try{
        const userId = req.user.id;
        const {range = 'monthly'} = req.query;
        const{start, end} = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: {$gte: start, $lte: end},
        }).sort({date:-1})

        const totalIncome = incomes.reduce((acc, cur)=> acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length: 0;
        const numberOfTransactions = incomes.length;

        const recentTransactions = incomes.slice(0, 9);
        res.json({
            success:true, 
            data: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })

    }catch (err) {
    console.error("Download Income Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}