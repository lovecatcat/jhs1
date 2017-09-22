import env from './env'
import axios from 'axios'

axios.defaults.baseURL = env.url

export default {
  getAge (birthday) {
    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()
    let r = birthday.split('-').map(item => parseInt(item))
    let age = year - r[0]
    if (r[1] > month || (r[1] === month && r[2] > day)) { // 当月
      age -= 1
    }
    return age
  },
  // 去重
  unique (a, key) {
    let res = []
    let len = (a && a.length) || 0
    if (!len) return res
    let jLen
    for (let i = 0; i < len; i++) {
      jLen = res.length
      let j
      for (j = 0; j < jLen; j++) {
        if (res[j][key] === a[i][key]) {
          break
        }
      }
      if (j === jLen) {
        res.push(a[i])
      }
    }
    return res
  },
  parseVueObj (Obj) {
    return JSON.parse(JSON.stringify(Obj))
  },
  checkName (name, owner) {
    let toastText = false
    if (!name) {
      toastText = owner + '姓名不能为空'
    } else if (name.length > 20) {
      toastText = owner + '姓名长度不能超过20位'
    } else if (/[a-z]/i.test(name)) { // 英文
      if (name.replace(/\s/, '').length < 3) {
        toastText = owner + '姓名不小于3个字符'
      } else if (!/^[a-z]+[a-z\s]*[a-z]+$/i.test(name) || /(\s)\1/.test(name)) {
        toastText = owner + '姓名填写有误'
      }
    } else if (/[\u4e00-\u9fa5·]/i.test(name)) { // 中文
      if (name.length < 2) {
        toastText = owner + '姓名不小于2个汉字'
      } else if (!/^[\u4e00-\u9fa5]+[\u4e00-\u9fa5·]*[\u4e00-\u9fa5]+$/i.test(name) || /(·)\1/.test(name)) {
        toastText = owner + '姓名填写有误'
      }
    } else if (!/^[a-z]+[\sa-z]*[a-z]+$/i.test(name) && !/^[\u4e00-\u9fa5]+[\u4e00-\u9fa5·]*[\u4e00-\u9fa5]+$/i.test(name)) { // 中英文
      toastText = owner + '姓名填写有误'
    }
    return toastText
  },
  post (url, data) {
    return axios.post(url, data)
  },
  get (url) {
    return axios.get(url)
  },
  parsePlan (Obj) {
    let {
      applicant,
      appl_sex: applSex,
      appl_age: applAge,
      assured,
      assu_sex: assuSex,
      assu_age: assuAge,
      safe_year: safeYear,
      pay_year,
      base_money,
      year_fee,
      genre,
      flag
    } = Obj
    return {
      appl: {
        name: applicant,
        sex: applSex === 1,
        age: applAge
      },
      assu: {
        name: assured,
        sex: assuSex === 1,
        age: assuAge
      },
      ins: {
        safe_id: genre,
        safe_year: (safeYear === 0 ? 999 : safeYear),
        pay_year,
        base_money,
        year_fee,
        flag
      }
    }
  },
  parseChildPlan (Obj) {
    if (!Obj) return {}
    let data = []
    for (let i in Obj) {
      data.push({
        safe_id: i,
        flag: Obj[i].flag
      })
    }
    return data
  },
  getCompanyId (Obj, safeId) {
    let insInfo = ''
    for (let i in Obj) {
      let item = Obj[i]
      item.forEach(content => {
        if (content.safe_id === safeId) {
          insInfo = content
        }
      })
    }
    return insInfo
  }
}
