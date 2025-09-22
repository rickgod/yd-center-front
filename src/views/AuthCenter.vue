<template>
  <div class="auth-center">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <h2>认证中心</h2>
        </div>
        <div class="user-info">
          <el-button
            type="info"
            size="small"
            @click="fetchAllSessions"
            style="margin-right: 10px;"
          >
            <el-icon><List /></el-icon>
            查看所有会话
          </el-button>
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              <el-icon><User /></el-icon>
              {{ userInfo.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
        >
          <el-menu-item index="systems">
            <el-icon><Grid /></el-icon>
            <span>系统列表</span>
          </el-menu-item>
          <el-menu-item index="sessions">
            <el-icon><List /></el-icon>
            <span>会话管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <div v-if="activeMenu === 'systems'" class="systems-container">
          <!-- 原有系统列表内容保持不变 -->
          <div class="page-header">
            <h3>系统列表</h3>
            <p>点击下方图标进入对应系统</p>
          </div>
          
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          
          <div v-else class="systems-grid">
            <div
              v-for="system in systems"
              :key="system.id"
              class="system-card"
              @click="navigateToSystem(system.systemUrl)"
            >
              <div class="system-icon">
                <el-icon :size="40">
                  <component :is="system.icon" />
                </el-icon>
              </div>
              <div class="system-name">{{ system.systemName }}</div>
              <div class="system-desc">{{ system.description }}</div>
            </div>
          </div>
        </div>

        <el-table v-if="activeMenu === 'sessions'" :data="allSessions" v-loading="sessionsLoading">
            <el-table-column prop="sessionId" label="会话ID" width="220" />
            <el-table-column prop="principal" label="用户" width="120" />
            <el-table-column prop="lastRequest" label="最后活动时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.lastRequest) }}
              </template>
            </el-table-column>
        </el-table>



      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  Grid,
  Loading,
  View,
  House,
  Setting,
  Document,
  DataBoard,
  Monitor,
  Tools,
  Files,
  Management
} from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

export default {
  name: 'AuthCenter',
  components: {
    User,
    Grid,
    Loading,
    View,
    House,
    Setting,
    Document,
    DataBoard,
    Monitor,
    Tools,
    Files,
    Management
  },
  setup() {
    // 新增响应式数据
    const allSessions = ref([])
    const sessionsLoading = ref(false)
    const activeMenu = ref('systems')

    const router = useRouter()
    const loading = ref(false)
    
    const userInfo = reactive({
      username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : 'admin'
    })

    // 系统列表数据
    const systems = ref([])
  

    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          ElMessage.info('个人资料功能开发中...')
          break
        case 'settings':
          ElMessage.info('系统设置功能开发中...')
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 调用登出接口
        try {
          await authApi.logout()
        } catch (error) {
          console.warn('登出接口调用失败:', error)
        }
        
        // 清除本地存储
        localStorage.removeItem('user')
        localStorage.removeItem('authenticated')
        
        ElMessage.success('退出成功')
        router.push('/login')
      } catch {
        // 用户取消
      }
    }

    const navigateToSystem = (url) => {
      // 在新标签页中打开系统
      window.open(url, '_blank')
    }


    // 新增方法
    const fetchAllSessions = async () => {
      try {
        sessionsLoading.value = true
        activeMenu.value = 'sessions'
        const res = await authApi.postSession()
        allSessions.value = res.data || []
      } catch (error) {
        ElMessage.error('获取会话列表失败: ' + error.message)
      } finally {
        sessionsLoading.value = false
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    // 获取系统列表
    const fetchSystems = async () => {
      loading.value = true
      try {
        const response = await authApi.getSystems()
        
        if (response && response.data) {
          systems.value = response.data
        }
      } catch (error) {
        ElMessage.error('获取系统列表失败')
      } finally {
        loading.value = false
      }
    }


    onMounted(() => {
      // 检查登录状态
      const isAuthenticated = localStorage.getItem('authenticated') === 'true'
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      // 获取系统列表
      fetchSystems()
    })

    return {
      activeMenu,
      loading,
      userInfo,
      systems,
      handleCommand,
      navigateToSystem,
      handleLogout,
      fetchAllSessions,
      formatDate,
      allSessions,
      sessionsLoading
    }
  }
}
</script>

<style scoped>
/* 新增样式 */
.sessions-container {
  padding: 20px;
}

.auth-center {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.logo h2 {
  color: #409eff;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-name:hover {
  background-color: #f5f7fa;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
}

.sidebar-menu {
  border: none;
  height: 100%;
}

.content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

.systems-container {
  height: 100%;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.loading-container .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.system-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e6e6e6;
}

.system-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #409eff;
}

.system-icon {
  margin-bottom: 15px;
  color: #409eff;
}

.system-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.system-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.session-info {
  padding: 10px 0;
}

.session-info pre {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .systems-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .system-card {
    padding: 20px 15px;
  }
  
  .system-name {
    font-size: 14px;
  }
  
  .system-desc {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar-menu .el-menu-item span {
    display: none;
  }
  
  .systems-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
}
</style>