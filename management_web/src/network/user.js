import { request } from './request.js'

export function getUserData(query) {
  return request({
    url: '/user/data',
    params: { input: query }
  })
}
