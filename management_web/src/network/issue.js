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

export function getMyData(_id) {
  return request({
    url: '/issue/mywork',
    method: 'post',
    data: { _id }
  })
}

export function getDetailData(_id) {
  return request({
    url: '/issue/detail',
    method: 'post',
    data: { _id }
  })
}

export function getDetailDataByType(_id) {
  return request({
    url: '/issue/detailbytype',
    method: 'post',
    data: { _id }
  })
}

export function getBurnDown(_id) {
  return request({
    url: '/issue/burndown',
    method: 'post',
    data: { _id }
  })
}

export function getBurnUp(_id) {
  return request({
    url: '/issue/burnup',
    method: 'post',
    data: { _id }
  })
}

export function getNewDaily(_id) {
  return request({
    url: '/issue/newdaily',
    method: 'post',
    data: { _id }
  })
}

export function getAllIssue(data) {
  return request({
    url: '/issue/all',
    method: 'post',
    data: { ...data }
  })
}
