import { request } from './request.js'

export function logHistory(project, issue, user, type, value) {
  return request({
    url: '/history/log',
    method: 'post',
    data: { project, issue, user, type, value }
  })
}

export function getHistory(_id) {
  return request({
    url: '/history/historyinfo',
    method: 'post',
    data: { _id }
  })
}

export function deleteHistory(_id) {
  return request({
    url: '/history/delete',
    method: 'post',
    data: { _id }
  })
}

export function getMyHistory() {
  return request({
    url: '/history/mywork'
  })
}
