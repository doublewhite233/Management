<template>
  <div>
    <!-- 无项目显示Empty -->
    <div v-if="projectData._id === ''" style="height: calc(100vh - 111px);">
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
                <h4>{{ projectData.name }}<i class="el-icon-setting" /></h4>
              </el-col>
              <el-col v-else class="title-content">
                <el-select v-model="projectData._id">
                  <el-option value="a" label="a啊啊"></el-option>
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
import { getProjectData } from '@/network/project.js'

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
        { name: '仪表盘', icon: 'el-icon-s-order', path: '/project/dashboard' },
        { name: '统计报告', icon: 'el-icon-s-marketing', path: '/project/reports' },
        { divider: true },
        { name: '任务', icon: 'el-icon-message-solid', path: '/project/issue' },
        { name: '项目详情', icon: 'el-icon-info', path: '/project/detail' }
      ],
      projectData: { _id: '' },
      showSelect: false
    }
  },
  mounted() {
    getProjectData().then(res => {
      if (res.totalCount !== 0) this.projectData = res.data[0]
    })
  },
  methods: {
    handleShowSelect() {
      console.log('-------------------')
      this.showSelect = true
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
