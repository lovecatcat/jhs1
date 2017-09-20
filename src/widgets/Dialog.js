import DialogComponent from './Dialog.vue'

export default function install (Vue) {
  let Dialog = Vue.extend(DialogComponent)
  let div = document.createElement('div')
  let el = document.body.appendChild(div)
  Vue.prototype.$dialog = new Dialog().$mount(el)
}
