import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import AuthCenter from "../views/AuthCenter.vue";
import AuthCenterLoginPage from "../views/LoginPage.vue";
import AuthCenterDashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/auth-center",
    name: "AuthCenter",
    component: AuthCenter,
    meta: { requiresAuth: true }
  },
  {
    path: "/auth-login",
    name: "AuthCenterLoginPage",
    component: AuthCenterLoginPage,
  },
  {
    path: "/auth-home",
    name: "AuthCenterDashboard",
    component: AuthCenterDashboard,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// 路由守卫 - 使用Token验证
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录（从localStorage获取Token）
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      next(); // 已登录，允许访问
    } else {
      next('/login'); // 未登录，跳转到登录页
    }
  } else {
    next(); // 不需要认证，直接访问
  }
});

export default router;