const router = require('express').Router();
const fs = require("fs");

const {VerifyToken, VerifyAdmin} = require('../../modules/user-verification');
const pool = require('../../modules/mysql-connection').pool;

router.post('/upload-payment', VerifyToken, (request, response) => {

  const depositor = request.body.depositor.registrationNumber;
  const deposit = request.body.deposit;
  const slip = request.body.slip;
  const paymentID = request.body.paymentID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query;

    query = `
        delete
        from paymentclass
        where paymentID = ?;
        delete
        from payment
        where paymentID = ?;
    `;

    connection.query(query, [paymentID, paymentID], (error, result) => {

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

    });


    query = `
        insert into payment (studentIndex, paymentDate, slipNo, bank, amount, externalNote, status)
        values (?, ?, ?, ?, ?, ?, ?);
    `

    connection.query(query, [depositor, deposit.paymentDate, deposit.slipNumber, deposit.bankName, deposit.totalPaid, deposit.externalNote, paymentID ? deposit.status ? 1 : 0 : 0], (error, result, info) => {

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      query = `
          insert into paymentclass
          values ?;
      `

      const classes = request.body.depositor.classes.map(_class => ([_class, result.insertId]));

      connection.query(query, [classes], (error, result1, info) => {
        connection.release();

        if (error) {
          return response.status(500).send({error: 'Server error!'});
        }

        if (slip) {
          const base64Data = slip.replace(/^data:([A-Za-z-+/]+);base64,/, '')
          fs.writeFileSync(`./payment-slips/${depositor}-${result.insertId}.png`, base64Data, {encoding: 'base64'})
          response.status(200).send({
            status: true,
            message: 'Payment uploaded successfully!'
          });
        } else {
          response.status(401).send({
            status: false,
            message: 'Malformed request syntax'
          })
        }

      });

    });

  });

});

router.post('/get-payments', VerifyToken, VerifyAdmin, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `select P.paymentID,
                        P.studentIndex,
                        CONCAT(U.FirstName, ' ', U.LastName) as studentName,
                        P.paymentDate,
                        P.amount,
                        P.status
                 from payment P,
                      student S,
                      user U
                 where P.studentIndex = S.StudentIndex
                   and S.StudentId = U.UserID;`

    connection.query(query, (error, result, info) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        payments: result
      });

    });

  });

});

router.post('/delete-payments', VerifyToken, (request, response) => {

  const paymentIDs = request.body.paymentIDs;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `
        delete
        from paymentclass
        where paymentID in (?);
        delete
        from payment
        where paymentID in (?)
    `

    connection.query(query, [paymentIDs, paymentIDs], (error, result, info) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Payments deleted successfully!'
      });

    });

  });

});

router.post('/get-payment-details', VerifyToken, (request, response) => {

  const paymentID = request.body.paymentID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    let query = `
        select P.studentIndex,
               CONCAT(U.FirstName, ' ', U.LastName) as studentName,
               S.year,
               P.paymentDate,
               P.slipNo,
               P.bank,
               P.amount,
               P.externalNote,
               P.status
        from payment P,
             student S,
             user U
        where P.paymentID = ?
          and P.studentIndex = S.StudentIndex
          and S.StudentId = U.UserID;
        select C.classID, C.ModuleCode as moduleCode, M.ModuleName as moduleName, C.year
        from enrollment E,
             class C,
             module M
        where E.studentIndex = (select studentIndex from payment where paymentID = ?)
          and E.classID = C.ClassID
          and C.ModuleCode = M.ModuleCode;
        select classID
        from paymentclass
        where paymentID = ?
    `

    connection.query(query, [paymentID, paymentID, paymentID], (error, result, info) => {
      connection.release();

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        paymentDetails: result[0][0],
        enrolledClasses: result[1],
        paymentClasses: result[2]
      });

    });

  });

});

router.post('/get-payment-slip', VerifyToken, (request, response) => {

  const studentIndex = request.body.studentIndex;
  const paymentID = request.body.paymentID;

  let paymentSlip = '';
  try {
    paymentSlip = fs.readFileSync(`./payment-slips/${studentIndex}-${paymentID}.png`, {encoding: 'base64'});
    response.status(200).send({
      status: true,
      paymentSlip
    });
  } catch (Ignore) {
    response.status(500).send({
      status: false,
      message: 'Error occurred while fetching details!'
    });
  }

});

router.post('/get-student-payments', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({error: 'Server error!'});
    }

    const query = `
        select paymentID, paymentDate, slipNo, bank, amount, externalNote, status
        from student S,
             payment P
        where S.StudentId = ?
          and S.StudentIndex = P.studentIndex;
        select P.paymentID, CONCAT(C.moduleCode, ' | ', M.ModuleName, ' | ', C.year) _class
        from student S,
             payment P,
             paymentclass Pc,
             class C,
             module M
        where S.StudentId = ?
          and S.StudentIndex = P.studentIndex
          and P.paymentID = Pc.paymentID
          and Pc.classID = C.ClassID
          and C.ModuleCode = M.ModuleCode
    `;

    connection.query(query, [request.username, request.username], (error, result) => {

      if (error) {
        return response.status(500).send({error: 'Server error!'});
      }

      const payments = result[0];
      payments.forEach(payment => payment.classes = result[1].filter(_class => _class.paymentID === payment.paymentID));

      response.status(200).send({
        status: true,
        payments
      });

    });

  });

});

module.exports = router;
