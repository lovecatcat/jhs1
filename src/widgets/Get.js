// get 参数
let $_GET = (function () {
  let url = window.document.location.href.split('?')
  if (url.length < 2) return {}
  let us = url[1].replace(/#(.)*$/, '') + (url.length === 3 ? '&' + url[2] : '')
  if (typeof us === 'string') {
    let u = us.split('&')
    let get = {}
    for (let i in u) {
      let j = u[i].split('=')
      get[j[0]] = j[1]
    }
    return get
  } else {
    return {}
  }
})()

export default $_GET
