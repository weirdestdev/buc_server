const Router = require('express');
const router = new Router();
const memberRequestController = require('../controllers/memberRequestController');

/**
 * @swagger
 * /member-requests:
 *   post:
 *     summary: Create a member request
 *     description: Creates a new member request. Only approved members can send a request; others should register or login.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: request
 *         description: Member request data
 *         schema:
 *           type: object
 *           required:
 *             - memberName
 *             - email
 *             - message
 *           properties:
 *             memberName:
 *               type: string
 *             email:
 *               type: string
 *             message:
 *               type: string
 *               maxLength: 200
 *     responses:
 *       201:
 *         description: Member request created successfully.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             request:
 *               type: object
 *       400:
 *         description: Bad request. Missing required fields or message exceeds 200 characters.
 *       500:
 *         description: Server error.
 */
router.post('/', memberRequestController.createRequest);

/**
 * @swagger
 * /member-requests:
 *   get:
 *     summary: Get member requests
 *     description: Returns a list of member requests with date/time, member name, email, message, and status.
 *     responses:
 *       200:
 *         description: A list of member requests.
 *         schema:
 *           type: object
 *           properties:
 *             requests:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error.
 */
router.get('/', memberRequestController.getRequests);

/**
 * @swagger
 * /member-requests/{id}:
 *   put:
 *     summary: Update a member request
 *     description: Updates the status of a member request by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: integer
 *         description: ID of the member request to update.
 *       - in: body
 *         name: request
 *         description: Updated member request data.
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [new, viewed, completed]
 *     responses:
 *       200:
 *         description: Member request updated successfully.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             request:
 *               type: object
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       500:
 *         description: Server error.
 */
router.put('/:id', memberRequestController.updateRequest);

module.exports = router;
