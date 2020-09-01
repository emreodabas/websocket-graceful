const Router = require('koa-router');
const debug = require('debug')('kgs:po');

const routerWs = new Router({ prefix: '/socket' });

routerWs.all('/', async ctx => {
  debug(`Client connected`);
  ctx.websocket.send(`Welcome! ${new Date()}`);
  const inval = setInterval(() => {
    if (ctx.websocket.readyState === ctx.websocket.OPEN) {
      ctx.websocket.send(`Connection is alive ${new Date()}`);
    }
    else {
      clearInterval(inval);
    }
  }, 5000);
  ctx.websocket.on('message', async function wsRoute(message) {
    debug('On socket request ', message);
    ctx.websocket.send(
      JSON.stringify({
        message: message
          .split('')
          .reverse()
          .join(''),
        time: new Date(),
      }),
    );
  });
});

module.exports = { ws: routerWs };
