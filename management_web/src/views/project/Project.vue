<template>
  <div>
    <!-- 无项目显示Empty -->
    <div v-if="have === true" style="height: calc(100vh - 111px);">
      <empty>
        <template v-slot:text>暂无项目，请等待管理员创建</template>
      </empty>
    </div>

    <el-row v-else>
      <el-col :span="4" style="height: calc(100vh - 111px); margin-top: 1px">
        <side-bar :menuData="sideBarData">
          <template v-slot:header>
            Title
          </template>
        </side-bar>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SideBar from '@/components/sideBar/SideBar'
import Empty from '@/components/empty/Empty'

export default {
  name: 'Project',
  components: {
    SideBar,
    Empty
  },
  data() {
    return {
      // 侧边栏配置
      sideBarData: [
        { name: '代办需求', icon: 'el-icon-location', path: 'backlog' },
        { name: '仪表盘', icon: 'el-icon-s-order', path: 'dashboard' },
        { name: '统计报告', icon: 'el-icon-s-marketing', path: 'reports' },
        { divider: true },
        { name: '任务', icon: 'el-icon-message-solid', path: 'issue' },
        { name: '项目详情', icon: 'el-icon-info', path: 'info' }
      ],
      have: false
    }
  }
}
</script>

<style scoped>

</style>
