import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs'
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

export default router
