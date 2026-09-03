const express =require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger =require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const cookieParser = require('cookie-parser');
const app = express();
app.disable('x-powered-by');
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: true}));
app.use(pinoHttp({logger, autoLogging: process.env.NODE_ENV != 'test',}));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
