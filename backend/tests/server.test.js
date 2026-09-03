const {expect} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('server.js', () => {
  let connectDB;
  let sequelize;
  let app;
  let logger;
  let processExitStub;
  let unhandledRejectionHandler;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPort = process.env.PORT;
  const loadServer = () => {
    delete require.cache[require.resolve('../src/server')];
    return proxyquire('../src/server', {'./app': app,'./config/db': {sequelize,connectDB,},'./config/logger': logger,});
  };
  beforeEach(() => {
    connectDB = sinon.stub().resolves();
    sequelize = {sync: sinon.stub().resolves(),close: sinon.stub().resolves(),};
    app ={
      listen: sinon.stub().callsFake((port, callback)=> {
        if(callback){
          callback();
        }
        return {
          close: sinon.stub().callsFake((done) =>{
            done();
          }),
        };
      }),
    };
    logger = {info: sinon.stub(),error: sinon.stub(),};
    unhandledRejectionHandler = null;
    sinon.stub(process, 'on').callsFake((event, handler) => {
      if(event === 'unhandledRejection'){
        unhandledRejectionHandler = handler;
      }
      return process;
    });
    processExitStub = sinon.stub(process, 'exit');
    process.env.NODE_ENV = 'development';
    process.env.PORT = '5001';
  });
  afterEach(() => {
    sinon.restore();
    if(originalNodeEnv === undefined){
      delete process.env.NODE_ENV;
    }
    else{
      process.env.NODE_ENV = originalNodeEnv;
    }
    if (originalPort ===undefined){
      delete process.env.PORT;
    }
    else{
      process.env.PORT = originalPort;
    }
    delete require.cache[require.resolve('../src/server')];
  });
  it('should start the server successfully', async () => {
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    expect(connectDB.calledOnce).to.equal(true);
    expect(sequelize.sync.calledWith({alter: true,})).to.equal(true);
    expect(app.listen.calledOnce).to.equal(true);
    expect(app.listen.firstCall.args[0]).to.equal('5001');
    expect(logger.info.calledWith('Server running in development')).to.equal(true);
    expect(logger.error.notCalled).to.equal(true);
  });
  it('should use alter false when NODE_ENV is not development', async () => {
    process.env.NODE_ENV = 'test';
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    expect(sequelize.sync.calledWith({alter: false,})).to.equal(true);
    expect(app.listen.calledOnce).to.equal(true);
  });
  it('should log error and exit when server startup fails', async () => {
    const startupError = new Error('Database connection failed');
    connectDB.rejects(startupError);
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    expect(logger.error.calledOnce).to.equal(true);
    expect(logger.error.calledWith({err: startupError},'Failed to start server')).to.equal(true);
    expect(processExitStub.calledWith(1)).to.equal(true);
    expect(app.listen.notCalled).to.equal(true);
  });
  it('should handle unhandled rejection and close server', async () => {
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    expect(unhandledRejectionHandler).to.be.a('function');
    const rejectionError = new Error('Unexpected rejection');
    await unhandledRejectionHandler(rejectionError);
    expect(logger.error.calledWith({err: rejectionError},'Unhandled promise rejection. shutting down...')).to.equal(true);
    expect(sequelize.close.calledOnce).to.equal(true);
    expect(processExitStub.calledWith(1)).to.equal(true);
  });
  it('should close server before closing database during unhandled rejection', async () => {
    let serverClosed = false;
    let serverClosedBeforeDbClose = null;
    app.listen.callsFake((port, callback) =>{
      if(callback){
        callback();
      }
      return {
        close: sinon.stub().callsFake((done) =>{
          serverClosed = true;
          done();
        }),
      };
    });
    sequelize.close.callsFake(async()=>{
      serverClosedBeforeDbClose = serverClosed;
  });
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    const rejectionError = new Error('Server failure');
    await unhandledRejectionHandler(rejectionError);
    expect(serverClosedBeforeDbClose).to.equal(true);
    expect(sequelize.close.calledOnce).to.equal(true);
    expect(processExitStub.calledWith(1)).to.equal(true);
  });
  it('should log cleanup error when shutdown cleanup fails', async () => {
    loadServer();
    await new Promise((resolve) => setImmediate(resolve));
    const cleanupError = new Error('Database close failed');
    sequelize.close.rejects(cleanupError);
    const rejectionError = new Error('Unhandled error');
    await unhandledRejectionHandler(rejectionError);
    expect(logger.error.calledWith({err: cleanupError},'Error during shutdown cleanup')).to.equal(true);
    expect(processExitStub.calledWith(1)).to.equal(true);
  });
});