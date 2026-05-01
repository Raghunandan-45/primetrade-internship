const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const isAdmin = (user) => user.role === 'ADMIN';

const create = async (user, data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (!isAdmin(user) && vehicle.userId !== user.id) {
    throw new ApiError(403, 'You do not own this vehicle');
  }

  return prisma.serviceRequest.create({
    data: {
      vehicleId: data.vehicleId,
      issueDescription: data.issueDescription,
      serviceType: data.serviceType,
      scheduledDate: new Date(data.scheduledDate),
      createdById: user.id,
    },
    include: { vehicle: true },
  });
};

const list = async (user) => {
  if (isAdmin(user)) {
    return prisma.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, createdBy: { select: { id: true, name: true, email: true } } },
    });
  }
  return prisma.serviceRequest.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: 'desc' },
    include: { vehicle: true },
  });
};

const findOrFail = async (id) => {
  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) throw new ApiError(404, 'Service request not found');
  return sr;
};

const update = async (user, id, data) => {
  const sr = await findOrFail(id);

  if (!isAdmin(user)) {
    if (sr.createdById !== user.id) {
      throw new ApiError(403, 'You do not have access to this service request');
    }
    // USER cannot change status
    if (data.status) {
      throw new ApiError(403, 'Only admins can update status');
    }
  }

  const updateData = { ...data };
  if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);

  return prisma.serviceRequest.update({
    where: { id },
    data: updateData,
    include: { vehicle: true },
  });
};

const remove = async (user, id) => {
  const sr = await findOrFail(id);

  if (isAdmin(user)) {
    await prisma.serviceRequest.delete({ where: { id } });
    return;
  }

  if (sr.createdById !== user.id) {
    throw new ApiError(403, 'You do not have access to this service request');
  }
  if (sr.status !== 'PENDING') {
    throw new ApiError(400, 'Users can only delete service requests with status PENDING');
  }
  await prisma.serviceRequest.delete({ where: { id } });
};

module.exports = { create, list, update, remove };
