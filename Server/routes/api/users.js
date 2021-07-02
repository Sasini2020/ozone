const router = require('express').Router();
var mysql = require('../../modules/mysql-connection').pool;

router.post('/login',  (req, res) => {
    console.log(req.body.username);
    mysql.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        } else {
            connection.query('select * from attendence', (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(400).send({message: 'Login Failed'});
                } else {
                    console.log(rows);
                    res.status(200).send({message: 'Login Successfull'});
                }
            });
        }
    });
});

router.post('/test', (req, res) => {
    console.log(req.body);
    res.status(401).send({message: 'Login Failed'});
});

module.exports = router