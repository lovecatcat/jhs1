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
      <assured></assured>
      <insurance v-for="ins,i in plan.ins" :key="i" :index="i"></insurance>
    </div>

    <div class="plan" v-show="index === activePlan" v-for="plan,index in plansData" :key="index" v-else>
      <assured :edit="plan.assu"></assured>
      <insurance :edit="ins" v-for="ins,i in plan.ins" :key="i" :index="i"></insurance>
    </div>

    <div class="am-button-group">
      <button type="button" class="am-button add" @click="addIns">
        <i class="iconfont icon-tianjia"></i> 添加险种
      </button>
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
        'plans',
        'applData',
        'plansData',
        'pl_id',
        'admin_id',
        'activePlan'
      ])
    },
    methods: {
      addIns () {
        console.info('addIns')
        this.$store.commit('ADD_INS')
      },
      pushPlan () {
        console.info('pushPlan')
        let data = []
        for (let i in this.plans) {
          let planIns = this.plans[i].ins
          for (let j in planIns) {
            let item = planIns[j]
            data.push(item.main)
            item.addon && data.concat(...item.addon)
          }
        }
        console.log(JSON.stringify(data))
        utils.post('Prospectus/CreateBook4', qs.stringify({
          safes: JSON.stringify(data)
        })).then(ret => {
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
            cb: this.errorCb
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
