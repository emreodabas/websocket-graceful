const Router = require('koa-router');
const send = require('koa-send');
const { join } = require('path');

const staticContents = join(__dirname, '../../', 'static');
const router = new Router();

router.get('*', async ctx => {
  await send(ctx, 'index.html', {
    root: staticContents,
  });
});

module.exports = router;
