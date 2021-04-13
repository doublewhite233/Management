<template>
  <el-main v-loading="$store.state.loading" class="main">
    context
  </el-main>
</template>

<script>
export default {
  computed: {
    loading() {
      return this.$store.state.loading
    }
  },
  watch: {
    async loading(val, oldVal) {
      if (val) {
        console.log('done')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}
</style>
