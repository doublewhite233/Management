<template>
  <div style="height: 100%">
    <el-menu :default-active="$route.path" style="height: 100%" @select="handleSelect">
      <slot name="header" />

      <template v-for="(item, index) in menuData">
        <el-submenu v-if="item.children" :key="item.name" :index="item.path">
          <template slot="title">
            <i :class="item.icon" />
            <span>{{ item.name }}</span>
          </template>
          <el-menu-item v-for="i in item.children" :key="i.name" :index="i.path">{{ i.name }}</el-menu-item>
        </el-submenu>

        <el-divider v-else-if="item.divider" :key="index" />

        <el-menu-item v-else :key="item.name" :index="item.path">
          <i :class="item.icon"></i>
          <span slot="title">{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
export default {
  props: {
    menuData: {
      type: Array,
      default() {
        return [
          { name: '导航一', icon: 'el-icon-location', children: [{ name: '选项一' }, { name: '选项二' }] },
          { divider: true },
          { name: '导航二', icon: 'el-icon-menu' }
        ]
      }
    },
    query: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect(path) {
      if (this.$route.path !== path) {
        this.$router.push({ path: path, query: { id: this.query }})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 0;
}
</style>
