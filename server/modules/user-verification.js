const jwt = require('jsonwebtoken');
const {secret} = require("../config");

const pool = require('./mysql-connection').pool;

module.exports = {
  VerifyToken: async function (request, response, next) {
    if (!request.headers.authentication) {
      return response.status(401).send({error: 'Unauthorized request!'});
    }
    const token = request.headers.authentication.split(' ')[1];
    if (token === 'null') {
      return response.status(401).send({error: 'Unauthorized request!'});
    }
    try {
      const payload = jwt.verify(token, secret);
      if (!payload) {
        return response.status(401).send({error: 'Unauthorized request!'});
      } else {

        pool.getConnection((error, connection) => {

          if (error) {
            return response.status(500).send({error: 'Server error!'});
          }

          const query = 'SELECT userid, role FROM user WHERE UserID = ?';

          connection.query(query, [payload.username], (error, result) => {
            connection.release();

            if (error) {
              return response.status(500).send({error: 'Server error!'});
            }

            if (result.length === 0) {
              return response.status(500).send({error: 'Server error!'});
            }

            request.username = payload.username;
            request.role = result[0].role;
            next();

          });

        });

      }
    } catch (exception) {
      return response.status(500).send({error: 'Server error!'});
    }
  },

  VerifyAdmin: function (request, response, next) {
    if (request.role === 1) {
      next();
    } else {
      return response.status(401).send({error: 'Unauthorized request!'});
    }
  }

}

