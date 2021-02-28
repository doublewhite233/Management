<template>
  <el-container>
    <el-header style="padding: 0">
      <top-bar />
    </el-header>
    <el-container>
      <el-aside v-if="this.$route.name==='project'" width="240px" style="height: calc(100vh - 61px); margin-top: 1px">
        <side-bar />
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import TopBar from './topBar/TopBar'
import SideBar from './sideBar/SideBar'

export default {
  name: 'IndexVue',
  components: {
    TopBar,
    SideBar
  }
}
</script>

<style scoped>

</style>
