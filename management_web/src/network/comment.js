import { request } from './request.js'

export function getComment(_id) {
  return request({
    url: '/comment/commentinfo',
    method: 'post',
    data: { _id }
  })
}

export function createComment(project, issue, user, comment) {
  return request({
    url: '/comment/create',
    method: 'post',
    data: { project, issue, user, comment }
  })
}

export function deleteComment(_id) {
  return request({
    url: '/comment/delete',
    method: 'post',
    data: { _id }
  })
}
