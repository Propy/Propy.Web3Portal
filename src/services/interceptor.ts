import { toast } from 'sonner'

const onSuccess = (response: any) => {

  if (response?.data) {
    return response.data;
  }

  return response;
};

const onError = (error: any) => {

  if (!error.response) {
    return;
  }

  if(error?.response?.data?.message) {
    toast.error(error?.response?.data?.message);
  }

  switch (error.response.status) {
    case 500:
      return Promise.reject(error.response);
    default:
      break;
  }

  return Promise.reject(error.response)
};

const beforeRequestSuccess = (config: any, skipAccessToken: boolean = false) => {

  let propyAccessToken = localStorage.getItem("propyAccessToken");

  if (propyAccessToken && !skipAccessToken) {
    config.headers.Authorization = `Bearer ${propyAccessToken}`;
  }

  return config;
};

const beforeRequestSuccessCustom = (config: any) => {
  return config;
};

const beforeRequestError = (error: any) => {
  return Promise.reject(error);
};

export {onSuccess, onError, beforeRequestSuccess, beforeRequestSuccessCustom, beforeRequestError}
