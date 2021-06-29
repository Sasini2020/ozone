const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('public', express.static(__dirname + '\\public'));

app.use(require('./routes'));

app.listen(PORT, () => {
    console.log('Server is running on localhost:', PORT);
});