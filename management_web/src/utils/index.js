export function formatDate(dateData, fmt) {
  const date = new Date(dateData)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

// input 1d 1h get 9(h)
// change (if 1d = 8h, change = 8)
export function formatLogtoHour(input, change) {
  // 去除空格
  let total = 0
  input = input.replace(/\s/g, '')
  const regex = /\d+(h|d|w)/g
  const match = input.match(regex)
  match.forEach(item => {
    const num = item.match(/\d+/)[0]
    const unit = item.match(/(h|d|w)/)[0]
    if (unit === 'w') {
      total = total + Number(num) * change * 5
    } else if (unit === 'd') {
      total = total + Number(num) * change
    } else {
      total = total + Number(num)
    }
  })
  return total
}

// input 9 get { d: 1, h: 1 }
export function formatHourtoLog(input, change) {
  const res = {}
  const w = Math.floor(input / (change * 5))
  const d = Math.floor(input % (change * 5) / change)
  const h = input % change
  if (w > 0) res.w = w
  if (d > 0) res.d = d
  if (h > 0) res.h = h
  return res
}
