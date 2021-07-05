import Koa from 'koa';
import logger from 'koa-logger';

class Server {
    constructor() {
        //
    }

    public listen(...args) {
        const app = this.start();
        return app.listen(...args);
    }

    private start(): Koa {
        const app = new Koa();
        // logger
        app.use(logger());

        // response
        app.use(async ctx => {
            ctx.body = 'Hello World';
        });
        return app;
    }
}

export default Server;