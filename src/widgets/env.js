let env = 'prod'
let url = '//cloud.ehuimeng.com'
if (location.port === '8088') {
  env = 'local'
  url = '/api'
} else if (/^ts-/.test(location.host)) {
  env = 'test'
  url = '//ts-cloud.ehuimeng.com'
}
export default {
  env,
  url
}
