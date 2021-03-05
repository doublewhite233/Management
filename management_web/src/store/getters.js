export default {
  user_id: state => state.user_info._id,
  username: state => state.user_info.username,
  role: state => state.user_info.role
}
