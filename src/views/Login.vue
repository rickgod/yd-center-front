<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>统一认证中心</h2>
        <p>请登录您的账户</p>
      </div>

      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const loginFormRef = ref()
    const loading = ref(false)
    const serviceUrl = ref('') // 存储service参数

    const loginForm = reactive({
      username: '',
      password: '',
    })

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ]
    }

    // 页面加载时获取service参数
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search)
      serviceUrl.value = urlParams.get('service') || ''
      console.log('获取到service参数:', serviceUrl.value)
    })

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      await loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            const res = await authApi.login(loginForm)
            console.log('authApi请求后返回的数据:', res)
            // 检查返回的数据结构
            if (res && res.code === 200) {
              ElMessage.success('登录成功')
              
              // 保存Token到localStorage，为后续业务系统单点登录准备
              localStorage.setItem('accessToken', res.data.accessToken)
              localStorage.setItem('refreshToken', res.data.refreshToken)
              localStorage.setItem('authenticated', 'true')
              
              // 检查是否有service参数
              if (serviceUrl.value) {
                // 有service参数，重定向到业务系统
                console.log('检测到service参数，准备重定向到:', serviceUrl.value)
                
                // 生成简单的票据参数
                const ticket = 'ST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8)
                
                // 构建回调URL
                const callbackUrl = serviceUrl.value + (serviceUrl.value.includes('?') ? '&' : '?') + 'flag=true&ticket=' + ticket
                console.log('构建回调URL:', callbackUrl)
                
                // 延迟一下再跳转，让用户看到成功提示
                setTimeout(() => {
                  window.location.href = callbackUrl
                }, 1000)
              } else {
                // 没有service参数，跳转到认证中心首页
                router.push('/auth-center')
              }
            } else {
              // 处理非200状态的成功响应
              ElMessage.error(res.message || '登录失败')
            }
          } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error('登录失败，请检查用户名和密码')
          } finally {
            loading.value = false
          }
        }
      })
    }

    return {
      loginFormRef,
      loginForm,
      rules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

:deep(.el-input__wrapper) {
  height: 45px;
}
</style>