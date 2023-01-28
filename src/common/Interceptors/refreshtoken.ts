import mem from "mem";
import api from "src/API/api";
import authConfig from 'src/configs/auth'
import { useAuth } from "src/hooks/useAuth";


const refreshTokenFn = async () => {
    const authContext = useAuth();
    const token = JSON.parse(window.localStorage.getItem(authConfig.storageTokenKeyName)!);
    const refreshToken = JSON.parse(window.localStorage.getItem(authConfig.storageRefreshTokenKeyName)!);

    try {
        const response = await api.auth.refreshToken({ token: token, refreshToken: refreshToken })
        if (!response.data.token) {
            authContext.logout();
        }
        else {
            localStorage.setItem(authConfig.storageTokenKeyName, JSON.stringify(response.data.token));
            localStorage.setItem(authConfig.storageRefreshTokenKeyName, JSON.stringify(response.data.token));
        }
        return { token: token, refreshToken: refreshToken };
    } catch (error) {
        authContext.logout();
    }
};




const maxAge = 10000;
export const memoizedRefreshToken = mem(refreshTokenFn, {
    maxAge,
});