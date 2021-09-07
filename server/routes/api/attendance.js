const router = require('express').Router();

const {VerifyToken, VerifyAdmin} = require('../../modules/user-verification');
const pool = require('../../modules/mysql-connection').pool;

router.post('/upload-attendance', VerifyToken, VerifyAdmin, (request, response) => {

  const classID = request.body.classID;
  const date = request.body.date;
  const time = request.body.time;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `insert into session (classID, date, time)
                 values (?, ?, ?);`;

    connection.query(query, [classID, date, time], (error, result, fields) => {

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      query = `insert into attendance
               values ?;`
      const attendance = request.body.attendance.map(record => ([result.insertId, record.index, record.status]));

      connection.query(query, [attendance], (error, result, fields) => {
        connection.release();

        if (error) {
          return response.status(500).send({message: 'Server error!'});
        }

        response.status(200).send({
          status: true,
          results: 'Attendance uploaded successfully!'
        });

      });

    });

  });

});

router.post('/get-sessions', VerifyToken, VerifyAdmin, (request, response) => {

  const classID = request.body.classID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `select S.sessionID, S.date, S.time
                 from session S,
                      class C
                 where C.classID = ?
                   and C.classID = S.classID`;

    connection.query(query, [classID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        sessions: result
      });

    });

  });

});

router.post('/get-attendance', VerifyToken, VerifyAdmin, (request, response) => {

  const sessionID = request.body.sessionID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `select A.studentIndex, CONCAT(U.FirstName, ' ', U.LastName) as studentName, A.status
                 from attendance A,
                      student S,
                      user U
                 where A.sessionID = ?
                   and A.studentIndex = S.StudentIndex
                   and S.StudentId = U.UserID`;

    connection.query(query, [sessionID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        attendance: result.map(record => ({
          studentIndex: record.studentIndex,
          studentName: record.studentName,
          status: record.status
        }))
      });

    });

  });

});

router.post('/modify-attendance', VerifyToken, VerifyAdmin, (request, response) => {

  const sessionID = request.body.sessionID;
  const attendance = request.body.attendance.map(record => ([sessionID, record.studentID, record.status]));

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    let query = `
        delete
        from attendance
        where sessionID = ?;
        insert into attendance
        values ?;
    `;

    connection.query(query, [sessionID, attendance], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Attendance modified successfully!'
      });

    });

  });

});

router.post('/get-student-attendance', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `
        select C.classID,
               C.moduleCode,
               M.moduleName,
               C.year,
               COUNT(*)                                 totalSessions,
               SUM(A.status)                            present,
               ROUND(SUM(A.status) * 100 / COUNT(*), 0) attendance
        from student S,
             enrollment E,
             class C,
             module M,
             session Se,
             attendance A
        where S.StudentId = ?
          and S.StudentIndex = E.studentIndex
          and E.classID = C.ClassID
          and C.ModuleCode = M.ModuleCode
          and C.ClassID = Se.classID
          and Se.sessionID = A.sessionID
        group by C.ClassID, C.ModuleCode, M.ModuleName
    `

    connection.query(query, [request.username], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        attendance: result
      })

    });

  });

});

router.post('/get-detailed-attendance', VerifyToken, (request, response) => {

  const classID = request.body.classID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `
        select C.classID, M.moduleCode, M.moduleName, C.year
        from class C,
             module M
        where C.ClassID = ?
          and C.ModuleCode = M.ModuleCode;
        select S.date, A.status
        from Student St,
             session S,
             attendance A
        where St.StudentId = ?
          and S.classID = ?
          and S.sessionID = A.sessionID
          and A.studentIndex = St.StudentIndex;
    `;

    connection.query(query, [classID, request.username, classID], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      const detailedAttendance = result[0][0];
      detailedAttendance.attendance = result[1];

      response.status(200).send({
        status: true,
        detailedAttendance
      });

    });

  });

});

module.exports = router;
