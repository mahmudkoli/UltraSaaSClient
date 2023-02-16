export default {
  meEndpoint: '/personal/profile',
  loginEndpoint: '/tokens',
  registerEndpoint: '/tokens/refresh',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
