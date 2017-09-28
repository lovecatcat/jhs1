import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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
    pl_id: $_GET['pl_id'] || '', // 计划书ID

    plans: [], // 所有方案
    activePlan: 1, // 当前方案
    appl: {}, // 投保人
    // 编辑数据
    applData: {}, // 投保人
    saveStatus: { // 方案保存状态
      1: false
    }
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
    },
    SET_PLAN (state, payload) {
      console.log('commit mutation: SET_PLAN')
      state.plans[getPlanIndex(state)].ins = utils.parseVueObj(payload)
    },
    RMV_PLAN (state, index) {
      console.log('commit mutation: SET_PLAN')
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
            id: plans.length + 1,
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
                  id: plans.length + 1,
                  assu: plan.assu,
                  ins
                })
              }
            })
          }
          console.log(JSON.stringify(plans))
          commit('SET_PARAM', {
            plans
          })
          payload.scb && payload.scb()
        } else {
          payload.ecb(ret.data.message)
        }
      }).catch(payload.ecb)
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
