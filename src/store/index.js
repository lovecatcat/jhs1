import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import Promise from 'promise-polyfill'

// To add to window
if (!window.Promise) {
  window.Promise = Promise
}

import utils from '../widgets/utils'
import $_GET from '../widgets/Get'
import env from '../widgets/env'
import qs from 'qs'

const debug = process.env.NODE_ENV !== 'production'

const adminId = document.getElementById('admin_id').value

const getPlanIndex = (state, id = '') => {
  return state.plans.findIndex(item => {
    return item.id === (id || state.activePlan)
  })
}

export default new Vuex.Store({
  strict: debug,
  state: {
    insList: null, // 所有险种相关列表
    admin_id: (adminId !== '$admin_id' && adminId) || $_GET['admin_id'] || '1846', // 用户ID
    pl_id: $_GET['pl_id'] || '', // 计划书ID(子)
    parent_pl_id: $_GET['parent_pl_id'] || '', // 父级的ID
    safe_id: $_GET['safe_id'] || '',
    plans: [], // 所有方案
    plansFalse: false, // pl_id有没有数据
    activePlan: 1, // 当前方案
    appl: {}, // 投保人
    // 编辑数据
    applData: {}, // 投保人
    saveStatus: { // 方案保存状态
      1: false
    },
    assuchange: {
      1: true
    }, // 被保险人是否改变
    alias: null // 计划书名称
  },
  getters: {
    assu: state => {
      let plans = state.plans
      let plan = getPlanIndex(state)
      return plans && plans[plan] ? plans[plan].assu : {}
    },
    ins: state => {
      let plans = state.plans
      let plan = getPlanIndex(state)
      return plans && plans[plan] ? plans[plan].ins : [{}]
    }
  },
  mutations: {
    SET_PARAM (state, payload) {
      console.log('commit mutation: SET_PARAM')
      for (let index in payload) {
        if (typeof payload[index] === 'object' && !(payload[index] instanceof Array)) {
          state[index] = Object.assign({}, payload[index])
        } else {
          state[index] = payload[index]
        }
      }
    },
    SET_PLANFALSE (state) {
      console.log('commit mutation: SET_PLANFALSE')
      state.plansFalse = true
    },
    CHG_PLAN (state, payload) {
      console.log('commit mutation: CHG_PLAN')
      state.activePlan = payload
    },
    SET_APPL (state, payload) {
      console.log('commit mutation: SET_APPL')
      state.appl = utils.parseVueObj(payload)
    },
    SET_ASSU (state, payload) {
      console.log('commit mutation: SET_ASSU')
      state.plans[getPlanIndex(state, payload.id)].assu = utils.parseVueObj(payload.assu)
      state.assuchange[payload.id] = !state.assuchange[payload.id]
    },
    SET_ALIAS (state, payload) {
      console.log('commit mutation: SET_ALIAS')
      state.alias = payload
    },
    ADD_INS (state) {
      console.log('commit mutation: ADD_INS')
      state.plans[getPlanIndex(state)].ins.push({})
    },
    RMV_INS (state, index) {
      console.log('commit mutation: RMV_INS')
      state.plans[getPlanIndex(state)].ins[index] = ''
    },
    ADD_PLAN (state) {
      console.log('commit mutation: ADD_PLAN')
      let idArr = []
      state.plans.forEach(item => {
        idArr.push(item.id)
      })
      let id = Math.max.apply(null, idArr) + 1
      console.log(idArr)
      console.log(id)
      // let id = state.plans.length + 1
      // todo id 取出ID Math.max()

      state.plans.push({
        id,
        ins: [{}],
        assu: {}
      })
      state.activePlan = id
      state.saveStatus[id] = false
      state.assuchange[id] = true
    },
    SET_FIRST_PLAN (state) {
      console.log('commit mutation: SET_FIRST_PLAN')
      state.plans = [{
        id: 1,
        ins: [{
          main: {},
          addon: {}
        }],
        assu: {
          age: '',
          name: '',
          sex: ''
        }
      }]
    },
    SET_PLAN (state, payload) {
      console.log('commit mutation: SET_PLAN')
      state.plans[getPlanIndex(state)].ins = utils.parseVueObj(payload)
    },
    RMV_PLAN (state, index) {
      console.log('commit mutation: RMV_PLAN')
      state.plans.splice(index, 1)
      index = index - 1 < 0 ? 0 : (index - 1) // fix 删除第一个
      state.activePlan = state.plans[index].id
    },
    CHG_PLAN_STATUS (state, payload) {
      state.saveStatus[state.activePlan] = payload
    },
    SET_INSLIST (state, payload) {
      console.log('commit mutation: SET_INSLIST')
      state.insList = payload
    }
  },
  actions: {
    SET_PLANS ({commit}, payload) {
      console.log('dispatch action: SET_PLANS')
      let baseUrl = 'http://ts-open.ehuimeng.com/api/index/invoke'
      if (env.env === 'prod') {
        baseUrl = 'https://open.ehuimeng.com/api/index/invoke'
      }

      utils.post(baseUrl, qs.stringify({
        module: 'Prospectus',
        method: 'log',
        params: JSON.stringify({
          admin_id: payload.admin_id,
          pl_id: payload.pl_id
        })
      })).then(ret => {
        let plans = []
        if (ret.data && ret.data.data && ret.data.data.content) {
          let content = ret.data.data.content
          // let child = ret.data.data.child
          let plan = null
          let ins = []
          let alias = ret.data.data.alias
          commit('SET_ALIAS', alias) // 计划书名称
          for (let i in content) {
            plan = utils.parsePlan(content[i])
            commit('SET_PARAM', {
              applData: plan.appl
            })
            let addon = utils.parseChildPlan(content[i].children)
            ins.push({
              main: plan.ins,
              addon
            })
          }

          plans.push({
            id: plans.length + 1,
            assu: plan.assu,
            ins
          })
          console.log(JSON.stringify(plans))
          commit('SET_PARAM', {
            plans
          })
          commit('SET_PLANFALSE')
          payload.scb && payload.scb()
        } else { // 没有数据重置为空
          commit('SET_FIRST_PLAN')
          // payload.ecb(ret.data.message)
          // location.href = '/Wechat/prospectus'
        }
      }).catch(payload.ecb)
    },
    SET_SAFEIDPLANS ({commit}, payload) {
      console.log('dispatch action: SET_SAFEIDPLANS')
      console.log(payload.safe_id)
    },
    SET_INSLIST ({commit}, payload) {
      console.log('dispatch action: SET_INSLIST')
      utils.get('Prospectus/GetConf?uid=' + payload.admin_id).then(ret => {
        commit('SET_INSLIST', ret.data.data)
        payload.scb && payload.scb()
      }).catch(payload.ecb)
    }
  }
})
