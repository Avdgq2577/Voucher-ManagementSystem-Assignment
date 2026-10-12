import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_pspl_expense_system_2026';

export const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userData } = user;
  return res.json({
    token,
    user: userData
  });
};

export const getCurrentUser = (req, res) => {
  return res.json({ user: req.user });
};
