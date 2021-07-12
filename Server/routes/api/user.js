const router = require('express').Router();

router.get('/get-user-details', (request, response) => {
  response.status(200).send('<h1>Here is user details..!</h1>');
});

module.exports = router;