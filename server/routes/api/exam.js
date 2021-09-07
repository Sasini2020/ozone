const router = require('express').Router();

const {VerifyToken, VerifyAdmin} = require('../../modules/user-verification');
const pool = require('../../modules/mysql-connection').pool;

router.post('/upload-results', VerifyToken, VerifyAdmin, (request, response) => {

  const classID = request.body.classID;
  const examDate = request.body.examDate;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = 'insert into exam (classID, examDate) VALUES (?, ?);';

    connection.query(query, [classID, examDate], (error, result, fields) => {

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      query = 'insert into mark value ?;'
      const results = request.body.results.map(r => ([r.index, result.insertId, r.mark]));

      connection.query(query, [results], (error, result, info) => {
        connection.release();

        if (error) {
          return response.status(500).send({message: 'Server error!'});
        }

        response.status(200).send({
          status: true,
          message: 'Results uploaded successfully!'
        });

      });

    });

  });


});

router.post('/get-exams', VerifyToken, VerifyAdmin, (request, response) => {

  const classID = request.body.classID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = 'select examID, examDate from exam where classID = ?';

    connection.query(query, [classID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        exams: result
      });

    });

  });

});

router.post('/get-results', VerifyToken, VerifyAdmin, (request, response) => {

  const examID = request.body.examID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `
        select M.studentIndex, CONCAT(U.FirstName, ' ', U.LastName) as studentName, S.year, M.mark
        from exam E,
             mark M,
             student S,
             user U
        where E.examID = ?
          and E.examID = M.examID
          and M.studentIndex = S.StudentIndex
          and S.StudentId = U.UserID
    `;

    connection.query(query, [examID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        results: result
      });

    });

  });

});

router.post('/modify-results', VerifyToken, VerifyAdmin, (request, response) => {

  const examID = request.body.examID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `
        delete
        from mark
        where examID = ?;
        insert into mark
        values ?
    `;
    const results = request.body.results.map(result => ([result.index, examID, result.mark]));

    connection.query(query, [examID, results], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        results: 'Results updated successfully!'
      });

    });

  });

});

router.post('/delete-exam', VerifyToken, VerifyAdmin, (request, response) => {

  const examID = request.body.examID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `
        delete
        from mark
        where examID = ?;
        delete
        from exam
        where examID = ?;
    `;

    connection.query(query, [examID, examID], (error, result, fields) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        results: 'Exam deleted successfully!'
      });

    });

  });

});

router.post('/get-student-results', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `
        select E.classID, Ex.examID, Ex.examDate, M.mark
        from student S,
             enrollment E,
             exam Ex,
             mark M
        where S.StudentId = ?
          and S.StudentIndex = E.studentIndex
          and E.classID = Ex.classID
          and M.examID = Ex.examID
    `;

    connection.query(query, [request.username], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        results: result
      });

    });

  });

});

module.exports = router;
