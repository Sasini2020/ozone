const router = require('express').Router();
const ws = require('ws');
const jwt = require('jsonwebtoken');

const pool = require('../../modules/mysql-connection').pool;
const {secret} = require('../../config');
const {VerifyToken, VerifyAdmin} = require('../../modules/user-verification');

function updateMessageStatus(notificationID, recipientID) {

  pool.getConnection((error, connection) => {

    if (error) {
      return;
    }

    const query = `update notificationreceive
                   set received = 1
                   where recipientID = ?
                     and notificationID = ?;`;

    connection.query(query, [recipientID, notificationID], () => {
      connection.release();
    });

  })

}

router.post('/get-notifications', VerifyToken, (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `select N.notificationID,
                          CONCAT(U.FirstName, ' ', U.LastName) sender,
                          N.subject,
                          N.message,
                          N.timeSent,
                          N.sentBy,
                          Nr.received
                   from notification N,
                        notificationreceive Nr,
                        user U
                   where Nr.recipientID = ?
                     and Nr.notificationID = N.notificationID
                     and N.sentBy = U.UserID;`;

    connection.query(query, [request.username], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        notifications: result
      });

    });

  });

});

router.post('/update-notification-status', VerifyToken, (request, response) => {

  const notifications = request.body.received;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `update notificationreceive
                   set received = 1
                   where recipientID = ?
                     and notificationID in (?)`;

    connection.query(query, [request.username, notifications], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Notification status updates successfully!'
      });

    });

  });

});

router.post('/delete-notification', VerifyToken, VerifyAdmin, (request, response) => {

  const notificationID = request.body.notificationID;

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `
        delete
        from notificationreceive
        where notificationID = ?;
        delete
        from notification
        where notificationID = ?
    `;

    connection.query(query, [notificationID, notificationID], (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      response.status(200).send({
        status: true,
        message: 'Notification deleted successfully!'
      });

    });

  });

});

module.exports = {

  onConnection: (socket, wsServer) => {

    socket.on('message', message => {

      message = JSON.parse(message);

      if (socket.details.role === 1 || socket.details.role === 2) {

        if (message.messageType === 'notification') {

          message = message.messageBody;

          const errorMessage = JSON.stringify({
            messageType: 'acknowledgement',
            status: 'failed',
            message: 'Error sending the message',
            timeStamp: message.timeStamp
          });

          pool.getConnection((error, connection) => {

            if (error) {
              return socket.send(errorMessage);
            }

            let query = `select distinct S.studentId
                         from class C,
                              enrollment E,
                              student s
                         where C.ClassID in (?)
                           and C.ClassID = E.classID
                           and E.studentIndex = S.StudentIndex`;

            connection.query(query, [message.recipients], (error, result) => {

              if (error) {
                return socket.send(errorMessage);
              }

              let recipients = result.map(recipient => recipient.studentId);
              recipients.push(socket.details.username);

              query = `insert into notification (subject, message, timeSent, sentBy)
                       values (?, ?, ?, ?);`;

              connection.query(query, [message.subject, message.message, message.timeSent, message.username], (error, result) => {

                const notificationID = result.insertId;

                if (error) {
                  return socket.send(errorMessage);
                }

                query = `
                    insert into notificationreceive
                    values ?;
                    select CONCAT(FirstName, ' ', lastName) name
                    from user
                    where UserID = ?;
                `

                connection.query(query, [recipients.map(recipient => ([result.insertId, recipient, recipient === socket.details.username ? 1 : 0])), socket.details.username], (error, result) => {
                  connection.release();

                  if (error) {
                    return socket.send(errorMessage);
                  }


                  wsServer.clients.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                      if (recipients.find(recipient => recipient === client.details.username && recipient !== socket.details.username)) {
                        client.send(JSON.stringify({
                          messageType: 'notification',
                          messageBody: {
                            notificationID,
                            recipients: [],
                            username: result[1][0].name,
                            subject: message.subject,
                            message: message.message,
                            timeSent: message.timeSent,
                          }
                        }));
                      }
                    }
                  });

                  socket.send(JSON.stringify({
                    messageType: 'acknowledgement',
                    notificationID: result.returnValue,
                    status: 'sent',
                    messageBody: 'Message sent successfully',
                    timeStamp: message.timeStamp
                  }));

                });

              });

            });

          });

        }

      } else if (message.messageType === 'acknowledgement') {
        updateMessageStatus(message.messageBody, socket.details.username);
      }

    });

  },

  verifyWebSocketConnection: (request, socket, head, wsServer) => {

    if (!request.headers['sec-websocket-protocol']) {
      return 'Websocket connection refused!';
    }

    const token = request.headers['sec-websocket-protocol'];
    const payload = jwt.verify(token, secret);
    if (!payload) {
      return 'Websocket connection refused!';
    }

    pool.getConnection((error, connection) => {

      if (error) {
        return 'WebSocket connection refused!';
      }

      const query = 'select UserID username, role from user where UserID = ?'

      connection.query(query, [payload.username], (error, result) => {
        connection.release();

        if (error || result.length === 0) {
          return 'Websocket connection refused!'
        }

        wsServer.handleUpgrade(request, socket, head, socket => {
          socket.details = result[0];
          wsServer.emit('connection', socket, request);
        });

      });

    });

  },

  router

}
