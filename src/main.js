import Vue from 'vue'
import App from './App'

import store from './store'

import './assets/css/antui-all.css'
import './assets/fonts/iconfont.css'
import './assets/css/app.less'

// 组件
import './widgets/Components'

// 插件
import utils from './widgets/utils'

import Toast from './widgets/Toast'

Vue.use(Toast)

import Dialog from './widgets/Dialog'

Vue.use(Dialog)

Vue.config.productionTip = false

// 混合
Vue.mixin({
  methods: {
    errorCb (error) { // 网络错误
      this.log(error)
      if (typeof error === 'string') {
        this.$toast.open(error, 'error')
      } else if (error.name && error.name.indexOf('Error') > -1) {
        this.$toast.open('网络出现错误', 'error')
      }
    },
    log () {
      for (let i in arguments) {
        let msg = arguments[i]
        console.log(msg)
        if (typeof msg !== 'string') {
          msg = JSON.stringify(msg)
        }
        console.log(msg)
      }
    },
    checkName (name, owner = '') {
      let toastText = utils.checkName(name, owner)
      if (toastText) {
        this.$toast.open(toastText)
        return false
      }
      return true
    }
  }
})

// 过滤器
Vue.filter('safeYearFilter', function (value) {
  if (value > 50 && value !== '999' && value !== 999) {
    return `至${value}岁`
  } else if (value < 50 && value > 0) {
    return `${value}年`
  } else {
    return '终身'
  }
})
Vue.filter('payYearFilter', function (value) {
  if (value === '1') {
    return '趸交'
  } else if (value < 60) {
    return `${value}年交`
  } else {
    return `至${value}岁`
  }
})
Vue.filter('moneyFilter', function (value) {
  return value.toFixed(2)
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: {App}
})
