const {expect} = require('chai');
const sinon = require('sinon');
const authRateLimit = require('../src/middleware/authRateLimit');

describe('authRateLimit middleware', () => {
    let clock;
    beforeEach(() =>{
        authRateLimit.reset();
        clock = sinon.useFakeTimers({
            now: 1000000
        });
    });
    afterEach(() =>{
        authRateLimit.reset();
        clock.restore();
    });
    it('should allow the first request',() =>{
        const req = {ip: '127.0.0.1'};
        const res = {};
        const next = sinon.spy();
        authRateLimit(req, res, next);
        expect(next.calledOnce).to.equal(true);
    });
    it('should allow requests up to the maximum attempt limit',()=>{
        const req = {ip: '127.0.0.2'};
        const res = {};
        const next = sinon.spy();
        for(let i = 0; i < 10; i++){
            authRateLimit(req, res, next);
        }
        expect(next.callCount).to.equal(10);
    });
    it('should return 429 after exceeding the maximum attempts',()=>{
        const req = {ip: '127.0.0.3' };
        const res = {set: sinon.spy(),status: sinon.stub().returnsThis(),json: sinon.spy()};
        const next = sinon.spy();
        for(let i = 0; i < 11; i++){
            authRateLimit(req, res, next);
        }
        expect(next.callCount).to.equal(10);
        expect(res.status.calledWith(429)).to.equal(true);
        expect(res.set.calledWith('Retry-After', '900')).to.equal(true);
        expect(res.json.calledWith({success: false,message:'Too many authentication attempts. Please try again later.'})).to.equal(true);
    });
    it('should reset the attempts after the time window expires',()=>{
        const req = {ip: '127.0.0.4'};
        const res ={
            set: sinon.spy(),
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };
        const next = sinon.spy();
        for(let i = 0; i < 11; i++){
            authRateLimit(req, res, next);
        }
        expect(res.status.calledWith(429)).to.equal(true);
        clock.tick(15 * 60 * 1000);
        res.status.resetHistory();
        res.json.resetHistory();
        res.set.resetHistory();
        next.resetHistory();
        authRateLimit(req, res, next);
        expect(next.calledOnce).to.equal(true);
        expect(res.status.notCalled).to.equal(true);
    });
    it('should use socket remoteAddress when req.ip is unavailable', () => {
        const req = {socket: {remoteAddress: '192.168.1.10' }};
        const res = {};
        const next = sinon.spy();
        authRateLimit(req, res, next);
        expect(next.calledOnce).to.equal(true);
    });
    it('should use unknown when both ip and remoteAddress are unavailable', () => {
        const req = {socket: {}};
        const res = {};
        const next = sinon.spy();
        authRateLimit(req, res, next);
        expect(next.calledOnce).to.equal(true);
    });
});