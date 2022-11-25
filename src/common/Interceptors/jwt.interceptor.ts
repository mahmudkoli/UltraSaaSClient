import axios from "axios";
import authConfig from 'src/configs/auth'

import { memoizedRefreshToken } from './refreshtoken';

axios.defaults.baseURL = "http://localhost:5000/api/v1";

axios.interceptors.request.use(
    async (config) => {
      const token = JSON.parse(window.localStorage.getItem(authConfig.storageTokenKeyName)!);  
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
  
  export const axiosPrivate = axios;