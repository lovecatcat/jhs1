import ToastComponent from './Toast.vue'

export default function install (Vue) {
  let Toast = Vue.extend(ToastComponent)
  let div = document.createElement('div')
  let el = document.body.appendChild(div)
  Vue.prototype.$toast = new Toast().$mount(el)
}
