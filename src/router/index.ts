import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/wallet'
      },
      {
        path: 'wallet',
        component: () => import('@/views/wallet.vue')
      },
      {
        path: 'calendar',
        component: () => import('@/views/calendar.vue')
      },
      {
        path: 'add-page',
        component: () => import('@/views/add-page.vue')
      },
      {
        path: 'shop',
        component: () => import('@/views/shop.vue')
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
