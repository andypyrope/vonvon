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

const PORT_OR_PIPE = initializePortOrPipe(process.env.PORT || '80');

// NOTE alalev: Start the server with `node --debug-brk --nolazy index` to be able to
// attach the debugger or with `node --debug --nolazy index`

app.set('port', PORT_OR_PIPE.port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/testPage', function (req, res, next) {
   res.status(200).send("<html>Test</html>");
});

httpServer.listen(PORT_OR_PIPE.port);
httpServer.on('error', function (e) {
   if (e.syscall !== 'listen') {
      throw e;
   }

   switch (e.code) {
      case 'EACCES':
         console.error(PORT_OR_PIPE.portOrPipeString + ' requires elevated privileges');
         process.exit(1);
         break;
      case 'EADDRINUSE':
         console.error(PORT_OR_PIPE.portOrPipeString + ' is already in use');
         process.exit(1);
         break;
      default: throw e;
   }
});

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

/**
 * Recognizes if a port or a pipe has been provided and makes a human-readable string.
 *
 * @param {number | string} value The value to parse
 * @returns
 */
function initializePortOrPipe(value) {
   const PORT = parseInt(value, 10);
   const PORT_IS_NUMERIC = !isNaN(PORT);

   if (isNaN(PORT)) {
      return {
         pipe: value,
         portOrPipeString: 'pipe ' + value
      };
   }

   if (PORT < 0) {
      return null;
   }

   return {
      port: PORT,
      portOrPipeString: 'port ' + PORT
   };
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
   var err = new Error('Not found');
   err.status = 404;
   next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
   app.use(function (err, req, res) {
      res.status(err.status || 500).render('error', {
         message: err.message,
         error: err
      });
   });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
   res.status(err.status || 500).render('error', {
      message: err.message,
      error: {}
   });
});