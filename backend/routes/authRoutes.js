const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const authenticateMember = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(decoded.id).select('-password');
    
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
    
    req.member = member;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

module.exports = { authenticateMember };
