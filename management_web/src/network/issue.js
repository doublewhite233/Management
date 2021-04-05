import { request } from './request.js'

export function createIssue(data) {
  return request({
    url: '/issue/create',
    method: 'post',
    data: { data }
  })
}

export function getIssueData(project, sprint) {
  return request({
    url: '/issue/data',
    method: 'post',
    data: { project, sprint }
  })
}

export function moveIssueSprint(_id, sprint) {
  return request({
    url: '/issue/move',
    method: 'post',
    data: { _id, sprint }
  })
}
