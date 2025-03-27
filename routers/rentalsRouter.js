const Router = require('express');
const router = new Router();
const rentalsController = require('../controllers/rentalsController');

router.post('/', rentalsController.create);
router.get('/', rentalsController.getAll);
router.get('/:id', rentalsController.getOne);

module.exports = router;