<template>
  <div class="app-dialog" v-if="title">
    <div class="am-dialog-mask show"></div>
    <div class="am-dialog show">
      <div class="am-dialog-wrap">
        <div class="am-dialog-header am-dialog-single-header">
          <h3>{{title}}</h3>
        </div>
        <div class="am-dialog-body" v-if="brief">
          <p class="am-dialog-brief">{{brief}}</p>
        </div>
        <div class="am-dialog-footer">
          <button type="button" class="am-dialog-button" v-if="cancel" @click="lifted">取消</button>
          <button type="button" class="am-dialog-button" @click="sure">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'dialog',
    data () {
      return {
        title: null,
        brief: null,
        cancel: null,
        ok: null
      }
    },
    methods: {
      open (title, ok, brief = null, cancel = true) {
        if (title && typeof ok === 'function') {
          this.title = title
          this.ok = ok
          this.brief = brief
          this.cancel = cancel
        } else {
          console.error('参数错误')
        }
      },

      lifted () {
        this.title = ''
        if (typeof this.cancel === 'function') {
          this.cancel()
        }
      },
      sure () {
        this.title = ''
        this.ok()
      }
    }
  }
</script>
