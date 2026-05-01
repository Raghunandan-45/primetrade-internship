const asyncHandler = require('../utils/asyncHandler');
const srService = require('../services/serviceRequest.service');

const create = asyncHandler(async (req, res) => {
  const data = await srService.create(req.user, req.body);
  res.status(201).json({ success: true, message: 'Service request created', data });
});

const list = asyncHandler(async (req, res) => {
  const data = await srService.list(req.user);
  res.status(200).json({ success: true, message: 'Service requests fetched', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await srService.update(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Service request updated', data });
});

const remove = asyncHandler(async (req, res) => {
  await srService.remove(req.user, req.params.id);
  res.status(200).json({ success: true, message: 'Service request deleted', data: null });
});

module.exports = { create, list, update, remove };
