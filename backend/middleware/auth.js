import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized or token missing' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(payload.id).select('name email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = { id: user._id, name: user.name, email: user.email }; // attach minimal info
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ success: false, message: 'Not authorized or token invalid' });
  }
};