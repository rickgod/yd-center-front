import axios from 'axios'

// 根据环境自动选择 API 地址
const baseURL = process.env.VUE_APP_API_BASE_URL;

// 创建 axios 实例
const api = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true, // 支持cookie
  // 注意：不设置Content-Type，让浏览器自动设置
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('认证请求:', config.url)
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
    // 对于登录接口，可能需要特殊处理
    if (response.config.url === '/center/login') {
      // Spring Security登录成功会返回重定向，这里直接返回true表示成功
      return true
    }
    // 对于其他接口，返回完整的响应数据
    return response.data
  },
  error => {
    console.error('认证请求失败:', error)
    return Promise.reject(error)
  }
)

export const authApi = {
  // 登录 - 使用FormData格式提交
  login(loginData) {
    // 创建FormData对象，符合Spring Security默认要求
    // const formData = new FormData()
    // 创建URLSearchParams对象，符合Spring Security要求
    const formData = new URLSearchParams()
    formData.append('username', loginData.username)
    formData.append('password', loginData.password)
    if (loginData.companyId) {
      formData.append('companyId', loginData.companyId)
    }
    if (loginData.loginType) {
      formData.append('loginType', loginData.loginType)
    }

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
  }
}