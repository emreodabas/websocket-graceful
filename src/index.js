const { app } = require('./lib/koa');
const debug = require('debug')('kgs:core');

function normalizePort(val) {
  const fixedPort = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(fixedPort)) {
    return val;
  }

  if (fixedPort >= 0) {
    return fixedPort;
  }

  return false;
}

const port = normalizePort(process.env.PORT || '8085');

function onListening() {
  debug(`Current uid: ${process.getuid()}`);
  debug(`Current pid: ${process.pid}`);
  // debug(`The parent process is pid ${process.ppid}`);
  debug(`Application listening on port ${port}`);
  const keys = Object.keys(process.env);
  keys.forEach(key => {
    // console.info(`process.env.${key} ${process.env[key]}`);
  });
}

function onError(err) {
  if (err.syscall !== 'listen') {
    throw err;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (err.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw err;
  }
}

const routes = {
  api: require('./routes/api'),
  ws: require('./routes/ws'),
  static: require('./routes/static'),
};

app.use(routes.api.routes());
app.use(routes.api.allowedMethods());

app.ws.use(routes.ws.ws.routes());
app.ws.use(routes.ws.ws.allowedMethods());

app.use(routes.static.routes());
app.use(routes.static.allowedMethods());

app.listen(port, onListening).on('error', onError);
