import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Layout from '@/layout'

const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/mywork',
    children: [{
      path: 'mywork',
      name: 'mywork',
      component: () => import('@/views/general/myWork/MyWork.vue'),
      meta: { title: 'mywork', icon: 'dashboard' }
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/project',
    children: [{
      path: 'project',
      name: 'project',
      component: () => import('@/views/general/project/Project.vue'),
      meta: { title: 'project', icon: 'dashboard' }
    }]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: constantRoutes
})

export default router
