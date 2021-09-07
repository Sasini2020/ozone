const router = require('express').Router();

const {VerifyToken, VerifyAdmin} = require('../../modules/user-verification');
const fs = require("fs");
const pool = require('../../modules/mysql-connection').pool;

router.post('/get-student-details', VerifyToken, VerifyAdmin, (request, response) => {

  let studentID = request.body.studentID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = '';
    if (request.role === 1) {
      query = `
          select S.StudentIndex as studetIndex, CONCAT(U.FirstName, ' ', U.LastName) as studentName, S.year
          from user U,
               student S
          where S.StudentIndex = ?
            and S.StudentId = U.UserID;
          select C.ClassID as classID, C.ModuleCode as moduleCode, M.ModuleName as moduleName, C.year
          from enrollment E,
               student S,
               class C,
               module M
          where E.studentIndex = ?
            and E.classID = C.ClassID
            and C.ModuleCode = M.ModuleCode;
      `;
    } else {
      query = `
          select S.StudentIndex as studetIndex, CONCAT(U.FirstName, ' ', U.LastName) as studentName, S.year
          from user U,
               student S
          where S.StudentId = ?
            and S.StudentId = U.UserID;
          select C.ClassID as classID, C.ModuleCode as moduleCode, M.ModuleName as moduleName, C.year
          from enrollment E,
               student S,
               user U,
               class C,
               module M
          where U.UserID = ?
            and U.UserID = S.StudentId
            and S.StudentIndex = E.studentIndex
            and E.classID = C.ClassID
            and C.ModuleCode = M.ModuleCode;
      `;
      studentID = request.username;
    }

    connection.query(query, [studentID, studentID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      if (result[0].length !== 0) {
        response.status(200).send({
          status: true,
          studentDetails: result[0][0],
          classes: result[1]
        });
      } else {
        response.status(200).send({
          status: false,
          message: 'No student found!'
        });
      }

    });

  });

});

router.post('/get-user-details', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    const query = `
        select S.studentIndex, CONCAT(U.firstName, ' ', U.lastName) studentName, S.year
        from user U,
             student S
        where U.UserID = ?
          and U.UserID = S.StudentId;
        select C.classID, C.moduleCode, M.moduleName, C.year
        from class C,
             user U,
             enrollment E,
             module M,
             student S
        where U.UserID = ?
          and U.UserID = S.StudentId
          and S.StudentIndex = E.studentIndex
          and E.classID = C.ClassID
          and C.ModuleCode = M.ModuleCode;
    `

    connection.query(query, [request.username, request.username], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        studentDetails: result[0][0],
        classes: result[1]
      })

    });

  });

});

router.post('/upload-profile-picture', VerifyToken, (request, response) => {

  const image = request.body.profilePicture;

  try {
    if (!image) {
      response.status(401).send({
        status: false,
        message: 'Image not found'
      });
    } else {
      const path = './profile-pictures/user-' + request.username + '.png';
      const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path, base64Data, {encoding: 'base64'});
      response.send({
        status: true,
        message: 'Profile picture updated successfully'
      });
    }
  } catch (error) {
    response.status(500).send({message: 'Server error!'});
  }

});

router.post('/get-profile-picture', VerifyToken, async (request, response) => {

  try {
    const image = fs.readFileSync(`./profile-pictures/user-${request.username}.png`, {encoding: 'base64'});
    response.status(200).send({
      status: true,
      profilePicture: image
    });
  } catch (error) {
    if (error.errno === -4058) {
      const image = fs.readFileSync('./profile-pictures/default.png', {encoding: 'base64'});
      response.status(200).send({
        status: true,
        profilePicture: image
      });
    } else {
      response.status(500).send({message: 'Server error!'});
    }
  }

});

module.exports = router;
