<template>
  <el-main class="main">
    context
  </el-main>
</template>

<script>
export default {
  async mounted() {
    this.$bus.$on('change-project', async() => await this.fetchData(this.$route.query.id))
    if (this.$route.query.id) {
      // await this.fetchData(this.$route.query.id)
    }
  },
  destroyed() {
    this.$bus.$off('change-project')
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}
</style>
