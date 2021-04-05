import { request } from './request.js'

export function getSprintData(skip, state, project) {
  return request({
    url: '/sprint/data',
    method: 'post',
    data: { skip, state, project }
  })
}

export function createSprint(name, project) {
  return request({
    url: '/sprint/create',
    method: 'post',
    data: { name, project }
  })
}

export function deleteSprint(_id) {
  return request({
    url: '/sprint/delete',
    method: 'post',
    data: { _id }
  })
}

export function updateSprint(formData) {
  return request({
    url: '/sprint/update',
    method: 'post',
    data: { ...formData }
  })
}
