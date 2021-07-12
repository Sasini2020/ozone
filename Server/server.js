const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(morgan('dev'));

app.use('/public', express.static(__dirname + '\\public'));

app.use(require('./routes'));

console.clear();

app.listen(PORT, () => {
  console.log('Server is running on localhost:', PORT);
});
