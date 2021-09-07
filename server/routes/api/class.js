const router = require('express').Router();

const verifyToken = require('../../modules/user-verification').VerifyToken;
const verifyAdmin = require('../../modules/user-verification').VerifyAdmin;

const pool = require('../../modules/mysql-connection').pool;

router.post('/check-module', verifyToken, verifyAdmin, (request, response) => {

  const moduleCode = request.body.moduleCode;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    const query = 'SELECT ModuleCode, ModuleName FROM module where ModuleCode = ?';

    connection.query(query, [moduleCode], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      if (result.length === 0) {
        return response.status(200).send({
          status: false,
          message: 'Module not found'
        });
      }

      response.status(200).send({
        status: true,
        moduleCode: result[0].ModuleCode,
        moduleName: result[0].ModuleName
      });

    });

  });

});

router.post('/get-teachers', verifyToken, verifyAdmin, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    const query = 'SELECT T.TeacherIndex, U.FirstName, U.LastName FROM user U, teacher T WHERE U.UserID = T.TeacherID';

    connection.query(query, (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      const teachers = result.map(teacher => ({
        username: teacher.TeacherIndex,
        firstName: teacher.FirstName,
        lastName: teacher.LastName,
      }));

      response.status(200).send({
        status: true,
        teachers
      });

    });

  });

});

router.post('/add-edit-class', verifyToken, verifyAdmin, (request, response) => {

  const classDetails = request.body.classDetails;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    if (request.body.new) {

      const query = `INSERT INTO class (ModuleCode, description, year, day, time, duration)
                     VALUES (?, ?, ?, ?, ?, ?);`;

      connection.query(query, [classDetails.moduleCode, classDetails.description, parseInt(classDetails.year), parseInt(classDetails.day), classDetails.time, classDetails.duration], (error, result, fields) => {

        if (error) {
          return response.status(500).send({message: 'Server error!'});
        }

        const query = `INSERT INTO assignment (TeacherIndex, ClassID)
                       VALUES ?`;
        const teachers = request.body.teachers.map(teacher => ([teacher.username, result.insertId]));

        connection.query(query, [teachers], (error, result1, fields) => {
          connection.release();

          if (error) {
            return response.status(500).send({message: 'Server error!'});
          }

          response.status(200).send({
            status: true,
            message: 'Class successfully added.',
            classID: result.insertId
          });

        });

      });

    } else {

      const query = `
          update class
          set description = ?,
              year        = ?,
              day         = ?,
              time        = ?,
              duration    = ?
          where ClassID = ?;
          delete
          from assignment
          where ClassID = ?;
          insert into assignment (TeacherIndex, ClassID) value ?;
      `;
      const assignments = request.body.teachers.map(teacher => ([teacher.username, request.body.classID]));

      connection.query(query, [classDetails.description, parseInt(classDetails.year), parseInt(classDetails.day), classDetails.time, classDetails.duration, request.body.classID, request.body.classID, assignments], (error, result1, fields) => {
        connection.release();

        if (error) {
          return response.status(500).send({message: 'Server error!'});
        }

        response.status(200).send({
          status: true,
          message: 'Class successfully added.',
          classID: request.body.classID
        });

      });

    }

  });

});

router.post('/get-classes', verifyToken, (request, response) => {

  let query;

  if (request.role === 1) {
    query = `
        select C.ClassID,
               M.ModuleCode,
               M.ModuleName,
               C.description,
               C.year,
               C.day,
               C.time,
               C.duration
        from class C,
             module M
        where C.ModuleCode = M.ModuleCode;
        select A.ClassID, U.FirstName, U.LastName
        from assignment A,
             teacher T,
             user U
        where A.TeacherIndex = T.TeacherIndex
          and T.TeacherID = U.UserID;`
  } else {
    query = `
        select C.ClassID,
               C.ModuleCode,
               M.ModuleName,
               C.description,
               C.year,
               C.day,
               C.time,
               C.duration
        from enrollment E,
             module M,
             class C,
             student S
        where S.StudentId = '${request.username}'
          and S.StudentIndex = E.studentIndex
          and E.classID = C.ClassID
          and C.ModuleCode = M.ModuleCode;
        select A.ClassID, U.FirstName, U.LastName
        from student S,
             enrollment E,
             assignment A,
             teacher T,
             user U
        where S.StudentId = '${request.username}'
          and S.StudentIndex = E.studentIndex
          and E.classID = A.ClassID
          and A.TeacherIndex = T.TeacherIndex
          and T.TeacherID = U.UserID;
        `
  }


  pool.getConnection((error, connection) => {

    connection.query(query, (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      const classes = result[0].map(session => ({
        classID: session.ClassID,
        moduleCode: session.ModuleCode,
        moduleName: session.ModuleName,
        description: session.description,
        year: session.year,
        time: session.time,
        duration: session.duration,
        teachers: result[1].filter(assignment => assignment.ClassID === session.ClassID).map(teacher => (teacher.FirstName + ' ' + teacher.LastName))
      }));

      response.status(200).send({
        status: true,
        classes
      });

    });

  });

});

router.post('/get-class-details', verifyToken, verifyAdmin, (request, response) => {

  const classID = request.body.classID

  pool.getConnection((error, connection) => {

    const query = `
        select C.ClassID,
               C.ModuleCode,
               M.ModuleName,
               C.description,
               C.year,
               C.day,
               C.time,
               C.duration
        from class C,
             module M
        where C.ClassID = ?
          and C.ModuleCode = M.ModuleCode;
        select T.TeacherIndex, U.FirstName, U.LastName
        from assignment A,
             teacher T,
             user U
        where A.ClassID = ?
          and A.TeacherIndex = T.TeacherIndex
          and T.TeacherID = U.UserID;
    `;

    connection.query(query, [classID, classID], (error, result, fields) => {
      connection.release();


      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        classDetails: result[0].map(session => ({
          classID: session.ClassID,
          moduleCode: session.ModuleCode,
          moduleName: session.ModuleName,
          description: session.description,
          year: session.year,
          day: session.day,
          time: session.time,
          duration: session.duration,
        })),
        teachers: result[1].map(teacher => ({
          username: teacher.TeacherIndex,
          firstName: teacher.FirstName,
          lastName: teacher.LastName
        }))
      });

    });

  });

});

router.post('/get-student-details', verifyToken, verifyAdmin, (request, response) => {

  const studentID = request.body.studentID;

  pool.getConnection((error, connection) => {

    const query = `select S.StudentIndex as studentID, S.year, U.FirstName as firstName, U.LastName as lastName
                   from student S,
                        user U
                   where StudentIndex = ?
                     and S.StudentId = U.UserID;
    select classID
    from enrollment
    where studentIndex = ?
    `;

    connection.query(query, [studentID, studentID], (error, result, fields) => {
      connection.release();


      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      if (result.length !== 0) {
        response.status(200).send({
          status: true,
          studentDetails: result[0],
          classes: result[1]
        });
      } else {
        response.status(200).send({
          status: false,
          message: 'Student not found!'
        });
      }

    });

  });

});

router.post('/enroll-student', verifyToken, verifyAdmin, (request, response) => {

  const enrollmentDetails = request.body;

  pool.getConnection((error, connection) => {

    const query = `
        delete
        from enrollment
        where studentIndex = ?;
        insert into enrollment (studentIndex, classID, enrollmentDate)
        values ?;
    `;

    const enrollments = enrollmentDetails.classes.map(session => ([enrollmentDetails.studentID, session.classID, new Date()]));

    connection.query(query, [enrollmentDetails.studentID, enrollments], (error, result, fields) => {
      connection.release();


      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Enrollment successful!'
      });

    });

  });

});

router.post('/get-enrollments', verifyToken, verifyAdmin, (request, response) => {

  pool.getConnection((error, connection) => {

    const query = `
        select E.studentIndex                                           as studentID,
               CONCAT(U.FirstName, ' ', U.LastName)                     as name,
               S.year,
               CONCAT(M.ModuleCode, ' | ', M.ModuleName, ' | ', C.year) as class
        from enrollment E,
             student S,
             user U,
             class C,
             module M
        where S.StudentID = U.UserID
          and S.StudentIndex = E.studentIndex
          and E.classID = C.ClassID
          and C.ModuleCode = M.moduleCode
    `;

    connection.query(query, (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        enrollments: result
      });

    });

  });

});

module.exports = router;
