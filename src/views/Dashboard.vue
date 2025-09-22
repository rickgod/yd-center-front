<!-- 认证中心系统前端 - Dashboard.vue -->
<template>
  <div class="dashboard">
    <div class="header">
      <h2>认证中心</h2>
      <div class="user-info">
        <span>欢迎，{{ userInfo.username }}</span>
        <el-button @click="logout">退出登录</el-button>
      </div>
    </div>
    
    <div class="system-grid">
      <div class="system-card" @click="goToSystem('business-system')">
        <img src="/icons/business-system.png" alt="业务系统" />
        <h3>业务系统</h3>
        <p>点击进入业务系统</p>
      </div>
      
      <div class="system-card" @click="goToSystem('other-system')">
        <img src="/icons/other-system.png" alt="其他系统" />
        <h3>其他系统</h3>
        <p>点击进入其他系统</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthCenterDashboard',
  data() {
    return {
      userInfo: {}
    }
  },
  mounted() {
    // 获取用户信息
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      this.userInfo = JSON.parse(userInfo)
    } else {
      // 没有用户信息，跳转到登录页
      this.$router.push('/center/login')
    }
  },
  methods: {
    goToSystem(systemName) {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (systemName === 'business-system') {
        // 🎯 跳转到业务系统，携带Token
        const businessSystemUrl = 'http://selfwork.createflow-test.com/flow/login'
        window.location.href = `${businessSystemUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}`
      } else {
        // 其他系统
        this.$message.info('其他系统功能待开发')
      }
    },
    
    logout() {
      // 清除本地存储
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
      
      // 跳转到登录页
      this.$router.push('/center/login')
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.system-card {
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.system-card:hover {
  border-color: #409eff;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.2);
}

.system-card img {
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
}

.system-card h3 {
  margin: 10px 0;
  color: #333;
}

.system-card p {
  color: #666;
  font-size: 14px;
}
</style>