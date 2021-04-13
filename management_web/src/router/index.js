import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404/404.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/mywork',
    children: [{
      path: 'mywork',
      name: '我的工作台',
      component: () => import('@/views/myWork/MyWork.vue'),
      meta: { path: '/mywork' }
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/project',
    children: [{
      path: 'project',
      name: '项目',
      redirect: '/project/backlog',
      component: () => import('@/views/project/Project.vue'),
      meta: { path: '/project' },
      children: [{
        path: 'backlog',
        name: '代办需求',
        meta: { path: '/project' },
        component: () => import('@/views/projectChild/backlog/Backlog.vue')
      },
      {
        path: 'dashboard',
        name: '看板',
        meta: { path: '/project' },
        component: () => import('@/views/projectChild/dashboard/Dashboard.vue')
      },
      {
        path: 'statistics',
        name: '统计报表',
        meta: { path: '/project' },
        component: () => import('@/views/projectChild/statistics/Statistics.vue')
      },
      {
        path: 'detail',
        name: '项目详情',
        meta: { path: '/project' },
        component: () => import('@/views/projectChild/detail/Detail.vue')
      }]
    }]
  }
  // {
  //   path: '/project',
  //   component: Layout,
  //   redirect: '/project/about',
  //   name: '项目',
  //   children: [{
  //     path: 'about',
  //     name: '项目',
  //     component: () => import('@/views/general/project/Project.vue'),
  //     meta: { path: '/project/about' }
  //   }]
  // }
]

export const adminRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/project',
    name: '系统管理',
    children: [{
      path: 'project',
      name: '项目管理',
      component: () => import('@/views/admin/project/Project.vue'),
      meta: { path: '/admin/project' }
    },
    {
      path: 'user',
      name: '用户管理',
      component: () => import('@/views/admin/user/User.vue'),
      meta: { path: '/admin/user' }
    }]
  }
]

const createRouter = () => new VueRouter({
  mode: 'history',
  routes: constantRoutes
})

const router = createRouter()

// 重置路由
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
