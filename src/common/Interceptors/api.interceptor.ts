import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import authConfig from 'src/configs/auth'

import { memoizedRefreshToken } from './refreshtoken';

axios.defaults.baseURL = "http://localhost:5000/api/v1";

axios.interceptors.request.use(
  async (config) => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)! || null;
    if (token) {
      config.headers = {
        ...config.headers,
        authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (error?.response?.status === 401 && !config?.sent) {
      config.sent = true;

      const result = await memoizedRefreshToken();

      if (result?.token) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${result?.token}`,
        };
      }

      return axios(config);
    }
    return Promise.reject(error);
  }
);


axios.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.log(error)
    const { data, status, config } = error.response!;
    switch (status) {
      case 400:
        console.log(data);
        break;
      case 404:
        toast.error("server error");
        break;
      case 500:
        toast.error("server error");
        break;

      default:
        toast.error("an unknown error occurred");
        break;
    }
    return Promise.reject(error);
  }
);

export const axiosPrivate = axios;
