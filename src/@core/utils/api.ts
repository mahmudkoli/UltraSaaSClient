import { AxiosResponse } from 'axios'
import { LoginParams, LoginResponse, UserDataType } from 'src/context/types'
import { axiosPrivate } from 'src/@core/interceptors/api.interceptor'
import { commonHelperService } from './common-helper.service'

//**endpints
import authConfig from 'src/configs/auth'
import singleValueConfig from 'src/configs/singleValue'
import instituteConfig from 'src/configs/institute';
import { SingleValueType } from 'src/types/apps/singleValueTypes'
import { PaginatedApiResponse } from 'src/types/apps/apiResponse'
import { Institute } from 'src/types/apps/institute'

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const request = {
  get: <T>(url: string) => axiosPrivate.get<T>(`${url}`).then(responseBody),
  post: <T>(url: string, body: object) => axiosPrivate.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axiosPrivate.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axiosPrivate.delete<T>(url).then(responseBody)
}

const auth = {
  login: (loginParam: LoginParams) => request.post<LoginResponse>(authConfig.loginEndpoint, loginParam),
  refreshToken: (payload: any) => request.post<any>(authConfig.onTokenExpiration, payload),
  me: () => request.get<UserDataType>(authConfig.meEndpoint)
}

const singleValue = {
  list: (query: any) => {
    const queryStr: string = commonHelperService.convertToQueryString(query)

    return request.get<PaginatedApiResponse<SingleValueType>>(`${singleValueConfig.listEndPoint}?${queryStr}`)
  },
  create: (payload: SingleValueType) => request.post<any>(singleValueConfig.createEndPoint, payload),
  edit: (payload: SingleValueType) => request.put<any>(`${singleValueConfig.editEndPoint}/${payload.id}`, payload),
  delete: (id: string) => request.delete<any>(`${singleValueConfig.deleteEndPoint}/${id}`)
}

const institute = {
  list: (query: any) => {
    const queryStr: string = commonHelperService.convertToQueryString(query)

    return request.get<PaginatedApiResponse<Institute>>(`${instituteConfig.listEndPoint}?${queryStr}`)
  },
  create: (payload: Institute) => request.post<any>(instituteConfig.createEndPoint, payload),
  edit: (payload: Institute) => request.put<any>(`${instituteConfig.editEndPoint}/${payload.id}`, payload),
  delete: (id: string) => request.delete<any>(`${instituteConfig.deleteEndPoint}/${id}`)
}

const api = {
  auth,
  singleValue,
  institute
}

export default api
