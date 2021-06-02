import { request } from './request.js'

export function getUserData(query) {
  return request({
    url: '/user/data',
    params: { input: query }
  })
}

export function getAdminData(skip, sort, order, searchtext, department) {
  return request({
    url: '/user/admin',
    method: 'post',
    data: department === null ? { skip, sort, order, searchtext } : { skip, sort, order, searchtext, department }
  })
}

export function createUser(username, mail, password, role, department) {
  return request({
    url: '/user/create',
    method: 'post',
    data: { username, mail, password, role, department }
  })
}

export function updateUser(_id, data) {
  return request({
    url: '/user/update',
    method: 'post',
    data: { _id, data }
  })
}

export function deleteUser(_id) {
  return request({
    url: '/user/delete',
    method: 'post',
    data: { _id }
  })
}

export function getUserInfo(_id) {
  return request({
    url: '/user/info',
    method: 'post',
    data: { _id }
  })
}

export function chPass(_id, password) {
  return request({
    url: '/user/chpass',
    method: 'post',
    data: { _id, password }
  })
}

export function authGitHub(code, user_id) {
  return request({
    url: 'user/github_auth',
    params: { code, _id: user_id }
  })
}

export function unBind(_id, type) {
  return request({
    url: '/user/unbind',
    method: 'post',
    data: { _id, type }
  })
}
