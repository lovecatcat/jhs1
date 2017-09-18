<template>
  <div class="assured">
    <div class="am-list am-list-6lb form">
      <div class="form-header">
        <span class="fn-left">被投保人信息</span>
        <span class="fn-right color-blank" @click="keepSame">同投保人</span>
      </div>
      <div class="am-list-body" v-if="assu">
        <app-input label="姓名">
          <input slot="input" type="text" placeholder="请填写被投保人姓名" v-model.lazy.trim="assu.name">
          <div slot="icon" class="am-list-clear" @click="assu.name = ''" v-show="assu.name != '' "><i
            class="am-icon-clear am-icon"></i></div>
        </app-input>
        <app-input label="年龄">
          <input slot="input" type="number" placeholder="请填写被投保人年龄" v-model.number.lazy="assu.age"
                 @change="ageChanged">
          <div slot="icon" class="am-list-clear" @click="assu.age = '' " v-show="assu.age != '' "><i
            class="am-icon-clear am-icon"></i></div>
          <div slot="button" class="app-date">
            <span class="icon"><i class="iconfont icon-rili"></i> 出生日期</span>
            <input class="input" type="date" v-model="birthday" @change="birthDayChagned">
          </div>
        </app-input>
        <app-input label="性别">
          <div class="am-ft-left" slot="input">
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="true" v-model="assu.sex">
                <span class="icon-check" aria-hidden="true" style="top: -0.08rem"></span>
              </div>
              <span>男</span>
            </label>
            <label class="radio sex-radio">
              <div class="am-checkbox">
                <input type="radio" :value="false" v-model="assu.sex">
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
  import utils from '../widgets/utils'

  export default {
    name: 'assured',
    props: {
      'edit': Object
    },
    data () {
      return {
        assu: {
          name: 'qaz',
          sex: true,
          age: '24'
        },
        birthday: ''
      }
    },
    watch: {
      assu: {
        handler (val) {
          this.$store.commit('SET_ASSU', val)
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
        if (this.assu.age < 1) {
          this.$toast.open('被投保人年龄不能小于0周岁')
        }
      },
      birthDayChagned () {
        let age = utils.getAge(this.birthday)
        if (age < 1) {
          this.$toast.open('被投保人年龄不能小于0周岁')
        }
        this.assu.age = age
      }
    },
    created () {
      if (this.edit) {
        let assu = Object.assign({}, this.assu)
        assu.sex = assu.sex === 1 || assu.sex === true
        this.assu = assu
      }
    }
  }
</script>
