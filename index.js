// NOTE alalev: All constant names should be ALL_UPPERCASE except those of imported
// modules and essential constants (such as 'app')

const debug = require('debug')('server');
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const httpServer = http.createServer(app);
httpServer.on('listening', onListening);

// const PORT_OR_PIPE = initializePortOrPipe(process.env.PORT || '80');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
   var addr = httpServer.address();
   var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
   debug('Listening on ' + bind);
   console.log('Listening...');
}

const Initializer = require("./server/dist/main/Initializer").Initializer;
new Initializer(app, httpServer).init(process.env.PORT);