<template>
  <div class="padding: 0">
    <el-menu :default-active="activeIndex" mode="horizontal" background-color="#212121" text-color="#fff" active-text-color="#409EFF" router @select="handleSelect">
      <el-menu-item index="mywork">我的工作台</el-menu-item>
      <el-submenu index="project">
        <template slot="title">项目</template>
        <el-menu-item index="project">选项1</el-menu-item>
      </el-submenu>
      <el-menu-item index="search">查找</el-menu-item>
      <el-menu-item index="statistic">统计</el-menu-item>
      <el-menu-item index="group">组织</el-menu-item>

      <div style="position: absolute; right: 30px; top: 20px; font-size: 12px">
        <el-dropdown>
          <span style="cursor: pointer; color: #fff">王小虎</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-menu>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped>

</style>
