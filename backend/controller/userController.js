import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRES,
    });

    // Return user info (without password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully.",
    });
  } catch (err) {
    console.error("Register User Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Both field are required" });
    }

    //Find by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    //Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRES,
    });

    // Return user info (without password)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User logged in successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//to get login user details
export const getCurrentUser = async(req, res)=>{
  try{
    const user = await User.findById(req.user.id).select('name email');
    if(!user){
      return res.status(404).json({success:false, message:'User not found'})
    }
    res.json({success:true, user})

  } catch(err){
    console.error(err);
    res.status(500).json({success:false, message:'Server error.'})
  }
}

//Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid name and email are required.'
      });
    }

    // Check if email is already used by another user
    const exist = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use.'
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: 'name email' }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

//Update Password
export const updatePassword = async(req, res)=>{
  try{
    const {currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8){
      return res.status(400).json({success: false, message:'Password invalid or too short.'})
    }
      const user = await User.findById(req.user.id).select('password')
      if(!user){
        return res.status(404).json({success: false, message: 'User not found.'})
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if(!match){
        return res.status(401).json({success: false, message: 'Current password is incorrect.'})
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({success: true, message:'Password changed.'})
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}
