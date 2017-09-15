import Vue from 'vue'

const AppInput = {
  props: {
    label: String,
    right: Boolean,
    color: Boolean
  },
  template: `
  <div class="am-list-item">
    <div class="am-list-label" :class="{tar:right,'main-color': color}">{{label}}</div>
    <div class="am-list-control">
      <slot name="input"></slot>
    </div>
    <slot name="icon"></slot>
    <slot name="button"></slot>
  </div>
  `
}

const AppSelect = {
  props: {
    label: String,
    readonly: Boolean
  },
  template: `
  <div class="am-list-item dropdown">
    <div class="am-list-dropdown-main">
      <div class="am-list-label">{{label}}</div>
      <div class="am-list-control">
        <slot></slot>
      </div>
      <div v-if="!readonly" class="am-list-arrow"><span class="am-icon arrow vertical"></span></div>
    </div>
  </div>
  `
}

const AppDropdown = {
  props: {
    label: String,
    up: {
      type: Boolean,
      default: true
    },
    isform: {
      type: Boolean,
      default: true
    },
    func: Function
  },
  template: `
  <div class="am-list" :class="{'am-list-6lb': isform, 'form': isform}">
    <div class="am-list-item dropdown" :class="{up:isup}">
      <div class="form-header fn-clear form-header__dropdown" @click="toggle" v-if="label">
        <span class="fn-left">{{label}}</span>
        <span class="arrow-icon" :class="{active:isup}"></span>
      </div>
      <div class="am-list-dropdown-main" v-else>
        <slot name="header"></slot>
      </div>
      <div class="am-list-dropdown-list">
        <slot></slot>
      </div>
    </div>
  </div>
  `,
  data () {
    return {
      isup: ''
    }
  },
  created () {
    this.isup = this.up
  },
  methods: {
    toggle () {
      this.isup = !this.isup
      this.func && this.func()
    }
  }
}

Vue.component('app-input', AppInput)
Vue.component('app-select', AppSelect)
Vue.component('app-dropdown', AppDropdown)
