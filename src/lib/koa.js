const config = require('config');
const Koa = require('koa');
const bodyParser = require('koa-body');
const KoaETag = require('koa-etag');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const KoaResponseTime = require('koa-response-time');
const session = require('koa-session');
const koaStatic = require('koa-static');
const conditionalGet = require('koa-conditional-get');
const ws = require('koa-websocket');
const { join } = require('path');

const app = new Koa();
const socket = ws(app);
const debug = require('debug')('kgs:koa');

app.proxy = config.get('security.proxy');
app.keys = config.get('security.secrets.keys');

const sessionConfig = {
  key: config.get('security.session.key'),
  signed: true,
};
const rootDir = join(__dirname, '../../');
const staticContents = join(rootDir, 'static');
const NS_PER_SEC = 1e9;

debug('Root directory', rootDir);
debug('Static content path', staticContents);
debug('Application environment', app.env);

app.use(KoaResponseTime());
app.use(conditionalGet());
app.use(KoaETag());
app.use(koaStatic(staticContents, {}));

app.use(
  logger((str, args) => {
    if (args[2] === '/health' && (args[3] === 201 || args[3] === undefined)) {
      // health check by aws load balance
    } else {
      // eslint-disable-next-line no-console
      console.log(str);
    }
  }),
);
app.use(session(sessionConfig, app));
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // If no path catch this
    ctx.status = 500;
    ctx.body = err;
  }
});
app.use(
  bodyParser({
    multipart: true,
    jsonLimit: '1mb',
    formLimit: '30mb',
    textLimit: '1mb',
  }),
);
app.use(helmet(config.get('security.helmet')));

app.ws.use(async (ctx, next) => {
  const time = process.hrtime();
  await next();
  const diff = process.hrtime(time);
  debug(`Response took ${(diff[0] * NS_PER_SEC + diff[1]) / NS_PER_SEC} seconds`);
});

module.exports = { app, socket };
