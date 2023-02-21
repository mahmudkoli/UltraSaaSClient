import axios, { AxiosError } from 'axios'
import authConfig from 'src/configs/auth'
import { memoizedRefreshToken } from '../utils/token.refresh'

axios.defaults.baseURL = 'https://ec2-43-207-155-250.ap-northeast-1.compute.amazonaws.com:5050/api'

axios.interceptors.request.use(
  async config => {
    const token = (await window.localStorage.getItem(authConfig.storageTokenKeyName)) || null

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }
    if (config.url?.includes('/tokens')) {
      config.headers = {
        tenant: 'root'
      }
    }

    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error?.config
    if ((error?.response?.status === 401 || error?.response?.status === 403) && !config?.sent) {
      config.sent = true
      console.log(error);
      const result = await memoizedRefreshToken()

      if (result?.token) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${result?.token}`
        }
      }

      return axios(config)
    }

    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  async response => {
    return response
  },
  (error: AxiosError) => {
    // console.log(error)
    const { data, status } = error.response!
    switch (status) {
      case 400:
        console.log(data)
        break
      case 404:
        // toast.error("server error");
        break
      case 500:
        // toast.error("server error");
        break

      default:
        // toast.error("an unknown error occurred");
        break
    }

    return Promise.reject(error)
  }
)

export const axiosPrivate = axios
