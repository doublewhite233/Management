import { request } from './request.js'

export function createIssue(data) {
  return request({
    url: '/issue/create',
    method: 'post',
    data: { data }
  })
}

export function getIssueData(project, sprint = null, user = null) {
  return request({
    url: '/issue/data',
    method: 'post',
    data: { project, sprint, user }
  })
}

export function getIssueDataByID(_id) {
  return request({
    url: '/issue/databyid',
    method: 'post',
    data: { _id }
  })
}

export function moveIssueSprint(_id, sprint) {
  return request({
    url: '/issue/move',
    method: 'post',
    data: { _id, sprint }
  })
}

export function updateIssue(_id, data) {
  return request({
    url: '/issue/update',
    method: 'post',
    data: { _id, data }
  })
}

export function deleteIssue(_id) {
  return request({
    url: '/issue/delete',
    method: 'post',
    data: { _id }
  })
}
