<template>
  <div class="container">
    <div class="content">
      <img src="@/assets/404.png" alt="404" class="img">
      <div class="title">Oops! 404 ERROR</div>
      <div class="text">你访问的页面不存在...</div>
      <el-button round @click="handleReturn">返回上一页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleReturn() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
$background: #212121;
$text-color: #fff;

.container {
  width: 100vw;
  height: 100vh;
  background: $background;
  color: $text-color;
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    .title {
      font-size: 50px;
      font-weight: bold;
    }
    .img {
      width: 40%;
    }
    .text {
      margin: 20px 0;
    }
  }
}
</style>

