import Vue from 'vue'
import Router from 'vue-router'
import { ConfigService } from './services/Config.js'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      beforeEnter: (to, from, next) => {
        let loginPath = '/login/'
        if (to.path === loginPath) { return next() }// If there already going to the login page dont bother them

        if (ConfigService.getLocalConfig('localMode')) { return next() } // If they have indicated they are ok with localMode, also dont bother them

        if (!ConfigService.getLocalConfig('user') || !ConfigService.getLocalConfig('database')) { return next(loginPath) }// Otherwise, it you dont have credentials, your going to login
        return next()
      },
      component () {
        return import('./layouts/Main.vue')
      },
      children: [
        {
          name: 'list',
          path: '',
          component () {
            return import('./views/List.vue')
          }
        },
        {
          name: 'tree',
          path: 'tree',
          component () {
            return import('./views/Tree.vue')
          }
        },
        {
          name: 'search',
          path: 'search',
          component () {
            return import('./views/Search.vue')
          }
        },
        {
          name: 'import-export',
          path: 'import-export',
          component () {
            return import('./views/ImportExport.vue')
          }
        },
        {
          name: 'entry',
          path: 'entry/:id?',
          component () {
            return import('./views/Entry.vue')
          }
        },
        {
          name: 'config',
          path: 'config',
          component () {
            return import('./views/Config.vue')
          }
        },
        {
          name: 'changes',
          path: 'change-feed',
          component () {
            return import('./views/ChangeFeed.vue')
          }
        },
        {
          name: 'connection',
          path: 'connection',
          component () {
            return import('./views/Login.vue')
          }
        }
      ]
    },
    {
      name: 'login',
      path: '/login/',
      component () {
        return import('./views/Login.vue')
      }
    }
  ]
})
