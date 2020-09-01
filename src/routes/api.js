const Router = require('koa-router');
const debug = require('debug')('kgs:api');
const router = new Router({ prefix: '/api' });

router.get('/health', async ctx => {
  ctx.status = 200;
  ctx.body = 'Ok';
});
router.get('/shutdown', async ctx => {
  debug('/shutdown triggered');
  await sleep(15);
  ctx.status = 200;
  ctx.body = 'Ok';
  debug('/shutdown responded');
});
router.get('/:id', async ctx => {
  if (process.env.hasOwnProperty(ctx.params.id)) {
    try {
      ctx.body = JSON.parse(process.env[ctx.params.id]);
    } catch (e) {
      ctx.body = process.env[ctx.params.id];
    }
  }
  else {
    ctx.body = 'Nope';
  }
});

function sleep(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n * 1000);
  });
}

module.exports = router;
