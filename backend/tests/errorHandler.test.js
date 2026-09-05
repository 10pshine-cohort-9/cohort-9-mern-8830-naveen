const {expect} = require('chai');
const sinon = require('sinon');
const logger = require('../src/config/logger');
const errorHandler = require('../src/middleware/errorHandler');
describe('errorHandler middleware', () =>{
let status;
let json;
let res;
beforeEach(() => {
    status = sinon.stub().returnsThis();
    json = sinon.spy();
    res = {status,json};
});
afterEach(() => {
    sinon.restore();
});
it('should return an operational error with its message', () => {
    const err = {statusCode: 400,isOperational: true,message: 'Invalid request'};
    errorHandler(err,{method: 'GET', originalUrl: '/api/test' },res, sinon.spy());
    expect(status.calledWith(400)).to.equal(true);
    expect(json.calledWith({success: false,message: 'Invalid request'})).to.equal(true);
});
it('should return a generic message for a non-operational error', () => {
    const err ={statusCode: 500,isOperational: false,message: 'Database failure'};
    errorHandler(err,{method: 'GET', originalUrl: '/api/test' },res,sinon.spy());
    expect(status.calledWith(500)).to.equal(true);
    expect(json.calledWith({success: false,message: 'Something went wrong. Please try again later.'})).to.equal(true);
});
it('should include the stack in development for a non-operational error', () => {
    const originalEnv = process.env.NODE_ENV;
    try{
        process.env.NODE_ENV = 'development';
        const err ={statusCode: 500,isOperational: false,message: 'Unexpected failure', stack: 'Error: Unexpected failure\n    at test'};
        errorHandler(err,{method:'POST', originalUrl: '/api/test' },res,sinon.spy());
        expect(json.calledWith({success: false,message: 'Something went wrong. Please try again later.',stack: err.stack})).to.equal(true);
    }
    finally{
        if(originalEnv === undefined){
            delete process.env.NODE_ENV;
        }
        else{
            process.env.NODE_ENV = originalEnv;
        }
    }
});
it('should use default status code 500 when statusCode is missing', () => {
    const err = {message: 'Unknown error'};
    errorHandler(err,{method: 'GET', originalUrl: '/api/test' },res,sinon.spy());
    expect(status.calledWith(500)).to.equal(true);
    expect(json.calledWith({success: false,message: 'Something went wrong. Please try again later.'})).to.equal(true);
});
it('should log the error details', () => {
    const loggerStub = sinon.stub(logger, 'error');
    const err ={statusCode: 404,isOperational: true,message: 'Not found'};
    const req = {method: 'GET',originalUrl: '/missing'};
    errorHandler(err, req, res, sinon.spy());
    expect(loggerStub.calledOnce).to.equal(true);
    expect(loggerStub.firstCall.args[0]).to.deep.equal({err,req: {method: 'GET',url: '/missing'},statusCode: 404});
    loggerStub.restore();
});
});
