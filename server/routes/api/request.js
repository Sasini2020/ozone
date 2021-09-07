const router = require('express').Router();
const glob = require('glob');

const {VerifyToken} = require('../../modules/user-verification');
const fs = require("fs");
const pool = require('../../modules/mysql-connection').pool;

router.post('/upload-request', VerifyToken, async (request, response) => {

  const requestData = request.body;
  const documents = requestData.documents;

  pool.getConnection(async (error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = '';

    if (!requestData.new) {

      query = `delete
               from request
               where requestID = ?;`

      await connection.query(query, [requestData.requestID], (error, result) => {

        if (error) {
          return response.status(500).send({error: 'Server error!'});
        }

      });

    }

    query = `insert into request (studentIndex, submissionDate, request, reason, remarks, status)
             values (?, ?, ?, ?, ?, ?);`

    connection.query(query, [requestData.studentID, requestData.submissionDate, requestData.request, requestData.reason, requestData.remarks, 0], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      try {

        if (documents) {

          for (let i = 0; i < documents.length; i++) {
            const base64Data = documents[i].replace(/^data:([A-Za-z-+/]+);base64,/, '')
            fs.writeFileSync(`./request-documents/${result.insertId}-${i}.png`, base64Data, {encoding: 'base64'})
          }

          response.status(200).send({
            status: true,
            message: 'Payment uploaded successfully!'
          });

        }

      } catch (error) {
        return response.status(500).send({error: 'Server error!'});
      }

    });

  });

});

router.post('/get-requests', VerifyToken, VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query;

    if (request.role === 1) {
      query = `select *
               from request;`
    } else {
      query = `select *
               from request R,
                    student S
               where S.StudentId = ${request.username}
                 and S.StudentIndex = R.studentIndex;`
    }

    connection.query(query, [], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        requests: result
      });

    });

  });

});

router.post('/delete-requests', VerifyToken, VerifyToken, (request, response) => {

  const requestIDs = request.body.requestIDs;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `delete
                 from request
                 where requestID in (?)`;

    connection.query(query, [requestIDs], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Requests deleted successfully!'
      });

    });

  });

});

router.post('/get-student-requests', VerifyToken, VerifyToken, (request, response) => {

  const studentIndex = request.body.studentIndex;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `select requestID, submissionDate, request
                 from request
                 where studentIndex = ?`;

    connection.query(query, [studentIndex], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        requests: result
      });

    });

  });

});

router.post('/get-request-details', VerifyToken, VerifyToken, (request, response) => {

  const requestID = request.body.requestID;
  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `select *
                 from request
                 where requestID = ?`;

    connection.query(query, [requestID], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        request: result[0]
      });

    });

  });

});

router.post('/get-request-documents', VerifyToken, VerifyToken, (request, response) => {

  const requestID = request.body.requestID;

  try {
    glob('./request-documents/' + requestID + '-*.png', {}, (error, files) => {
      if (error) {
        response.status(200).send(Errors.serverError);
      } else {
        if (files.length > 0) {
          const documents = [];
          for (let filename of files) {
            documents.push(fs.readFileSync(filename, {encoding: 'base64'}));
          }
          response.status(200).send({
            status: true,
            documents
          });
        } else {
          response.status(200).send({
            status: false,
            message: 'No documents found'
          });
        }
      }
    });
  } catch (error) {
    response.status(200).send({
      status: false,
      message: 'Error while retrieving documents!'
    });
  }

});

router.post('/update-request', VerifyToken, VerifyToken, (request, response) => {

  const requestID = request.body.requestID;
  const requestData = request.body.newData;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `update request
                 set request        = ?,
                     submissionDate = ?,
                     remarks        = ?,
                     reason         = ?,
                     status         = ?
                 where requestID = ?`;

    connection.query(query, [requestData.request, requestData.submissionDate, requestData.remarks, requestData.reason, parseInt(requestData.status), requestID], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        request: 'Request updated successfully!'
      });

    });

  });

});

router.post('/get-submitted-requests', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `
        select R.requestID, R.studentIndex, R.submissionDate, R.request, R.reason, R.remarks, R.status
        from request R,
             student S
        where S.StudentId = ?
          and S.StudentIndex = R.studentIndex
    `;

    connection.query(query, [request.username], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        requests: result
      });

    });

  });

});

module.exports = router;
