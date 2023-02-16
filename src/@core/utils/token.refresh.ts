import mem from 'mem'

import authConfig from 'src/configs/auth'
import { useAuth } from 'src/hooks/useAuth'
import api from './api'

const RefreshTokenFn = async () => {
  const authContext = useAuth()
  const token = JSON.parse(window.localStorage.getItem(authConfig.storageTokenKeyName)!)
  const refreshToken = JSON.parse(window.localStorage.getItem(authConfig.onTokenExpiration)!)

  try {
    const response = await api.auth.refreshToken({ token: token, refreshToken: refreshToken })
    if (!response.data.token) {
      authContext.logout()
    } else {
      localStorage.setItem(authConfig.storageTokenKeyName, JSON.stringify(response.data.token))
      localStorage.setItem(authConfig.onTokenExpiration, JSON.stringify(response.data.token))
    }

    return { token: token, refreshToken: refreshToken }
  } catch (error) {
    authContext.logout()
  }
}

const maxAge = 10000
export const memoizedRefreshToken = mem(RefreshTokenFn, {
  maxAge
})
