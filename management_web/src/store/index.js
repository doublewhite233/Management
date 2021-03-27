import Vue from 'vue'
import Vuex from 'vuex'

import mutations from './mutations.js'
import actions from './actions.js'
import getters from './getters.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user_info: { _id: '', username: '', role: '' }, // 用户信息
    project_info: { _id: '', name: '' },
    loading: false,
    routes: [] // 路由信息
  },
  mutations,
  actions,
  getters
})

export default store
