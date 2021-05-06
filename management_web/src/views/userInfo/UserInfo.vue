<template>
  <div>
    <div class="top-banner" />
    <div class="avatar-box">
      <img src="https://z3.ax1x.com/2021/05/02/geibiF.jpg" alt="" class="avatar">
    </div>
    <div class="username-box"><h2>{{ `你好， ${userInfo.username} ！` }}</h2></div>
    <div class="info-box">
      <h4 class="info-title">基本信息</h4>
      <el-form :model="userInfo" label-position="left" label-width="80px" style="padding: 0 15px">
        <el-form-item label="邮箱" style="margin-bottom: 10px">
          {{ userInfo.mail }}
        </el-form-item>
        <el-form-item label="用户类型" style="margin-bottom: 10px">
          {{ userInfo.role }}
        </el-form-item>
        <el-form-item label="所属部门" style="margin-bottom: 10px">
          {{ userInfo.department && userInfo.department.name ? userInfo.department.name : '-' }}
        </el-form-item>
      </el-form>
      <el-divider />
    </div>

    <div class="info-box">
      <h4 class="info-title">第三方账号</h4>
      <div class="info-icon-box">
        <div style="display: flex;">
          <el-image :src="require('@/assets/icons/GitHub.png')" class="info-icon" />
          <div>暂未绑定</div>
        </div>
        <div v-if="$store.state.user_info._id === $route.query.id">
          <el-button size="mini">绑定账号</el-button>
        </div>
      </div>
      <div class="info-icon-box">
        <div style="display: flex;">
          <el-image :src="require('@/assets/icons/WeChat.png')" class="info-icon" />
          <div>暂未绑定</div>
        </div>
        <div v-if="$store.state.user_info._id === $route.query.id">
          <el-button size="mini">绑定账号</el-button>
        </div>
      </div>
      <el-divider />
    </div>

    <div class="info-box" style="margin-bottom: 50px;">
      <div class="info-title" style="display: flex; justify-content: space-between; align-items: center;">
        <h4>其他信息</h4>
        <div v-if="$store.state.user_info._id === $route.query.id">
          <el-button v-if="isEdit === false" size="mini" type="primary" @click="isEdit = true">编辑信息</el-button>
          <el-button v-else size="mini" type="primary" @click="handleSave">保存编辑</el-button>
        </div>
      </div>
      <el-form :model="extra" :rules="rules" label-position="left" label-width="80px" ref="extraForm" style="padding: 0 20px">
        <el-form-item label="性别" style="margin-bottom: 10px">
          <span v-if="!isEdit">{{ extra.gender }}</span>
          <el-radio-group v-model="extra.gender" v-else size="mini">
            <el-radio-button label="男" />
            <el-radio-button label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" style="margin-bottom: 10px">
          <span v-if="!isEdit">{{ extra.birthday === '' ? '暂无' : getDate(extra.birthday) }}</span>
          <el-date-picker v-else v-model="extra.birthday" size="mini" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="手机" style="margin-bottom: 10px" prop="tel">
          <span v-if="!isEdit">{{ extra.tel === '' ? '暂无' : extra.tel }}</span>
          <el-input v-else v-model="extra.tel" style="width: 300px" size="mini"/>
        </el-form-item>
        <el-form-item label="QQ" style="margin-bottom: 10px" prop="qq">
          <span v-if="!isEdit">{{ extra.qq === '' ? '暂无' : extra.qq }}</span>
          <el-input v-else v-model="extra.qq" style="width: 300px" size="mini"/>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getUserInfo, updateUser } from '@/network/user.js'
import { formatDate } from '@/utils/index.js'

export default {
  data() {
    const validateTel = (rule, value, callback) => {
      const regex = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (value.trim() === '') {
        callback()
      } else if (!regex.test(value)) {
        callback(new Error('请输入正确的手机号码格式'))
      } else {
        callback()
      }
    }

    const validateQQ = (rule, value, callback) => {
      const regex = /[1-9][0-9]{4,}/
      if (value.trim() === '') {
        callback()
      } else if (!regex.test(value)) {
        callback(new Error('请输入正确的QQ号'))
      } else {
        callback()
      }
    }

    return {
      userInfo: {},
      userId: '',
      isEdit: false,
      extra: { gender: '男', birthday: '', tel: '', qq: '' },
      rules: {
        tel: { validator: validateTel, trigger: 'blur' },
        qq: { validator: validateQQ, trigger: 'blur' }
      }
    }
  },
  watch: {
    $route() {
      this.userId = this.$route.query.id
    },
    async userId() {
      await this.fetchData(this.$route.query.id)
    }
  },
  computed: {
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd')
    }
  },
  async mounted() {
    await this.fetchData(this.$route.query.id)
  },
  methods: {
    async fetchData(id) {
      const userInfo = await getUserInfo(id)
      if (userInfo && userInfo.code === 0) {
        this.userInfo = userInfo.data
        // console.log(this.userInfo)
        if (this.userInfo.extra) {
          this.extra = JSON.parse(this.userInfo.extra)
        }
      } else {
        this.$router.replace('/404')
      }
    },
    async handleSave() {
      this.$refs.extraForm.validate(async(valid) => {
        if (valid) {
          await this.$confirm('您确定要保存编辑吗？').then(async() => {
            console.log(this.extra)
            const data = await updateUser(this.$route.query.id, { extra: JSON.stringify(this.extra) })
            if (data && data.code === 0) {
              this.$message({ message: '修改成功', type: 'success' })
              this.isEdit = false
              await this.fetchData(this.$route.query.id)
            } else {
              this.$message({ message: '修改失败！', type: 'error' })
            }
          }).catch(() => {
            this.$message.info('已取消')
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.top-banner {
  width: 100%;
  height: 150px;
  background-image: linear-gradient(to right, #eb8383, #a1a7e9);
  border-bottom: #9198e5 1px solid;
}

.avatar-box {
  width: 150px;
  margin-left: 15%;
  margin-top: -75px;
  .avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
  }
}

.username-box {
  position: absolute;
  left: 15%;
  padding-left: 200px;
  top: 280px;
}

.info-box {
  width: 50%;
  margin: 0 auto;
  .info-title {
    margin: 20px 0;
  }
  .info-icon-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 20px;
    font-size: 14px;
    .info-icon {
      width: 25px;
      margin-right: 50px;
    }
  }
}
</style>
