import { SET_USER_STATE, CLEAR_USER_STATE, SET_ROUTES, SET_PROJECT_INFO, CLEAR_PROJECT_INFO, SET_LOADING_STATE } from './mutation-types.js'

export default {
  [SET_USER_STATE](state, payload) {
    state.user_info._id = payload._id
    state.user_info.username = payload.username
    state.user_info.role = payload.role
  },
  [CLEAR_USER_STATE](state, payload) {
    state.user_info = { _id: '', username: '', role: '' }
    state.routes = []
  },
  [SET_PROJECT_INFO](state, payload) {
    state.project_info._id = payload._id
    state.project_info.name = payload.name
  },
  [CLEAR_PROJECT_INFO](state, payload) {
    state.project_info._id = ''
    state.project_info.name = ''
  },
  [SET_LOADING_STATE](state, payload) {
    state.loading = payload
  },
  [SET_ROUTES](state, payload) {
    state.routes = payload
  }
}
