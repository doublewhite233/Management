<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <template v-for="item in $route.matched">
      <el-breadcrumb-item v-if="item.path === $route.fullPath" :key="item.path">{{ item.name }}</el-breadcrumb-item>
      <el-breadcrumb-item v-else-if="item.path !== ''" :key="item.path" :to="{ path: item.path }">{{ item.name }}</el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script>
export default {
}
</script>
