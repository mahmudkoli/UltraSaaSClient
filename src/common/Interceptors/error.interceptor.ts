import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAuth } from "src/hooks/useAuth";

// axios.interceptors.response.use(
//   async (response) => {
//     return response;
//   },
//   (error: AxiosError) => {
//     console.log("error")
//     const router = useRouter()
//     const auth = useAuth();
//     const { data, status, config } = error.response!;
//     switch (status) {
//       case 400:
//         console.log(data);
//         break;
//       case 401:
//         auth.refreshToken();
//         break;
//       case 404:
//         toast.error("server error");
//         break;
//       case 500:
//         toast.error("server error");
//         break;

//       default:
//         toast.error("an unknown error occurred");
//         break;
//     }
//     return Promise.reject(error);
//   }
// );
