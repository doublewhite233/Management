<template>
  <el-main v-loading="$store.state.loading" style="margin-top: 1px">
    <el-card v-if="Object.keys(projectData).length > 0">
      <div slot="header" class="clearfix"><span>项目信息</span></div>
      <h3 class="item">{{ projectData.name }}</h3>
      <div class="desc item" v-if="projectData.desc !== ''">项目描述：{{ projectData.desc }}</div>
      <div class="item">项目标签：
        <span v-if="projectData.tag.length > 0">
          <el-tag v-for="tag in projectData.tag" :key="tag" style="margin-right: 10px">{{ tag }}</el-tag>
        </span>
        <span v-else>暂无标签</span>
      </div>
      <div class="item">项目负责人：{{ `${projectData.leader.username}(${projectData.leader.mail})` }}</div>
      <div class="item">创建时间：{{ getDate(projectData.create_at) }}</div>
      <div>更新时间：{{ getDate(projectData.update_at) }}</div>
    </el-card>

    <el-row>
      <el-col :span="12">
        <el-card class="cards" style="margin-right: 10px">
          <div slot="header" class="clearfix">
            <span>团队信息</span>
            <el-button style="float: right; padding: 3px 0" type="text">显示更多</el-button>
          </div>
          <el-col v-for="i in projectData.team" :key="i._id" :span="12" class="item">
            <i class="el-icon-user-solid" />
            {{ i.username }}
          </el-col>
          <el-col v-if="$store.state.user_info.role === 'admin'" :span="12" class="item">
            <i class="el-icon-plus" />
            <span>团队管理</span>
          </el-col>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="cards" style="margin-left: 10px">
          <div slot="header" class="clearfix">
            <span>任务概况</span>
            <el-button style="float: right; padding: 3px 0" type="text">显示更多</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import { getProjectDetail } from '@/network/project.js'
import { formatDate } from '@/utils/index.js'
import { SET_LOADING_STATE } from '@/store/mutation-types.js'

export default {
  data() {
    return {
      projectData: {}
    }
  },
  computed: {
    loading() {
      return this.$store.state.loading
    },
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  watch: {
    async loading(val, oldVal) {
      if (val) {
        await this.fetchData(this.$store.state.project_info._id)
      }
    }
  },
  async mounted() {
    if (this.$store.state.project_info._id !== '') {
      await this.fetchData(this.$store.state.project_info._id)
    }
  },
  methods: {
    async fetchData(id) {
      const { data } = await getProjectDetail(id)
      this.$store.commit(SET_LOADING_STATE, false)
      this.projectData = data
    }
  }
}
</script>

<style lang="scss" scoped>
.item {
  margin-bottom: 18px;
}

.desc {
  color: #777;
  font-size: 14px;
}

.cards {
  margin-top: 20px;
}
</style>
