const pino =require('pino');
const isProd =process.env.NODE_ENV==='production';
const isTest =process.env.NODE_ENV==='test';
const logger =pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: !isProd&& !isTest? {target: 'pino-pretty', options: {colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname',},}:undefined, enabled: !isTest,
});
module.exports =logger;