import axios, { AxiosError, AxiosResponse } from "axios";

axios.defaults.baseURL = "http://localhost:5000/api";

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const request = {
  get: <T>(url: string) => axios.get<T>(url).then(responseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const Example = {
  get: () => request.get<any>("/skill"),
  add: (payload: any) => request.post<any>("url", payload),
  update: (id: string, payload: any) => request.put<any>(`url/${id}`, payload),
  delete: (id: any) => request.delete<any>(`url/${id}`),
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
  Example
}

export default api;