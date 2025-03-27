const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const rentalsRouter = require('./rentalsRouter');
const categoriesRouter = require('./categoriesRouter');
const userWorkRouter = require('./userWorkRouter');

router.use('/user', userRouter);
router.use('/rentals', rentalsRouter);
router.use('/categories', categoriesRouter);
router.use('/user-work', userWorkRouter);

module.exports = router;