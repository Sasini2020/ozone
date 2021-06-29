const router = require('express').Router();
const user = require('./users');
const attendance = require('./attendance');

router.use('/user', user);
router.use('/attendance', attendance);

module.exports = router;