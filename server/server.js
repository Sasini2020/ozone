const express = require('express');
const bodyparser = require('body-parser');
const ws = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');

const {onConnection, verifyWebSocketConnection} = require('./routes/api/notification');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json({
  limit: '10MB'
}));
app.use(morgan('dev'));

app.use('/public', express.static(__dirname + '\\public'));

app.use(require('./routes'));

app.get('/', (request, response) => {
  response.status(200).send('<h1>Hello from the server</h1>');
});

const wsServer = new ws.Server({server: app});
wsServer.on('connection', socket=> {
  onConnection(socket, wsServer);
});

console.clear();

const server = app.listen(PORT, () => {
  console.log('Server is running on localhost:', PORT);
});

server.on('upgrade', (request, socket, head) => {
  verifyWebSocketConnection(request, socket, head, wsServer);
});
