import { request } from './request.js'

export function getProjectData(skip, sort, order, searchcol, searchtext) {
  return request({
    url: '/project/data',
    params: { skip, sort, order, searchcol, searchtext }
  })
}

export function createProject(name, desc, tag, leader) {
  return request({
    url: '/project/create',
    method: 'post',
    data: { name, desc, tag, leader }
  })
}

export function deleteProject(_id) {
  return request({
    url: '/project/delete',
    method: 'post',
    data: { _id }
  })
}

export function updateProject(formData) {
  return request({
    url: '/project/update',
    method: 'post',
    data: { ...formData }
  })
}

export function getTagList() {
  return request({
    url: '/project/gettag'
  })
}

export function getProjectList(query) {
  return request({
    url: '/project/projectlist',
    params: { input: query }
  })
}

export function getProjectDetail(id) {
  return request({
    url: '/project/databyid',
    method: 'post',
    data: { id }
  })
}
