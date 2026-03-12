import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {

    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token and attach user to request object
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded._id;
      next();

    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
