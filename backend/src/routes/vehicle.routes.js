const router = require('express').Router();
const ctrl = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { vehicleSchema, vehicleUpdateSchema } = require('../validators');

router.use(authenticateUser);

/**
 * @openapi
 * /vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicles (own for USER, all for ADMIN)
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Vehicles]
 *     summary: Create a vehicle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [model, year, licensePlate, vin]
 *             properties:
 *               model: { type: string }
 *               year: { type: integer }
 *               licensePlate: { type: string }
 *               vin: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', validate(vehicleSchema), ctrl.create);
router.get('/', ctrl.list);

/**
 * @openapi
 * /vehicles/{id}:
 *   put:
 *     tags: [Vehicles]
 *     summary: Update vehicle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Vehicles]
 *     summary: Delete vehicle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/:id', validate(vehicleUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
