<template>
  <div class="login-container">
    <div class="login-canvas">
      <canvas-nest />
    </div>
    <div class="login-form">
      <div class="form-title">
        <h2>软件项目管理系统</h2>
        <h3>登录</h3>
      </div>
      <el-form label-position="left" v-model="loginForm">
        <el-form-item>
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" prefix-icon="el-icon-s-promotion" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%">登录</el-button>
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
export default {
  components: {
    canvasNest
  },
  data() {
    return {
      loginForm: { username: '', password: '' }
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
    }
    .login-by {
      text-align: center;
      .login-by-icon {
        width: 30px;
        height: 30px;
        margin: 0 10px;
      }
    }
  }
}
</style>
