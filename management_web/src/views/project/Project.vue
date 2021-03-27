<template>
  <div>
    <!-- 无项目显示Empty -->
    <div v-if="$store.state.project_info._id === ''" style="height: calc(100vh - 111px);">
      <empty>
        <template v-slot:text>暂无项目，请等待管理员创建</template>
      </empty>
    </div>

    <el-row v-else>
      <el-col :span="4" style="height: calc(100vh - 111px); margin-top: 1px">
        <side-bar :menuData="sideBarData">
          <template v-slot:header>
            <el-row class="title-warp">
              <el-col class="title-content" v-if="!showSelect" @click.native="handleShowSelect">
                <h4>{{ $store.state.project_info.name }}<i class="el-icon-setting" /></h4>
              </el-col>
              <el-col v-else class="title-content">
                <el-select v-model="selectedProject" filterable remote :remote-method="getProjectList" :loading="loading" @keyup.enter.native="handleConfirmSelect">
                  <el-option v-for="i in selectOption" :key="i._id" :value="i._id" :label="i.name" />
                </el-select>
              </el-col>
            </el-row>
          </template>
        </side-bar>
      </el-col>
      <el-col :span="20">
        <router-view />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getProjectList } from '@/network/project.js'

import SideBar from '@/components/sideBar/SideBar'
import Empty from '@/components/empty/Empty'

export default {
  components: {
    SideBar,
    Empty
  },
  data() {
    return {
      // 侧边栏配置
      sideBarData: [
        { name: '代办需求', icon: 'el-icon-location', path: '/project/backlog' },
        { name: '看板', icon: 'el-icon-s-order', path: '/project/dashboard' },
        { name: '统计报表', icon: 'el-icon-s-marketing', path: '/project/statistics' },
        { name: '历史报告', icon: 'el-icon-s-data', path: '/project/report' },
        { divider: true },
        { name: '任务', icon: 'el-icon-message-solid', path: '/project/issue' },
        { name: '项目详情', icon: 'el-icon-info', path: '/project/detail' }
      ],
      loading: false,
      showSelect: false,
      selectedProject: '',
      selectOption: []
    }
  },
  mounted() {
    // 清除信息，并重新加载
    this.$store.dispatch('getProjectInfo')
  },
  methods: {
    handleShowSelect() {
      this.showSelect = true
      this.selectOption = []
      this.selectOption.push({ _id: this.$store.state.project_info._id, name: this.$store.state.project_info.name })
      this.selectedProject = this.$store.state.project_info._id
    },
    async getProjectList(query) {
      this.loading = true
      this.selectOption = []
      const projects = await getProjectList(query.trim())
      if (projects && projects.code === 0) {
        this.selectOption = projects.data
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
      this.loading = false
    },
    async handleConfirmSelect() {
      if (this.selectedProject !== this.$store.state.project_info._id) {
        await this.$store.dispatch('setProjectInfo', { id: this.selectedProject })
      }
      this.showSelect = false
    }
  }
}
</script>

<style lang="scss" scoped>
.title-warp {
  height: 50px;
  position: relative;
  .title-content {
    text-align: center;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    cursor: pointer;
  }
}
</style>
