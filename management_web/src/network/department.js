import { request } from './request.js'

export function getDepartment(_id) {
  return request({
    url: '/department/info',
    method: 'post',
    data: { _id }
  })
}

export function createDepartment(data) {
  return request({
    url: '/department/create',
    method: 'post',
    data: { data }
  })
}

export function updateDepartment(_id, data) {
  return request({
    url: '/department/update',
    method: 'post',
    data: { _id, data }
  })
}

export function deleteDepartment(_id) {
  return request({
    url: '/department/delete',
    method: 'post',
    data: { _id }
  })
}
