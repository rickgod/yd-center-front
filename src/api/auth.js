import axios from 'axios'

// 根据环境自动选择 API 地址
const baseURL = process.env.VUE_APP_API_BASE_URL;

// 创建 axios 实例
const api = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true, // 支持cookie，确保session有效
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('认证请求:', config.url)
    // 认证中心不使用Token进行认证，依赖session cookie
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('认证响应:', response)
    return response.data
  },
  error => {
    console.log('报错403了')
    if (error.response?.status === 403) {
      localStorage.removeItem('accessToken')
      return Promise.reject(new Error('session expired'))
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  // 登录 - 使用FormData格式提交
  login(loginData) {
    const formData = new URLSearchParams()
    formData.append('username', loginData.username)
    formData.append('password', loginData.password)
    return api.post('/center/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  // 登出
  logout() {
    return api.post('/center/logout')
  },

  // 获取系统列表
  getSystems() {
    return api.post('/center/systems')
  },

  // 获取当前session
  postSession(){
    return api.post('/center/admin/sessions')
  },

  // 新增踢人下线方法
  kickoutSession(sessionId) {
    return api({
      url: '/center/admin/sessions/kickout',
      method: 'post',
      params: { sessionId } // 确保使用params而非data
    })
  }


}