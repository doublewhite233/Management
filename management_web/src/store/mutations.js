import { SET_USER_STATE, CLEAR_USER_STATE, SET_ROUTES } from './mutation-types.js'

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
  [SET_ROUTES](state, payload) {
    state.routes = payload
  }
}
