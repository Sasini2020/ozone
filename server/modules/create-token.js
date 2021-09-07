const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = {

  createToken: (user) => {
    const time = +new Date();
    return jwt.sign({
      username: user.UserID,
      role: user.Role,
      time: time
    }, secret);
  }

}
