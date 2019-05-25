//路由页面

import Vue from 'vue'
import Router from 'vue-router'
import List from '@/components/hero/List'
import Detail from '@/components/hero/Detail'
import StudentList from '@/components/student/List'
import StudentDetail from '@/components/student/Detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'List',
      component: List
    },
    {
      path : '/league/:name',
      name : 'Detail',
      component : Detail
    },
    {
      path: '/student/list',
      name: 'StudentList',
      component: StudentList
    },
    {
      path : '/student/detail/:name',
      name : 'StudentDetail',
      component : StudentDetail
    },
  ]
})
