const router = require('express').Router();

router.get('/get-attendance', (req, res) => {
    res.send('<h1>attendance</h1>');
});

module.exports = router;