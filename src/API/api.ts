import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";
import { singleValueTypeSetupUrl } from "src/configs/setup";
import authConfig from 'src/configs/auth'
import { QueryObject } from "src/common/Entity/QueryObject";
import { LoginParams, LoginResponse } from "src/context/types";
import { commonHelperService } from "src/common/helper/common.helper";
import { toast } from "react-toastify";

axios.defaults.baseURL = "http://localhost:5000/api/v1";

const responseBody = <T>(response: AxiosResponse<T>) => response.data;


axios.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.log("error")
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


const request = {
  get: <T>(url: string, body : QueryObject) => axios.get<T>(`${url}?${commonHelperService.convertToQueryString(body)}`).then(responseBody),
  post: <T>(url: string, body: object) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const singleValueTypeConfigApi = {
  get: (searchParam: QueryObject) => request.get<any>(singleValueTypeSetupUrl, searchParam),
  add: (payload: any) => request.post<string>(singleValueTypeSetupUrl, payload),
  update: (id: string, payload: any) => request.put<string>(`${singleValueTypeSetupUrl}/${id}`, payload),
  delete: (id: string) => request.delete<string>(`${singleValueTypeSetupUrl}/${id}`),
}

const auth = {
  login : (loginParam :LoginParams) => request.post<any>(authConfig.loginEndpoint, loginParam),
  refreshToken : (payload:any) => request.post<any>(authConfig.refreshTokenEndpoint, payload) 
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
  auth  
}

export default api;