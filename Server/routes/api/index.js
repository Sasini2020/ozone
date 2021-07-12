const router = require('express').Router();

const authentication = require('./authentication');
const user = require('./user');
const attendance = require('./attendance');

router.use('/authentication', authentication);
router.use('/user', user);
router.use('/attendance', attendance);

module.exports = router;