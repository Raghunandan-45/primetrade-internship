const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/services', require('./serviceRequest.routes'));

module.exports = router;
