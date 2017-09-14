// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import xhr from 'vue-resource'

import FastClick from 'fastclick'

import components from './components'

window.addEventListener('load', () => {
  FastClick.attach(document.body)
})

Object.keys(components).forEach((key) => {
	var name = key.replace(/(\w)/, (v) => v.toUpperCase()) //首字母大写
	Vue.component(`v${name}`, components[key])
})

Vue.use(xhr)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

