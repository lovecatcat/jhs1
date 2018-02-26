<template>
  <div class="applicant">
    <div class="am-list am-list-6lb form">
      <div class="am-list-body" aria-labelledby="list-header-1">
        <div class="am-list-item">
          <div class="am-list-content" @click="addPlan"><i class="iconfont icon-tianjia"></i> 添加方案</div>
        </div>
      </div>
      <div class="form-header fn-clear">
        <span class="fn-left">投保人信息</span>
        <!--<span class="color-blank fn-right add-plan" @click="addPlan"><i class="iconfont icon-tianjia"></i> 添加被保人</span>-->
      </div>
      <div class="am-list-body" v-if="appl">
        <app-input label="姓名">
          <input slot="input"
                 type="text"
                 @change="checkName(appl.name, '投保人')"
                 placeholder="请填写投保人姓名"
                 v-model.lazy.trim="appl.name"
                 :disabled="pl_id !== '' && id === 1">
          <div slot="icon"
               class="am-list-clear"
               @click="appl.name = '' "
               v-show="appl.name != '' && pl_id === ''">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
        <app-input label="年龄">
          <input slot="input"
                 type="number"
                 placeholder="请填写投保人年龄"
                 v-model.number="appl.age"
                 @change="ageChanged"
                 :disabled="pl_id !== '' && id === 1">
          <div slot="icon" class="am-list-clear" v-show="appl.age != '' && pl_id === ''">
            <i class="am-icon-clear am-icon" @click="appl.age = '' "></i>
          </div>
          <label slot="button" class="app-date" for="appdate">
            <span class="icon"><i class="iconfont icon-rili"></i> 出生日期</span>
            <input class="input"
                   type="date"
                   id="appdate"
                   v-model="birthday"
                   @change="birthDayChanged"
                   :disabled="pl_id !== '' && id === 1">
          </label>
        </app-input>
        <app-input label="性别">
          <div class="am-ft-left" slot="input">
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="true" v-model="appl.sex" :disabled="pl_id !== '' && id === 1">
                <span class="icon-check" aria-hidden="true" style="top: -0.08rem"></span>
              </div>
              <span>男</span>
            </label>
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="false" v-model="appl.sex" :disabled="pl_id !== '' && id === 1">
                <span class="icon-check" aria-hidden="true" style="top: -0.08rem;"></span>
              </div>
              <span>女</span>
            </label>
          </div>
        </app-input>
      </div>
    </div>
  </div>
</template>
<script>
  /**
   * 投保人
   * @vue
   */
  import utils from '../widgets/utils'

  import {
    mapState
  } from 'vuex'

  export default {
    name: 'applicant',
    props: {
      id: Number,
      edit: Object
    },
    data () {
      return {
        appl: null,
        birthday: ''
      }
    },
    computed: {
      ...mapState([
        'pl_id',
        'plans'
      ])
    },
    watch: {
      appl: {
        handler (val) {
          console.log(this.id)
          this.$store.commit('SET_APPL', {
            id: this.id,
            appl: val
          })
        },
        deep: true
      },
      edit: {
        handler (val) {
          if (this.plans.length === this.id) {
            this.appl.name = val.name
            this.appl.age = val.age
            this.appl.sex = val.sex
          }
        },
        deep: true
      }
    },
    methods: {
      ageChanged () {
        if (this.appl.age < 18) {
          this.$toast.open('投保人年龄不能小于18周岁')
        }
      },
      birthDayChanged () {
        let age = utils.getAge(this.birthday)
        if (age < 18) {
          this.$toast.open('投保人年龄不能小于18周岁')
        }
        this.appl.age = age
      },
      addPlan () {
        this.$store.commit('ADD_PLAN')
      }
    },
    created () {
      if (this.$store.state.pl_id && this.edit.name) {
        this.appl = Object.assign({}, this.edit)
      } else if (this.id !== 1) {
        this.appl = Object.assign({}, this.plans[0].appl)
      } else {
        this.appl = {
          name: '',
          sex: true,
          age: ''
        }
      }
    }
  }
</script>
