import axios from 'axios';
import DefaultResponseHandler from './ResponseHandler';

let url = '';
let apiInstance = null;
let responseHandler;
const defaultResponseHandler = new DefaultResponseHandler();

export const setApiInstance = (apiHost, token, username) => {
  url = apiHost;
  const headers = {
    'Content-Type': 'multipart/form-data',
    token,
    username,
  };

  apiInstance = axios.create({
    apiHost,
    headers
  });
};

const executeRequest = (promise) => {
  return new Promise((resolve, reject) => {
    const handler =
      responseHandler && typeof responseHandler === 'function'
        ? responseHandler
        : defaultResponseHandler;
    promise
      .then((response) => {
        handler.handleSuccess(response, resolve, reject);
        responseHandler = undefined;
      })
      .catch((error) => {
        handler.handleError(error, reject);
        responseHandler = undefined;
      });
  });
};

export const doPostRequest = (endpoint, payload) => {
  const api = apiInstance;
  return executeRequest(api.post(url + endpoint, payload));
};



