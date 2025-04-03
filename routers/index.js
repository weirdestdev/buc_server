const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const rentalsRouter = require('./rentalsRouter');
const categoriesRouter = require('./categoriesRouter');
const userWorkRouter = require('./userWorkRouter');
const weatherRouter = require('./weatherRouter');
const docsRouter = require('./docsRouter');
const memberRequestRouter = require('./memberRequests');

router.use('/user', userRouter);
router.use('/rentals', rentalsRouter);
router.use('/categories', categoriesRouter);
router.use('/user-work', userWorkRouter);
router.use('/weather', weatherRouter);
router.use('/docs', docsRouter);
router.use('/member-requests', memberRequestRouter);

module.exports = router;
