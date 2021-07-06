import Koa from 'koa';
import logger from 'koa-logger';
import path from 'path';
import fs from 'fs';
import staticServer from 'koa-static';
import Router from '@koa/router';
import historyFallback from 'koa2-history-api-fallback';

interface ServerParmas {
    isToLog: boolean;
    rootPath: string;
}

class Server {
    private isToLog: boolean;
    private rootPath: string;
    constructor({ isToLog, rootPath }: ServerParmas) {
        this.isToLog = isToLog;
        this.rootPath = rootPath;
    }

    public listen(...args: any[]) {
        const app = this.start();
        return app.listen(...args);
    }

    private start(): Koa {
        const app = new Koa();
        const router = new Router();

        // router.get('/', this.mainPage);

        // logger
        if (this.isToLog) {
            app.use(logger());
        }

        // router
        app.use(router.routes()).use(router.allowedMethods());

        // app.use(async (ctx: Koa.DefaultContext, next: Koa.Next) => {
        //     await next();
        //     if(parseInt(ctx.status, 10) === 404 ){
        //         ctx.response.redirect('/');
        //     }
        // })

        app.use(historyFallback({
            htmlAcceptHeaders: ['text/html'],
            index: '/index.html'
        }));

        // static
        app.use(staticServer(path.join(__dirname, '../dist/www')));
        app.use(staticServer(this.rootPath));

        return app;
    }

    private mainPage(ctx: Koa.DefaultContext, next: Koa.Next) {
        ctx.response.type = 'html';
        ctx.response.header['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
        ctx.response.header.Expires = '-1';
        ctx.response.header.Pragma = 'no-cache';
        ctx.response.body = fs.createReadStream(path.join(__dirname, '../dist/www/index.html'));
    }
}

export default Server;