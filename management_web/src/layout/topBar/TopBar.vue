<template>
  <div class="padding: 0">
    <el-menu :default-active="$route.meta.path" mode="horizontal" background-color="#212121" text-color="#fff" active-text-color="#409EFF" @select="handleSelect">
      <!-- 由于有无下拉菜单的标记不同需要在外包裹一层，包裹div失败，百度后采用template -->
      <template v-for="item in menuItemList">
        <el-menu-item v-if="!item.children" :key="item.path" :index="item.path">{{ item.name }}</el-menu-item>
        <el-submenu v-else :key="item.path" :index="item.path">
          <template slot="title">{{ item.name }}</template>
          <el-menu-item v-for="i in item.children" :key="i.path" :index="i.path">{{ i.name }}</el-menu-item>
        </el-submenu>
      </template>
      <!-- <el-menu-item index="search">查找</el-menu-item>
      <el-menu-item index="group">组织</el-menu-item> -->

      <div style="position: absolute; right: 30px; top: 20px; font-size: 12px">
        <el-dropdown @command="handleCommand">
          <span style="cursor: pointer; color: #fff">{{ $store.state.user_info.username }}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a">我的主页</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItemList: []
    }
  },
  mounted() {
    // 生成导航栏目列表
    const routes = this.$store.state.routes
    routes.forEach(i => {
      if (!i.hidden) {
        if (i.path === '/') {
          this.menuItemList.push({ name: i.children[0].name, path: i.children[0].meta.path })
        } else {
          const data = { name: i.name, path: i.path }
          const children = []
          for (const child of i.children) {
            children.push({ name: child.name, path: child.meta.path })
          }
          this.$set(data, 'children', children)
          this.menuItemList.push(data)
        }
      }
    })
  },
  methods: {
    handleSelect(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    async handleCommand(command) {
      // 退出登录
      if (command === 'logout') {
        await this.$confirm('您确定要退出登录吗？').then(() => {
          this.$store.dispatch('logout')
          this.$router.push('/login')
        }).catch(() => {
          this.$message.info('已取消')
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
