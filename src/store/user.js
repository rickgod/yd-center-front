// 认证中心系统前端 - store/user.js
import axios from 'axios'

const state = {
  userInfo: null,
  accessToken: null,
  refreshToken: null
}

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    state.accessToken = userInfo.accessToken
    state.refreshToken = userInfo.refreshToken
  },
  
  CLEAR_USER_INFO(state) {
    state.userInfo = null
    state.accessToken = null
    state.refreshToken = null
  }
}

const actions = {
  setUserInfo({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
    
    // 🎯 存储到localStorage
    localStorage.setItem('accessToken', userInfo.accessToken)
    localStorage.setItem('refreshToken', userInfo.refreshToken)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  
  clearUserInfo({ commit }) {
    commit('CLEAR_USER_INFO')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  },
  
  // 🎯 检查认证状态
  async checkAuthStatus({ commit }) {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken && refreshToken) {
      try {
        const response = await axios.post('/auth/verify-token', {}, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (response.data.success) {
          commit('SET_USER_INFO', {
            ...response.data.data,
            accessToken: accessToken,
            refreshToken: refreshToken
          })
        } else {
          // Token无效，尝试刷新
          await this.dispatch('refreshToken')
        }
      } catch (error) {
        // Token无效，尝试刷新
        await this.dispatch('refreshToken')
      }
    }
  },
  
  // 🎯 刷新Token
  async refreshToken({ commit, state }) {
    try {
      const response = await axios.post('/auth/refresh', {
        refreshToken: state.refreshToken,
        clientId: 'auth_center',
        clientSecret: 'auth_center_secret'
      })
      
      if (response.data.success) {
        // 更新Token
        const newAccessToken = response.data.data.accessToken
        commit('SET_USER_INFO', {
          ...response.data.data,
          accessToken: newAccessToken,
          refreshToken: state.refreshToken
        })
        
        // 更新localStorage
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('userInfo', JSON.stringify({
          ...response.data.data,
          accessToken: newAccessToken,
          refreshToken: state.refreshToken
        }))
        
        return true
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Token刷新失败:', error)
      commit('CLEAR_USER_INFO')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      return false
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}