import ResponseModel from './ResponseModel';

export default class DefaultResponseHandler {
  handleSuccess = (response, resolve) => {
    const { data } = response;
    resolve(ResponseModel.createSuccess(data));
  };

  handleError = (error, reject) => {
    let status = 0;
    let code = '';
    let message = '';
    let rawError;
    if (error.response) {
      status = error.response.status;

      const data = error.response.data;
      message =
        (typeof data === 'string'
          ? `Something went wrong`
          : this.extractErrorMessage(data)) || error.message;
      rawError = error.response;
    } else {
      // smt went wrong
      status = 500;
      message = error.message;
    }

    reject(ResponseModel.createError(status, message, code, rawError));
  };

  extractErrorMessage = (data) => {
    if (data) {
      if (data.body) {
        return data.body;
      }
      if (data.message) {
        return data.message;
      }
    }
    return `Something went wrong`;
  };
}
