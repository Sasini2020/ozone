const {request, response} = require("express");
const router = require('express').Router();

const pool = require('../../modules/mysql-connection').pool;

router.get('/get-timetable/:username/:role', async (request, response) => {

  pool.getConnection((error, connection) => {

    if (error) {
      return response.status(500).send({message: 'Server error!'});
    }

    const query = `select C.classID,
                          CONCAT(M.ModuleCode, ' | ', M.ModuleName, ' | ', C.year) subject,
                          C.time                                                   startTime,
                          ADDTIME(C.time, CONCAT(duration, ':00:00'))              endTime,
                          C.description,
                          C.day
                   from class C,
                        module M
                   where c.ModuleCode = M.ModuleCode`

    connection.query(query, (error, result) => {
      connection.release();

      if (error) {
        return response.status(500).send({message: 'Server error!'});
      }

      const times = result.map(timeSlot => ({
        Id: timeSlot.classID,
        Subject: timeSlot.subject,
        StartTime: timeSlot.startTime,
        EndTime: timeSlot.endTime.substring(0, timeSlot.endTime.length - 7),
        Description: timeSlot.description,
        day: timeSlot.day,
        IsAllDat: false
      }));

      response.status(200).send(times);

    });

  });

});

module.exports = router;
