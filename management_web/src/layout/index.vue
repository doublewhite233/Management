<template>
  <el-container>
    <el-header style="padding: 0; height: 110px">
      <top-bar />
      <el-menu style="padding: 18px 20px; border-bottom: solid 1px #DCDFE6">
        <breadcrumb />
      </el-menu>
    </el-header>
    <el-container>
      <el-main style="padding: 0">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import TopBar from './topBar/TopBar'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'

export default {
  name: 'IndexVue',
  components: {
    TopBar,
    Breadcrumb
  }
}
</script>

<style scoped>

</style>
