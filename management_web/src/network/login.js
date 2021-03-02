import { request } from '@/network/request.js'

export function loginReq(mail, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { mail, password }
  })
}
