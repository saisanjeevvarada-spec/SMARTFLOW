import api from './api'

export const googleSignUpApi = async (token) => {
  try {
    const response = await api.post('/auth/google-signup', { credential: token, token })
    if (response.data && response.data.success) {
      localStorage.setItem('smartflow_token', response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem('smartflow_refresh_token', response.data.refreshToken)
      }
      localStorage.setItem('smartflow_user', JSON.stringify(response.data.user))
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      }
    }
    return {
      success: false,
      message: response.data?.message || response.data?.error || 'Google Sign-In is not configured yet.'
    }
  } catch (error) {
    let message = 'Google Sign-In is not configured yet.'
    if (!error.response) {
      message = 'Cannot connect to backend server. Please verify backend is running.'
    } else if (error.response.data && error.response.data.error) {
      message = error.response.data.error
    }
    return {
      success: false,
      message
    }
  }
}

export const googleSignInApi = async (token) => {
  try {
    const response = await api.post('/auth/google-login', { credential: token, token })
    if (response.data && response.data.success) {
      localStorage.setItem('smartflow_token', response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem('smartflow_refresh_token', response.data.refreshToken)
      }
      localStorage.setItem('smartflow_user', JSON.stringify(response.data.user))
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      }
    }
    return {
      success: false,
      message: response.data?.message || response.data?.error || 'Google Sign-In is not configured yet.'
    }
  } catch (error) {
    let message = 'Google Sign-In is not configured yet.'
    if (!error.response) {
      message = 'Cannot connect to backend server. Please verify backend is running.'
    } else if (error.response.data && error.response.data.error) {
      message = error.response.data.error
    }
    return {
      success: false,
      message
    }
  }
}
