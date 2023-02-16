// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types'
import api from 'src/@core/utils/api'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      if (storedToken) {
        setLoading(true)
        await api.auth
          .me()
          .then(async response => {
            console.log(response)
            setLoading(false)
            setUser({ ...response, ...{ role: 'admin' } })
          })
          .catch(() => {
            localStorage.removeItem('userData')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    await api.auth
      .login(params)
      .then(async response => {
        console.log(response)
        await window.localStorage.setItem(authConfig.storageTokenKeyName, response.token)
        await window.localStorage.setItem(authConfig.onTokenExpiration, response.refreshToken)

        return await api.auth.me()
      })
      .then(async (userInfo: UserDataType) => {
        console.log(userInfo)
        const returnUrl = router.query.returnUrl

        setUser({ ...userInfo, ...{ role: 'admin' } })
        await window.localStorage.setItem('userData', JSON.stringify(userInfo))

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        console.log(redirectURL)

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.registerEndpoint, params)
      .then(res => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error)
        } else {
          handleLogin({ email: params.email, password: params.password })
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null))
  }

  // const HandleRefreshToken = async (errorCallback?: ErrCallbackType) => {
  //   const token = window.localStorage.getItem(authConfig.storageTokenKeyName)!
  //   const refreshToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
  //   await api.auth
  //     .refreshToken({ token: token, refreshToken: refreshToken })
  //     .then(async res => {
  //       await window.localStorage.setItem(authConfig.storageTokenKeyName, res.token)
  //       await window.localStorage.setItem(authConfig.storageTokenKeyName, res.refreshToken)
  //     })
  //     .catch(err => {
  //       if (errorCallback) errorCallback(err)
  //     })
  // }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
