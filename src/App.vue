<template>
  <div id="app">

    <div class="am-tab am-fixed am-fixed-top" style="overflow-x: auto;">
      <a href="javascript:;" style="border-right: solid 1px #eee;min-width: 100px;" class="am-tab-item"
         :class="{selected:activePlan===plan.id}"
         @click="$store.commit('CHG_PLAN', plan.id)"
         v-for="plan,index in plans" :key="plan.id">
        <span v-if="!plans[index].assu.name">保障计划</span>
        {{plans[index].assu.name}}
      </a>
    </div>
    <div style="width:100%;height:auto;position:absolute;top:.42rem;bottom:.47rem;overflow-y:scroll;">
      <div class="am-list am-list-6lb form">
        <app-input label="计划名称">
          <input slot="input"
                 type="text"
                 placeholder="请填写计划名称"
                 v-model.lazy.trim="alias">
          <div slot="icon"
               class="am-list-clear"
               @click="alias = '' "
               v-show="alias != '' ">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
      </div>

      <applicant :edit="applData"></applicant>
      
      <div class="plan" v-show="plan.id === activePlan" v-for="plan,index in plans" :key="plan.id">
        <assured
          :ref="'assu_' + plan.id"
          :id="plan.id"
          :edit="plan.assu"/>
        <insurance
          :ref="'ins_' + plan.id"
          :edit="ins"
          v-for="ins,i in plan.ins"
          v-if="ins"
          :key="i"
          :id="plan.id"
          :insIndex="i"/>
        
        <div class="am-button-group" v-show="saveStatus[plan.id] !== true">
          <button type="button" class="am-button add" @click="addIns">
            <i class="iconfont icon-tianjia"></i> 添加险种
          </button>
        </div>
        <div class="am-button-group" v-show="saveStatus[plan.id] !== true">
         <!--  <button type="button" class="am-button add" @click="addIns">
            <i class="iconfont icon-tianjia"></i> 添加险种
          </button> -->
          <button type="button" class="am-button remove" @click="removePlan(index)">
            <i class="am-icon-clear am-icon"></i> 删除方案{{index + 1}}
          </button>
          <button type="button" class="am-button save" @click="savePlan" style="background-color: #fff;color: #707dfe;">
            <i class="iconfont icon-baocun"></i> 保存方案{{index + 1}}
          </button>
        </div>
      </div>

    </div>

    <div class=" am-flexbox" style="background-color:#fff;border-top: 1px solid #eee;position: absolute;bottom: 0;width:100%">
      <div class="am-flexbox-item">
        <span style="padding-left: .15rem;">首期保费: <span class="color-red">￥{{count}}元</span></span>
      </div>
      <button type="button" class="am-button created" @click="pushPlan" style="width: 150px">
        生成计划书
      </button>
    </div>

  </div>
</template>

<script>
  /**
   * 方案
   * @vue
   */
  import Applicant from './components/Applicant'
  import Assured from './components/Assured'
  import Insurance from './components/Insurance'

  import qs from 'qs'
  import utils from './widgets/utils'

  import {
    mapState
  } from 'vuex'

  export default {
    name: 'app',
    components: {
      Applicant,
      Assured,
      Insurance
    },
    data () {
      return {
        alias: '',
        count: 0
      }
    },
    computed: {
      ...mapState([
        'appl',
        'plans',
        'plansFalse',
        'applData',
        'pl_id',
        'parent_pl_id',
        'admin_id',
        'activePlan',
        'saveStatus'
      ])
    },
    methods: {
      countMoney () {
        let count = 0
        for (let p in this.plans) {
          let crtIns = this.$refs['ins_' + this.plans[p].id]
          for (let i in crtIns) {
            let item = crtIns[i]
            if (!item.showAll) {
              count += item.insurance.period_money
              for (let j in item.addonsSelected) {
                if (item.addonsSelected[j] && item.addonRes[j]) {
                  let pm = item.addonRes[j]['年缴保费'] || item.addonRes[j]['年缴保费(元)']
                  if (pm) {
                    count += pm
                  }
                }
              }
            }
          }
        }
        this.count = count.toFixed(2)
      },
      addIns () {
        console.info('addIns')
        this.$store.commit('ADD_INS')
      },
      removePlan (index) {
        if (this.plans.length < 2) {
          this.$toast.open('只剩一个方案，不能删除')
          return false
        }
        this.$dialog.open('确认删除【方案' + (index + 1) + '】吗？', () => {
          this.$store.commit('RMV_PLAN', index)
        })
      },
      savePlan () {
        console.info('savePlan')
        let crtIns = this.$refs['ins_' + this.activePlan]
        for (let i in crtIns) {
          let item = crtIns[i]
          // 主险费用
          if (!item.checkIns(item.insurance.safe_id)) {
            return false
          }
          if (item.showAll === true) { // 收缩险种信息
            item.toggle()
          }
          item.saveIns()
        }
        this.$store.commit('CHG_PLAN_STATUS', true)
        this.$forceUpdate()
        this.countMoney()
      },
      pushPlan () {
        console.info('pushPlan')

        let data = []
        for (let i = 0; i < this.plans.length; i++) {
          let id = this.plans[i].id
          if (!this.saveStatus[id]) {
            this.$toast.open('请保存 方案' + (Number(i) + 1))
            return false
          }
          let planIns = this.plans[i].ins
          // console.log(planIns)
          for (let j = 0; j < planIns.length; j++) {
            if (!planIns[j]) continue
            let item = utils.parseVueObj(planIns[j])
            item.main.alias = this.alias
            item.main.is_save = 1
            item.main.warranty_year = 105
            item.main.need_packet = 1
            if (this.pl_id) {
              item.main.check = 0
            }
            data.push(item.main)
            for (let k in item.addon) {
              if (!item.addon[k]) continue
              item.addon[k].is_save = 1
              item.addon[k].warranty_year = 105
              item.addon[k].need_packet = 1
              if (this.pl_id) {
                item.addon[k].check = 0
                item.addon[k].flag = item.addon[k].flag ? item.addon[k].flag : 0
              }
              data.push(item.addon[k])
            }
          }
        }
        this.log(data)
        if (this.pl_id && this.plansFalse) { // 编辑接口
          let baseUrl = 'http://ts-open.ehuimeng.com/api/index/invoke'
          utils.post(baseUrl, qs.stringify({
            module: 'Prospectus',
            method: 'edit',
            params: JSON.stringify({
              pl_id: this.pl_id,
              safes: JSON.stringify(data)
            })
          })).then(ret => {
            ret = ret.data
            if (ret.data.length > 0) {  // 如果是子pl_id就跳转到父级
              let plId = this.parent_pl_id ? this.parent_pl_id : ret.data[0].pl_id
              let url = '/wechat/prospectus-group?param=' + JSON.stringify({
                admin_id: this.admin_id,
                pl_id: plId
              })
              console.log(url)
              location.href = url
            }
          }).catch(this.errorCb)
        } else {
          utils.post('Prospectus/CreateBook4', qs.stringify({
            safes: JSON.stringify(data)
          })).then(ret => {
            ret = ret.data
            if (ret.data.length > 0) {
              let plId = ret.data[0].pl_id
              let url = '/wechat/prospectus-group?param=' + JSON.stringify({
                admin_id: this.admin_id,
                pl_id: plId
              })
              console.log(url)
              location.href = url
            }
          }).catch(this.errorCb)
        }
      }
    },
    created () {
      // 获取险种列表
      this.$store.dispatch('SET_INSLIST', {
        admin_id: this.admin_id,
        ecb: this.errorCb,
        scb: () => {
          // 获取编辑计划书信息
          this.pl_id && this.$store.dispatch('SET_PLANS', {
            admin_id: this.admin_id,
            pl_id: this.pl_id,
            scb: () => {
              this.$forceUpdate()
            },
            ecb: this.errorCb
          })
        }
      })
      if (!this.pl_id) {
        this.$store.commit('SET_PARAM', {
          plans: [{
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
        })
      }
    }
  }
</script>
