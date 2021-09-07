const router = require('express').Router();

const authentication = require('./authentication');
const user = require('./user');
const attendance = require('./attendance');
const session = require('./class');
const exam = require('./exam');
const payment = require('./payment');
const request = require('./request');
const notification = require('./notification').router;

router.use('/authentication', authentication);
router.use('/user', user);
router.use('/attendance', attendance);
router.use('/class', session);
router.use('/exam', exam);
router.use('/payment', payment);
router.use('/request', request);
router.use('/notification', notification);

module.exports = router;
