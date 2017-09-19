import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import utils from '../widgets/utils'
import $_GET from '../widgets/Get'
import env from '../widgets/env'
import qs from 'qs'

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  strict: debug,
  state: {
    insInfo: {}, // 所有险种详情信息
    insList: null, // 所有险种相关列表
    admin_id: document.getElementById('admin_id').value || $_GET['admin_id'] || '1846', // 用户ID
    pl_id: $_GET['pl_id'] || '', // 计划书ID

    plans: [{}], // 所有方案
    activePlan: 0, // 当前方案
    appl: {}, // 投保人
    // 编辑数据
    plansData: null, // 所有方案
    applData: {}, // 投保人
    saveStatus: [false] // 方案保存状态
  },
  getters: {
    assu: state => {
      let plans = state.pl_id ? state.plansData : state.plans
      return plans ? plans[state.activePlan].assu : {}
    },
    ins: state => {
      let plans = state.pl_id ? state.plansData : state.plans
      return plans ? plans[state.activePlan].ins : [{}]
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
      state.plans[state.activePlan].assu = utils.parseVueObj(payload)
    },
    ADD_INS (state) {
      console.log('commit mutation: ADD_INS')
      state.plans[state.activePlan].ins.push({})
    },
    ADD_PLAN (state) {
      console.log('commit mutation: ADD_PLAN')
      state.plans.push({
        ins: [{}],
        assu: {}
      })
      state.activePlan = state.plans.length - 1
      state.saveStatus.push(false)
    },
    SET_PLAN (state, payload) {
      console.log('commit mutation: SET_PLAN')
      state.plans[state.activePlan].ins = utils.parseVueObj(payload)
    },
    CHG_PLAN_STATUS (state, payload) {
      state.saveStatus[state.activePlan] = payload
    },
/*    SET_INSINFO (state, payload) {
      console.log('commit mutation: SET_INSINFO')
      state.insInfo = Object.assign(state.insInfo, payload)
    },*/
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
          let child = ret.data.data.child
          let plan = null
          let ins = []
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
            assu: plan.assu,
            ins
          })
          if (child) {
            child.forEach(item => {
              ins = []
              for (let j in item.content) {
                plan = utils.parsePlan(item.content[j])
                let addons = utils.parseChildPlan(item.content[j].children)
                ins.push({
                  main: plan.ins,
                  addon: addons
                })
                plans.push({
                  assu: plan.assu,
                  ins
                })
              }
            })
          }
          commit('SET_PARAM', {
            plansData: plans
          })
        }
      }).catch(payload.cb)
    },
    SET_INSLIST ({commit}, payload) {
      console.log('dispatch action: SET_INSLIST')
      utils.get('Prospectus/GetConf?uid=' + payload.admin_id).then(ret => {
        commit('SET_INSLIST', ret.data.data)
        payload.scb && payload.scb()
      }).catch(payload.ecb)
    }
/*    SET_INSINFO ({commit}, payload) {
      console.log('dispatch action: SET_INSINFO')
      utils.get('Warranty/getSafegoodsList?sc_id=' + payload.sc_id).then(ret => {
        commit('SET_INSINFO', {
          [payload.sc_id]: ret.data
        })
      }).catch(payload.cb)
    }*/
  }
})
