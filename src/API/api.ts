import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { singleValueTypeSetupUrl } from "src/configs/setup";
import authConfig from 'src/configs/auth'
import { QueryObject } from "src/common/Entity/QueryObject";
import { LoginParams, LoginResponse } from "src/context/types";
import { commonHelperService } from "src/common/helper/common.helper";

axios.defaults.baseURL = "http://localhost:5000/api/v1";

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use((config:AxiosRequestConfig) => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName)!
  if (token) 
    config.headers = {Authorization : `Bearer ${token}`}
  return config;
});


const request = {
  get: <T>(url: string, body : QueryObject) => axios.get<T>(`${url}?${commonHelperService.convertToQueryString(body)}`).then(responseBody),
  post: <T>(url: string, body: object) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const singleValueTypeConfigApi = {
  get: (searchParam: QueryObject) => request.get<SingleValueTypeConfig[]>(singleValueTypeSetupUrl, searchParam),
  add: (payload: SingleValueTypeConfig) => request.post<string>(singleValueTypeSetupUrl, payload),
  update: (id: string, payload: SingleValueTypeConfig) => request.put<string>(`${singleValueTypeSetupUrl}/${id}`, payload),
  delete: (id: string) => request.delete<string>(`${singleValueTypeSetupUrl}/${id}`),
}

const auth = {
  login : (loginParam :LoginParams) => request.post<LoginResponse>(authConfig.loginEndpoint, loginParam),
  refreshToken : (payload:any) => request.post<LoginResponse>(authConfig.refreshTokenEndpoint, payload) 
}

/*
Please follow this example for CRUD operation

const Experience = {
    list: () => request.get<Experience[]>("/experience"),

    create: (payload:ExperiencePayload) => {

     //if form is not sending file, send the payload directly not need to create FormData object
     
      const formData = new FormData();
      formData.append("Company", payload.company);
      formData.append("Position", payload.position);
      formData.append("Responsibilities", payload.responsibilities);
      formData.append("StartDate", StartDate);
      if(EndDate) formData.append("EndDate", EndDate);
      formData.append("PhotoFile", payload.photoFile);
  
      return axios.post<any>("/experience", formData, {
        headers: { "Content-type": "multipart/form-data" },
      });
    },

    update:(id:string, payload:ExperiencePayload) => {
      return axios.put<any>(`/experience/${id}`, payload);
    },

    delete: (id:string) => axios.delete(`experience/${id}`)
  };

*/
const api = {
  singleValueTypeConfigApi,
  
}

export default api;