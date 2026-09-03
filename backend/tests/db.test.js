const { expect } = require('chai');

const dbModulePath = require.resolve('../src/config/db');

const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
};

function loadFreshDb() {
    delete require.cache[dbModulePath];
    return require('../src/config/db');
}

function restoreEnv() {
    if (originalEnv.NODE_ENV === undefined) {
        delete process.env.NODE_ENV;
    } else {
        process.env.NODE_ENV = originalEnv.NODE_ENV;
    }

    if (originalEnv.DB_NAME === undefined) {
        delete process.env.DB_NAME;
    } else {
        process.env.DB_NAME = originalEnv.DB_NAME;
    }

    if (originalEnv.DB_USER === undefined) {
        delete process.env.DB_USER;
    } else {
        process.env.DB_USER = originalEnv.DB_USER;
    }

    if (originalEnv.DB_PASSWORD === undefined) {
        delete process.env.DB_PASSWORD;
    } else {
        process.env.DB_PASSWORD = originalEnv.DB_PASSWORD;
    }

    if (originalEnv.DB_HOST === undefined) {
        delete process.env.DB_HOST;
    } else {
        process.env.DB_HOST = originalEnv.DB_HOST;
    }

    if (originalEnv.DB_PORT === undefined) {
        delete process.env.DB_PORT;
    } else {
        process.env.DB_PORT = originalEnv.DB_PORT;
    }
}

describe('Database Configuration', function () {

    afterEach(function () {
        restoreEnv();
        delete require.cache[dbModulePath];
    });

    describe('test environment', function () {

        it('creates an SQLite in-memory database when NODE_ENV is test', function () {

            process.env.NODE_ENV = 'test';

            const { sequelize } = loadFreshDb();

            expect(sequelize.getDialect()).to.equal('sqlite');

            // Sequelize normalizes the in-memory SQLite configuration.
            expect(sequelize.options.dialect).to.equal('sqlite');
        });

        it('connects successfully to the test database', async function () {

            process.env.NODE_ENV = 'test';

            const { sequelize, connectDB } = loadFreshDb();

            await connectDB();

            expect(sequelize.getDialect()).to.equal('sqlite');
            expect(sequelize.connectionManager).to.exist;
        });
    });

    describe('production/non-test environment', function () {

        it('creates a MySQL Sequelize instance using environment variables', function () {

            process.env.NODE_ENV = 'development';

            process.env.DB_NAME = 'test_database';
            process.env.DB_USER = 'test_user';
            process.env.DB_PASSWORD = 'test_password';
            process.env.DB_HOST = 'test_host';
            process.env.DB_PORT = '3307';

            const { sequelize } = loadFreshDb();

            expect(sequelize.getDialect()).to.equal('mysql');

            expect(sequelize.config.database).to.equal('test_database');
            expect(sequelize.config.username).to.equal('test_user');
            expect(sequelize.config.password).to.equal('test_password');
            expect(sequelize.config.host).to.equal('test_host');

            // Environment variables are strings, so Sequelize keeps the
            // configured port as a string in this Sequelize version.
            expect(String(sequelize.config.port)).to.equal('3307');
        });

        it('uses default database values when environment variables are missing', function () {

            process.env.NODE_ENV = 'development';

            delete process.env.DB_NAME;
            delete process.env.DB_USER;
            delete process.env.DB_PASSWORD;
            delete process.env.DB_HOST;
            delete process.env.DB_PORT;

            const { sequelize } = loadFreshDb();

            expect(sequelize.getDialect()).to.equal('mysql');

            expect(sequelize.config.database).to.equal('notes_app');
            expect(sequelize.config.username).to.equal('root');

            // Sequelize normalizes an empty password to null.
            expect(sequelize.config.password).to.be.oneOf(['', null]);

            expect(sequelize.config.host).to.equal('localhost');
            expect(Number(sequelize.config.port)).to.equal(3306);
        });
    });

    describe('connectDB()', function () {

        it('connects successfully and logs the database connection', async function () {

            process.env.NODE_ENV = 'test';

            const logger = require('../src/config/logger');
            const originalInfo = logger.info;

            let loggedMessage;

            logger.info = function (message) {
                loggedMessage = message;
            };

            try {
                const { connectDB } = loadFreshDb();

                await connectDB();

                expect(loggedMessage).to.equal('Database connected');
            } finally {
                logger.info = originalInfo;
            }
        });

        it('logs and rethrows the error when database authentication fails', async function () {

            process.env.NODE_ENV = 'test';

            const logger = require('../src/config/logger');
            const originalError = logger.error;

            const fakeError = new Error('Database authentication failed');

            let loggedError;

            logger.error = function (errorObject, message) {
                loggedError = {
                    errorObject,
                    message,
                };
            };

            try {
                const { sequelize, connectDB } = loadFreshDb();

                sequelize.authenticate = async function () {
                    throw fakeError;
                };

                let thrownError;

                try {
                    await connectDB();
                } catch (error) {
                    thrownError = error;
                }

                expect(thrownError).to.equal(fakeError);
                expect(loggedError).to.exist;
                expect(loggedError.errorObject.err).to.equal(fakeError);
                expect(loggedError.message).to.equal(
                    'Unable to connect to the database'
                );

            } finally {
                logger.error = originalError;
            }
        });
    });
});