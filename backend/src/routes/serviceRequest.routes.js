const router = require('express').Router();
const ctrl = require('../controllers/serviceRequest.controller');
const validate = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { serviceRequestSchema, serviceRequestUpdateSchema } = require('../validators');

router.use(authenticateUser);

/**
 * @openapi
 * /services:
 *   get:
 *     tags: [ServiceRequests]
 *     summary: List service requests (own for USER, all for ADMIN)
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [ServiceRequests]
 *     summary: Create a service request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, issueDescription, serviceType, scheduledDate]
 *             properties:
 *               vehicleId: { type: string }
 *               issueDescription: { type: string }
 *               serviceType:
 *                 type: string
 *                 enum: [REGULAR, OIL, TIRE, BRAKE, BATTERY, ALIGNMENT, INSPECTION]
 *               scheduledDate: { type: string, format: date-time }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', validate(serviceRequestSchema), ctrl.create);
router.get('/', ctrl.list);

/**
 * @openapi
 * /services/{id}:
 *   put:
 *     tags: [ServiceRequests]
 *     summary: Update service request (owner) or status (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [ServiceRequests]
 *     summary: Delete service request (USER only if PENDING; ADMIN unrestricted)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/:id', validate(serviceRequestUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
