<template>
  <div class="login-container">
    <div class="login-canvas">
      <canvas-nest />
    </div>
    <div class="login-form">
      <div class="form-title">
        <h2>软件项目管理系统</h2>
      </div>
      <div class="form-title">
        <h3>登录</h3>
      </div>
      <el-form label-position="left" :model="loginForm" :rules="loginRules" status-icon>
        <el-form-item prop="mail" style="padding-bottom: 10px">
          <el-input v-model="loginForm.mail" prefix-icon="el-icon-user-solid" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="password" style="padding-bottom: 10px">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-s-promotion" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="handleLogin(loginForm)">登录</el-button>
      </el-form>
      <el-divider>其他方式登录</el-divider>
      <div class="login-by">
        <el-image :src="require('@/assets/icons/github.svg')" class="login-by-icon" />
        <el-image :src="require('@/assets/icons/wechat.svg')" class="login-by-icon" />
      </div>
    </div>
  </div>
</template>

<script>
import canvasNest from '@/components/canvasNest/index.vue'
import { loginReq } from '@/network/login.js'

export default {
  components: {
    canvasNest
  },
  data() {
    // 校验规则
    const validateMail = (rule, value, callback) => {
      const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (value === '') {
        callback(new Error('邮箱不能为空'))
      } else if (!regex.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }

    return {
      loginForm: { mail: '', password: '' },
      loginRules: {
        mail: [{ required: true, validator: validateMail, trigger: 'blur' }],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 18, message: '请输入6-18位密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleLogin(form) {
      const res = await loginReq(form.mail, form.password)
      if (res.code === 0) {
        console.log('success')
      } else {
        this.$message({ message: res.data, type: 'warning' })
      }
    }
  }
}
</script>

<style lang="scss">
$background: #212121;
$text-color: #fff;

.el-divider__text {
  color: $text-color;
  background: $background;
}
</style>

<style lang="scss" scoped>
$background: #212121;
$text-color: #fff;

.login-container {
  width: 100vw;
  height: 100vh;
  .login-canvas {
    width: 100%;
    height: 100%;
    background: $background;
  }
  .login-form {
    z-index: 10;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80vw;
    max-width: 500px;
    color: $text-color;
    font-size: 18px;
    .form-title {
      text-align: center;
      margin: 15px 0;
    }
    .login-by {
      text-align: center;
      .login-by-icon {
        width: 30px;
        height: 30px;
        margin: 0 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
