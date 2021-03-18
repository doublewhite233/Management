<template>
  <div class="empty">
    <div class="content">
      <img src="@/assets/empty.png"  class="empty-img"/>
      <div>
        <slot name="text">暂无数据</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.empty {
  width: 100%;
  height: 100%;
  position: relative;
  text-align: center;
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .empty-img {
      margin: 20px;
      width: 80%;
      max-width: 400px;
    }
  }
}
</style>
