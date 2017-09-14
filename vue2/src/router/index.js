import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
		  path: '/',
		  name: 'index',
		  component: () => import('../views/home/index')
		}, {
		  path: '/login',
		  name: 'login',
		  component: () => import('../views/member/login')
		}, {
		  path: '/film',
		  name: 'film',
		  component: () => import('../views/film/film-view')
		}, {
		  path: '/cinema',
		  name: 'cinema',
		  component: () => import('../views/cinema/index')
		}, {
		  path: '/detail/:id',
		  name: 'detail',
		  component: () => import('../views/film/detail')
		}, {
		  path: '/card',
		  name: 'card',
		  component: () => import('../views/card/index')
		}, {
		  path: '*',
		  component: () => import('../views/home/index')
		}
  ]
})
