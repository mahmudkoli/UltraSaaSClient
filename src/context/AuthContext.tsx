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
import api from 'src/API/api'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  setIsInitialized: () => Boolean,
  register: () => Promise.resolve(),
  refreshToken: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized)

  //** tenant info */
  const tenantHeaderInfo = {
    headers:{
      tenant : "root"
    }
  }

  const dummyUser =  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'admin@materialize.com'
  }
  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setIsInitialized(true)
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      if (storedToken) {
        setLoading(true)
        setUser({...dummyUser})
        setLoading(false)

        // await axios
        //   .get(authConfig.meEndpoint, {
        //     headers: {
        //       Authorization: storedToken
        //     }
        //   })
        //   .then(async response => {
        //     setLoading(false)
        //     setUser({ ...response.data.userData })
        //   })
        //   .catch(() => {
        //     localStorage.removeItem('userData')
        //     localStorage.removeItem('refreshToken')
        //     localStorage.removeItem('accessToken')
        //     setUser(null)
        //     setLoading(false)
        //   })
      } else {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.loginEndpoint, params, tenantHeaderInfo)
      .then(async res => {
        console.log(res);
        window.localStorage.setItem(authConfig.storageTokenKeyName, res.data.token)
        window.localStorage.setItem(authConfig.storageRefreshTokenKeyName, res.data.refreshToken)

        const returnUrl = router.query.returnUrl

        setUser({ ...dummyUser })
        await window.localStorage.setItem('userData', JSON.stringify(dummyUser))

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        console.log(redirectURL)

        router.replace(redirectURL as string)
      })
      // .then(() => {
      //   axios
      //     .get(authConfig.meEndpoint, {
      //       headers: {
      //         Authorization: window.localStorage.getItem(authConfig.storageTokenKeyName)!
      //       }
      //     })
      //     .then(async response => {
      //       console.log(response)
      //       const returnUrl = router.query.returnUrl

      //       setUser({ ...dummyUser })
      //       await window.localStorage.setItem('userData', JSON.stringify(dummyUser))

      //       const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      //       console.log(redirectURL)

      //       router.replace(redirectURL as string)
      //     })
      // })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    setIsInitialized(false)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem(authConfig.storageRefreshTokenKeyName)
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

  const handleRefreshToken = (errorCallback?: ErrCallbackType) => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)!
    const refreshToken = window.localStorage.getItem(authConfig.storageRefreshTokenKeyName)!
    axios.post(authConfig.refreshTokenEndpoint, { token: token, refreshToken: refreshToken }, tenantHeaderInfo).then(res => {
      window.localStorage.setItem(authConfig.storageTokenKeyName, res.data.token)
      window.localStorage.setItem(authConfig.storageRefreshTokenKeyName, res.data.refreshToken)
    })
    .catch(err => {
      if (errorCallback) errorCallback(err)
    })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    refreshToken: handleRefreshToken
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
