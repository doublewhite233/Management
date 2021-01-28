<template>
  <el-container>
    <el-header style="padding: 0">
      <top-bar />
    </el-header>
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import TopBar from './topBar/TopBar'

export default {
  name: 'IndexVue',
  components: {
    TopBar
  }
}
</script>

<style scoped>

</style>
