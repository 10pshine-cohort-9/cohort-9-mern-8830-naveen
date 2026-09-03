const {expect} = require('chai');
const notFound = require('../src/middleware/notFound');
describe('notFound middleware', () => {
    it('should call next with a 404 AppError', () => {
        const req ={method: 'GET', originalUrl: '/does-not-exist' };
        let receivedError;
        const next =(error) => {
            receivedError = error;
        };
        notFound(req, {}, next);
        expect(receivedError).to.exist;
        expect(receivedError.statusCode).to.equal(404);
        expect(receivedError.message).to.equal('Route not found: GET /does-not-exist');
    });
});