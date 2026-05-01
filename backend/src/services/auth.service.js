const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const sanitize = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const register = async ({ name, email, password, phone, address }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashed = await bcrypt.hash(password, 10);
  // Public registration is always USER. Admins are seeded via prisma/seed.js.
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: 'USER', phone, address },
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user: sanitize(user), token };
};

module.exports = { register, login };
