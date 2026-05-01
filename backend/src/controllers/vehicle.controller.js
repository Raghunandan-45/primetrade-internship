const asyncHandler = require('../utils/asyncHandler');
const vehicleService = require('../services/vehicle.service');

const create = asyncHandler(async (req, res) => {
  const data = await vehicleService.create(req.user, req.body);
  res.status(201).json({ success: true, message: 'Vehicle created', data });
});

const list = asyncHandler(async (req, res) => {
  const data = await vehicleService.list(req.user);
  res.status(200).json({ success: true, message: 'Vehicles fetched', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await vehicleService.update(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Vehicle updated', data });
});

const remove = asyncHandler(async (req, res) => {
  await vehicleService.remove(req.user, req.params.id);
  res.status(200).json({ success: true, message: 'Vehicle deleted', data: null });
});

module.exports = { create, list, update, remove };
