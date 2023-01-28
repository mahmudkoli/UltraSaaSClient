import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { singleValueTypeSetupUrl } from "src/configs/setup";
import authConfig from 'src/configs/auth'
import { QueryObject } from "src/common/Entity/QueryObject";
import { LoginParams, LoginResponse } from "src/context/types";
import { commonHelperService } from "src/common/helper/common.helper";
import { toast } from "react-toastify";
import { axiosPrivate } from "src/common/Interceptors/api.interceptor";

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const request = {
  get: <T>(url: string, body: QueryObject) => axiosPrivate.get<T>(`${url}?${commonHelperService.convertToQueryString(body)}`).then(responseBody),
  post: <T>(url: string, body: object) =>
    axiosPrivate.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axiosPrivate.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axiosPrivate.delete<T>(url).then(responseBody),
};

const singleValueTypeConfigApi = {
  get: (searchParam: QueryObject) => request.get<any>(singleValueTypeSetupUrl, searchParam),
  add: (payload: any) => request.post<string>(singleValueTypeSetupUrl, payload),
  update: (id: string, payload: any) => request.put<string>(`${singleValueTypeSetupUrl}/${id}`, payload),
  delete: (id: string) => request.delete<string>(`${singleValueTypeSetupUrl}/${id}`),
}

const auth = {
  login: (loginParam: LoginParams) => request.post<any>(authConfig.loginEndpoint, loginParam),
  refreshToken: (payload: any) => request.post<any>(authConfig.refreshTokenEndpoint, payload)
}


const api = {
  singleValueTypeConfigApi,
  auth
}

export default api;
