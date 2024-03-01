export default class ResponseModel {
  code
  statusCode
  isError
  message
  rawError
  data

  constructor(code = '', isError = false, message, data) {
    this.code = code;
    this.statusCode = 0;
    this.isError = isError;
    this.message = message;
    this.data = data;
  }

  static createSuccess(data) {
    const response = new ResponseModel();
    response.data = data;
    response.isError = false;
    response.statusCode = 200;
    return response;
  }

  static createError(statusCode, message, code = '', rawError) {
    const response = new ResponseModel();
    response.isError = true;
    response.code = code;
    response.message = message;
    response.rawError = rawError;
    response.statusCode = statusCode;
    return response;
  }

  toString = () => {
    return this.message;
  };
}
