jest.mock('axios',()=>({create: jest.fn(),}));
describe('API client',()=>{
  let axios;
  let client;
  let responseSuccess;
  let responseError;
  const originalApiUrl = process.env.REACT_APP_API_URL;
  beforeEach(()=>{
    jest.resetModules();
    delete process.env.REACT_APP_API_URL;
    axios = require('axios');
    responseSuccess = undefined;
    responseError = undefined;
    axios.create.mockReset();
    axios.create.mockReturnValue({interceptors:{response: {use: jest.fn((success, error)=>{responseSuccess = success;responseError = error;}
  ),},},});
    client = require('../api/client').default;
  });
  afterEach(()=>{
    jest.restoreAllMocks();
  });
  afterAll(()=>{
    if(originalApiUrl===undefined) {
      delete process.env.REACT_APP_API_URL;
    }
    else{
      process.env.REACT_APP_API_URL=originalApiUrl;
    }
  });
  test('should create axios client with the default API URL',()=>{
    expect(axios.create).toHaveBeenCalledWith({baseURL: 'http://localhost:5000/api',withCredentials: true,});
    expect(client).toBeDefined();
  });
  test('should return successful response from interceptor',()=>{
    const response ={status: 200,data: {success: true,},};

    expect(responseSuccess(response)).toBe(response);
  });
  test('should dispatch auth:unauthorized event for 401 errors',async()=>{
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const error ={response:{status: 401,},};
    await expect(responseError(error)).rejects.toBe(error);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event).toBeInstanceOf(Event);
    expect(event.type).toBe('auth:unauthorized');
    dispatchSpy.mockRestore();
  });
  test('should reject non-401 errors',async()=>{
    const dispatchSpy=jest.spyOn(window,'dispatchEvent');
    const error= {response:{status: 500,},};
    await expect(responseError(error)).rejects.toBe(error);
    expect(dispatchSpy).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });
  test('should reject errors without a response',async()=>{
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const error = new Error('Network error');
    await expect(responseError(error)).rejects.toBe(error);
    expect(dispatchSpy).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });
});