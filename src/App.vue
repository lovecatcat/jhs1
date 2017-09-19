<template>
  <div id="app">

    <div class="am-tab">
      <a href="javascript:;" class="am-tab-item"
         v-if="!pl_id"
         :class="{selected:activePlan===index}"
         @click="$store.commit('CHG_PLAN',index)"
         v-for="plan,index in plans" :key="index">
        方案{{index + 1}}
      </a>
      <a href="javascript:;" class="am-tab-item"
         v-if="pl_id"
         :class="{selected:activePlan===index}"
         @click="$store.commit('CHG_PLAN',index)"
         v-for="plan,index in plansData" :key="index">
        方案{{index + 1}}
      </a>
    </div>

    <applicant :edit="applData"></applicant>

    <div class="plan" v-show="index === activePlan" v-for="plan,index in plans" :key="index" v-if="!pl_id">
      <assured :ref="'assu_' + index"></assured>
      <insurance :ref="'ins_' + index" v-for="ins,i in plan.ins" :key="i" :index="i"></insurance>

      <div class="am-button-group" v-show="saveStatus[index] !== true">
        <button type="button" class="am-button add" @click="addIns">
          <i class="iconfont icon-tianjia"></i> 添加险种
        </button>
        <button type="button" class="am-button add" @click="savePlan">
          <i class="iconfont icon-baocun"></i> 保存方案 {{index + 1}}
        </button>
      </div>
    </div>

    <div class="plan" v-show="index === activePlan" v-for="plan,index in plansData" :key="index" v-else>
      <assured :ref="'assu_' + index" :edit="plan.assu"></assured>
      <insurance :ref="'ins_' + index" :edit="ins" v-for="ins,i in plan.ins" :key="i" :index="i"></insurance>

      <div class="am-button-group" v-show="saveStatus[index] !== true">
        <button type="button" class="am-button add" @click="addIns">
          <i class="iconfont icon-tianjia"></i> 添加险种
        </button>
        <button type="button" class="am-button add" @click="savePlan">
          <i class="iconfont icon-baocun"></i> 保存 方案{{index + 1}}
        </button>
      </div>
    </div>

    <div class="am-button-group">
      <button type="button" class="am-button created" @click="pushPlan">
        生成计划书
      </button>
    </div>

  </div>
</template>

<script>
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
    computed: {
      ...mapState([
        'appl',
        'plans',
        'applData',
        'plansData',
        'pl_id',
        'admin_id',
        'activePlan',
        'saveStatus'
      ])
    },
    methods: {
      addIns () {
        console.info('addIns')
        this.$store.commit('ADD_INS')
      },
      savePlan () {
        console.info('savePlan')
        let crtIns = this.$refs['ins_' + this.activePlan]
        for (let i in crtIns) {
          let item = crtIns[i]
          // TODO 校验所有险种 填写完整
          // 主险费用
          if (!item.checkMainFee(item.insurance.safe_id)) {
            return
          }
          if (item.showAll === true) { // 收缩险种信息
            item.$refs.dropdown.toggle()
          }
          item.saveIns()
        }
        this.$store.commit('CHG_PLAN_STATUS', true)
        this.$forceUpdate()
      },
      pushPlan () {
        console.info('pushPlan')
        for (let s = 0; s < this.saveStatus.length; s++) {
          if (this.saveStatus[s] === false) {
            this.$toast.open('请保存 方案' + (s + 1))
            return false
          }
        }

        let data = []
        for (let i in this.plans) {
          let planIns = this.plans[i].ins
          for (let j in planIns) {
            let item = planIns[j]
            data.push(item.main)
            for (let k in item.addon) {
              data.push(item.addon[k])
            }
          }
        }
        this.log(data)
        utils.post('Prospectus/CreateBook4', qs.stringify({
          safes: JSON.stringify(data)
        })).then(ret => {
          ret = ret.data
          console.log(ret)
          let url = ''
          let plId = []
          let parentId = []
          let prospectusType = []
          for (let i = 0; i < ret.data.length; i++) {
            let j
            let type
            let parent

            for (j in ret.data[i]) {
              console.log(j)
              if (ret.status && ret.data[i].hasOwnProperty(j) === true && !isNaN(j)) {
                type = ret.data[i][j].type
                parent = j
              }
            }
            plId.push(ret.data[i].pl_id)
            prospectusType.push(type)
            parentId.push(parent)
          }
          url += 'admin_id=' + this.admin_id + '&pl_id=' + plId + '&parent_id=' + parentId + '&prospectus_type=' + prospectusType + '/'
          url = '/wechat/prospectus_group?' + url + '/' + this.appl.name + '/' + (this.appl.sex === true ? 1 : 2)
          console.log(url)
          location.href = url
        }).catch(this.errorCb)
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
              console.log(2)
              this.$forceUpdate()
            },
            ecb: this.errorCb
          })
        }
      })
      if (!this.pl_id) {
        this.$store.commit('SET_PARAM', {
          plans: [{
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
