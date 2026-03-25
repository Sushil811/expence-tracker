import expenseModel from '../models/expenseModel.js'
import getDateRange from '../utils/dateFilter.js';

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
