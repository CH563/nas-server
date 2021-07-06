import readline from 'readline';
import os from 'os';
import colors from 'colors/safe';
import portfinder from 'portfinder';
import Server from './server';
import { name, version } from '../package.json';

// tslint:disable-next-line: no-var-requires
const argv = require('minimist')(process.argv.slice(2));

console.log(argv);

process.title = name;
if (argv.h || argv.help) {
    console.log(
        [
            'usage: nas-server [path] [options]',
            '',
            'options:',
            '  -p --port    Port to use [8080]',
            '  -a           Address to use [0.0.0.0]',
            '  -d           Show directory listings [true]',
            '  -i           Display autoIndex [true]',
            '  -g --gzip    Serve gzip files when possible [false]',
            '  -b --brotli  Serve brotli files when possible [false]',
            '               If both brotli and gzip are enabled, brotli takes precedence',
            '  -e --ext     Default file extension if none supplied [none]',
            '  -s --silent  Suppress log messages from output',
            '  --cors[=headers]   Enable CORS via the "Access-Control-Allow-Origin" header',
            '                     Optionally provide CORS headers list separated by commas',
            '  -o [path]    Open browser window after starting the server.',
            '               Optionally provide a URL path to open the browser window to.',
            '  -c           Cache time (max-age) in seconds [3600], e.g. -c10 for 10 seconds.',
            '               To disable caching, use -c-1.',
            '  -t           Connections timeout in seconds [120], e.g. -t60 for 1 minute.',
            '               To disable timeout, use -t0',
            '  -U --utc     Use UTC time format in log messages.',
            '  --log-ip     Enable logging of the client\'s IP address',
            '',
            '  -P --proxy         Fallback proxy if the request cannot be resolved. e.g.: http://someurl.com',
            '',
            '  --username   Username for basic authentication [none]',
            '               Can also be specified with the env variable NODE_HTTP_SERVER_USERNAME',
            '  --password   Password for basic authentication [none]',
            '               Can also be specified with the env variable NODE_HTTP_SERVER_PASSWORD',
            '',
            '  -S --ssl     Enable https.',
            '  -C --cert    Path to ssl cert file (default: cert.pem).',
            '  -K --key     Path to ssl key file (default: key.pem).',
            '',
            '  -r --robots        Respond to /robots.txt [User-agent: *\\nDisallow: /]',
            '  --no-dotfiles      Do not show dotfiles',
            '  -h --help          Print this list and exit.',
            '  -v --version       Print the version and exit.'
        ].join('\n')
    );
    process.exit();
}

let logger = {
    isToLog: false,
    info(...data: any[]) {
        //
    }
};
if (!argv.s && !argv.silent) {
    logger = {
        isToLog: true,
        info: console.log
    };
}
if (argv.v || argv.version) {
    logger.info(`v${version}`);
    process.exit();
}

const rootPath = argv._[0] || './';

const listen = (serverPort: number) => {
    const server = new Server({
        rootPath,
        isToLog: logger.isToLog
    });
    server.listen(serverPort, '0.0.0.0', () => {
        logger.info([colors.yellow(`Starting up ${name}, serving `),
            colors.cyan(rootPath),
            colors.yellow('\nAvailable on:')
        ].join(''));
        const iFaces = os.networkInterfaces() as any;
        Object.keys(iFaces).forEach((dev: string) => {
            iFaces[dev].forEach((details: any) => {
                if (details.family === 'IPv4') {
                    logger.info(('  http://' + details.address + ':' + colors.green(serverPort.toString())));
                }
            });
        });
        logger.info('Hit CTRL-C to stop the server');
    })
}

const port = argv.p || argv.port || parseInt(process.env.PORT || '', 10);
if (!port) {
    portfinder.basePort = 8080;
    portfinder.getPort((err, newPort: number) => {
        if (err) {
            throw err;
        }
        listen(newPort);
    });
} else {
    listen(port);
}

if (process.platform === 'win32') {
    readline.createInterface({ input: process.stdin, output: process.stdout }).on('SIGINT', () => {
        process.emit('SIGINT', 'SIGINT');
    });
}

process.on('SIGINT', () => {
    logger.info(colors.red(`${name} stopped.`));
    process.exit();
});

process.on('SIGTERM', () => {
    logger.info(colors.red(`${name} stopped.`));
    process.exit();
});