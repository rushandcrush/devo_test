import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: () => import('../views/Edit.vue')
    },
    { 
      path: "/:catchAll(.*)", 
      redirect: '/'
    }
  ]
})

export default router
