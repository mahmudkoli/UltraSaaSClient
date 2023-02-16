export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  email: string
  username: string
  password: string
}

export type UserDataType = {
  id: string
  userName: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  emailConfirmed: boolean
  phoneNumber: string
  imageUrl: string
  phoneNumberConfirmed: boolean
  address: string
  gender: string
  dateOfBirth: string
  role?: string
  avatar?: string | null
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void
}

export type LoginResponse = {
  token: string
  refreshToken: string
  refreshTokenExpiryTime: string
}
