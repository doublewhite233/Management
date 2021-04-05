import { request } from './request.js'

export function logHistory(issue, user, type, value) {
  return request({
    url: '/history/log',
    method: 'post',
    data: { issue, user, type, value }
  })
}
