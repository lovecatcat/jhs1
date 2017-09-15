<template>
  <div class="am-toast text" v-if="text || type">
    <div class="am-toast-text">
      <span v-if="type" class="am-icon toast" aria-hidden="true" :class="type"></span>
      {{text}}
    </div>
  </div>
</template>
<script>
  export default {
    name: 'toast',
    data () {
      return {
        text: null,
        type: null,
        timer: null
      }
    },
    methods: {
      open (text, type, cb = function () {}, time = 3000) {
        this.timer && window.clearTimeout(this.timer) // 清除定时器
        if (text || type) {
          this.text = text
          this.type = type
          console.log(text)

          this.timer = window.setTimeout(() => {
            this.text = ''
            this.type = ''
            cb && cb()
          }, time)
        }
      },
      loading (text) {
        this.text = text
        this.type = 'loading'
      },
      close () {
        this.timer && window.clearTimeout(this.timer)
        this.isShow = false
      }
    }
  }
</script>
