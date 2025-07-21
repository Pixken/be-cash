import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import { storage } from '@/utils/storage';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/testnotificationlistener'
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue')
  },
  {
    path: '/notifications',
    component: () => import('@/views/notifications.vue')
  },
  {
    path: '/testnotificationlistener',
    component: () => import('@/views/testnotificationlistener.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/home.vue')
      },
      {
        path: 'chart',
        component: () => import('@/views/chart.vue')
      },
      {
        path: 'add-page',
        component: () => import('@/views/add-page.vue')
      },
      {
        path: 'account',
        component: () => import('@/views/account.vue')
      },
      {
        path: 'user',
        component: () => import('@/views/user.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuth() // 检查用户是否登录的方法
  
  // // 如果用户已登录但尝试访问登录页，重定向到首页
  // if (isAuthenticated && to.path === '/login') {
  //   return next('/')
  // }
  
  // // 如果需要登录且用户未登录，重定向到登录页
  // if (!isAuthenticated && to.path !== '/login' && to.path!== '/register') {
  //   return next('/login')
  // }
  
  // 其他情况正常放行
  next()
})
// 检查用户是否登录的方法
function checkAuth() {
  // 实际项目中可以从 localStorage/Vuex/store 中获取登录状态
  return storage.getItem('user')?.id !== undefined
  // 或 return store.getters.isAuthenticated
}


export default router
