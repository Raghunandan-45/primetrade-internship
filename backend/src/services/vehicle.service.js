const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const isAdmin = (user) => user.role === 'ADMIN';

const create = async (user, data) => {
  return prisma.vehicle.create({
    data: { ...data, userId: user.id },
  });
};

const list = async (user) => {
  if (isAdmin(user)) {
    return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }
  return prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
};

const ensureOwnerOrAdmin = async (user, id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (!isAdmin(user) && vehicle.userId !== user.id) {
    throw new ApiError(403, 'You do not have access to this vehicle');
  }
  return vehicle;
};

const update = async (user, id, data) => {
  await ensureOwnerOrAdmin(user, id);
  return prisma.vehicle.update({ where: { id }, data });
};

const remove = async (user, id) => {
  await ensureOwnerOrAdmin(user, id);
  await prisma.vehicle.delete({ where: { id } });
};

module.exports = { create, list, update, remove };
