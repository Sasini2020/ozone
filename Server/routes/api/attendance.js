const router = require('express').Router();

router.get('/get-attendance', (request, response) => {
  response.status(200).send('<h1>Nothing to see here..!</h1>');
});

module.exports = router;