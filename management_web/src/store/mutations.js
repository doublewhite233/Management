import { SET_USER_STATE } from './mutation-types.js'

export default {
  [SET_USER_STATE](state, payload) {
    state.user_info._id = payload._id
    state.user_info.username = payload.username
    state.user_info.role = payload.role
  }
}
