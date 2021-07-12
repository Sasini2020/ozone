const router = require('express').Router();

const {validatePassword, comparePassword, hashPassword} = require('../../../modules/validate-password');
const pool = require('../../../modules/mysql-connection').pool;
const {createToken} = require('../../../modules/create-token');

router.post('/login', (request, response) => {

  const user = request.body;

  if (!user.username) {
    return response.status(401).json({message: "Username can't be blank"});
  }

  if (!user.password) {
    return response.status(401).json({message: "Password can't be blank"});
  }

  pool.getConnection((error, connection) => {

    if (error) {
      response.status(500).send({error: 'Server error!'});
      return;
    }

    const query = 'SELECT U.UserID, U.Password, U.FirstName, U.LastName, U.Email, U.MobileNumber, U.verified, R.RoleName FROM User U, Role R WHERE U.UserID = ? AND U.Role = R.RoleID';

    connection.query(query, [user.username], (error, results) => {
      if (error) {
        response.status(500).send({message: 'Server error!'});
        return;
      }

      if (results.length === 0) {
        response.status(401).send({message: 'Username or password is incorrect!'});
        return;
      }

      const userData = JSON.parse(JSON.stringify(results[0]));

      comparePassword(user.password, userData.Password, (error, status) => {

        if (error) {
          response.status(500).send({message: 'Server error!'});
          return;
        }

        if (status) {

          delete userData.Password;
          userData.Token = createToken(userData);

          response.status(200).send({
            status: true,
            message: 'Login Successful!',
            user: userData
          });

        } else {
          response.status(401).send({message: 'Username or password is incorrect!'})
        }

      });

    });

  });

});

router.post('/register-student', (request, response) => {

  const studentData = request.body;

  if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.password || !studentData.phone || !studentData.school || !studentData.stream || !studentData.year || !studentData.district) {
    return response.status(401).send({message: 'Invalid details!'});
  }

  if (validatePassword(studentData.password)) {
    hashPassword(studentData.password, (error, password) => {

      if (error) {
        return response.status(500).send('Server error!');
      }

      pool.getConnection((error, connection) => {

        if (error) {
          response.status(500).send({error: 'Server error!'});
          return;
        }

        const query = `
            INSERT INTO user (userid, password, firstname, lastname, email, mobilenumber, role)
            VALUES (?, ?, ?, ?, ?, ?, 3);
            INSERT INTO student (studentid, school, stream, year, district)
            VALUES (?, ?, ?, ?, ?);
        `;

        connection.query(query, [studentData.email, password, studentData.firstName, studentData.lastName, studentData.email, studentData.phone, studentData.email, studentData.school, studentData.stream, studentData.year, studentData.district], (error, results) => {

          if (error) {
            if (error.errno === 1062) {
              return response.status(401).send({message: 'This email address is already registered!'});
            }
            return response.status(500).send({message: 'Server error!'})
          }

          response.status(200).send({
            status: true,
            message: 'Registration Successful!',
            email: studentData.email
          });

        });

      });

    });
  }

});

module.exports = router;