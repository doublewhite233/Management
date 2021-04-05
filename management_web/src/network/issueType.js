import { request } from './request.js'

export function getIssueType() {
  return request({
    url: '/issuetype/data'
  })
}

export function updateIssueType(type) {
  return request({
    url: '/issuetype/update',
    method: 'post',
    data: { type }
  })
}

export function deleteIssueType(_id) {
  return request({
    url: '/issuetype/delete',
    method: 'post',
    data: { _id }
  })
}
