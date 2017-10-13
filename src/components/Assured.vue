<template>
  <div class="assured">
    <div class="am-list am-list-6lb form">
      <div class="form-header">
        <span class="fn-left">被保人信息{{id}}</span>
        <span class="fn-right color-blank" @click="pl_id !== '' && id === 1 && keepSame"><input type="radio">同投保人</span>
      </div>
      <div class="am-list-body" v-if="assu">
        <app-input label="姓名">
          <input slot="input"
                 type="text"
                 @change="checkName(assu.name, '被保人')"
                 placeholder="请填写被保人姓名"
                 v-model.lazy.trim="assu.name"
                 :disabled="pl_id !== '' && id === 1">
          <div slot="icon"
               class="am-list-clear"
               @click="assu.name = ''"
               v-show="assu.name != '' && id !== 1 || assu.name != '' && pl_id === ''">
            <i class="am-icon-clear am-icon"></i>
          </div>
        </app-input>
        <app-input label="年龄">
          <input slot="input" type="number" placeholder="请填写被保人年龄" v-model.number.lazy="assu.age"
                 @change="ageChanged" 
                 :disabled="pl_id !== '' && id === 1">
          <div slot="icon" class="am-list-clear" @click="assu.age = '' "
               v-show="assu.name != '' && id !== 1 || assu.name != '' && pl_id === ''">
               <i class="am-icon-clear am-icon"></i></div>
          <div slot="button" class="app-date">
            <span class="icon"><i class="iconfont icon-rili"></i> 出生日期</span>
            <input class="input" type="date" v-model="birthday" @change="birthDayChagned" :disabled="pl_id !== '' && id === 1">
          </div>
        </app-input>
        <app-input label="性别">
          <div class="am-ft-left" slot="input">
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="true" v-model="assu.sex" :disabled="pl_id !== '' && id === 1">
                <span class="icon-check" aria-hidden="true" style="top: -0.08rem"></span>
              </div>
              <span>男</span>
            </label>
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="false" v-model="assu.sex" :disabled="pl_id !== '' && id === 1">
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
   * 被保人
   * @vue
   */
  import utils from '../widgets/utils'
  import {
    mapState
  } from 'vuex'

  export default {
    name: 'assured',
    props: {
      id: Number,
      edit: Object
    },
    data () {
      return {
        assu: null,
        assuchange: false,
        birthday: ''
      }
    },
    computed: {
      ...mapState([
        'pl_id'
      ])
    },
    watch: {
      assu: {
        handler (val) {
          this.$store.commit('SET_ASSU', {
            id: this.id,
            assu: val
          })
        },
        deep: true
      }
    },
    methods: {
      keepSame () {
        let appl = this.$store.state.appl
        this.assu = Object.assign({}, this.assu, utils.parseVueObj(appl))
      },
      ageChanged () {
        if (this.assu.age < 0) {
          this.$toast.open('被投保人年龄不能小于0周岁')
        }
      },
      birthDayChagned () {
        let age = utils.getAge(this.birthday)
        if (age < 0) {
          this.$toast.open('被投保人年龄不能小于0周岁')
        }
        this.assu.age = age
      }
    },
    created () {
      if (this.$store.state.pl_id && this.edit.name) {
        this.assu = Object.assign({}, this.edit)
      } else {
        this.assu = {
          name: '',
          sex: true,
          age: ''
        }
      }
    }
  }
</script>
