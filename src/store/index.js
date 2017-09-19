import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'

//查看日志
import createLogger from 'vuex/dist/logger'


Vue.use(Vuex)

const debug=process.env.NODE_ENV!=='production'
//是不是通过mutation去修改
//webpack  npm run dev 就是dev环境
//webpack  npm run build 就是production环境

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  //严格模式，debug为true 开启严格模式
  strict:debug,
  plugins:debug?[createLogger()]:[]
  })
