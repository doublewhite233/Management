<template>
  <el-main class="main">
    <div v-if="page.totalCount === 0" style="height: calc(100vh - 151px);">
      <empty>
        <template v-slot:text>
          <div>暂无任务信息</div>
        </template>
      </empty>
    </div>

    <div v-else>
      <el-button type="primary" @click="drawer = true">过滤查找</el-button>

      <el-table :data="issueData" :default-sort="sort" @sort-change="handleSort">
        <el-table-column prop="name" label="名称" align="center" sortable="custom">
          <template slot-scope="scope">
            <el-link @click="clickName(scope.row._id)" :underline="false">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.type.name }}
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" align="center" sortable="custom">
          <template slot-scope="scope">
            <el-tag :type="issueTag[scope.row.state]">{{ issueStates[scope.row.state] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属冲刺" align="center" prop="sprint" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.sprint && scope.row.sprint.name ? scope.row.sprint.name : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="assigner" label="分配人" align="center" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.assigner.username }}
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="指派给" align="center" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.assignee && scope.row.assignee.username ? scope.row.assignee.username : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_at" sortable="custom">
          <template slot-scope="scope">
            {{ getDate(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="update_at" sortable="custom">
          <template slot-scope="scope">
            {{ getDate(scope.row.update_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" justify="center" style="margin-top: 10px">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="page.currentPage"
          :page-size="page.size"
          layout="total, prev, pager, next"
          :total="page.total">
        </el-pagination>
      </el-row>
    </div>

    <el-drawer title="过滤查找" :visible.sync="drawer" size="50%" ref="drawer">
      <div style="margin: 20px">
        <el-form :model="search" label-position="left" label-width="80px">
          <el-form-item label="任务名称">
            <el-input v-model="search.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="任务类型">
            <el-select v-model="search.type" multiple clearable style="width: 100%;">
              <el-option v-for="i in typeOption" :key="i._id" :label="i.name" :value="i._id" />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="search.state" multiple clearable style="width: 100%;">
              <el-option v-for="i in Object.keys(issueStates)" :key="i" :label="issueStates[i]" :value="i" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属冲刺">
            <el-select v-model="search.sprint" multiple style="width: 100%;">
              <el-option v-for="i in sprintOption" :key="i.value" :label="i.label" :value="i.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="分配人">
            <el-select v-model="search.assigner" multiple clearable style="width: 100%;">
              <el-option v-for="i in personOption" :key="i.value + 'assigner'" :label="i.label" :value="i.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="指派给">
            <el-select v-model="search.assignee" multiple clearable style="width: 100%;">
              <el-option v-for="i in personOption" :key="i.value" :label="i.label" :value="i.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <div style="float: right; margin-top: 20px;">
          <el-button @click="handleClear">清空</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </el-drawer>
  </el-main>
</template>

<script>
import { getAllIssue } from '@/network/issue.js'
import { getTeamInfo } from '@/network/project.js'
import { getIssueType } from '@/network/issueType.js'
import { getSprintData } from '@/network/sprint.js'
import { formatDate } from '@/utils/index.js'

import Empty from '@/components/empty/Empty'

export default {
  components: {
    Empty
  },
  data() {
    return {
      drawer: false,
      issueData: [],
      issueStates: { todo: '未开始', inprogress: '进行中', testing: '测试中', verified: '验收中', closed: '已关闭' },
      issueTag: { todo: '', inprogress: 'success', testing: 'waring', verified: 'danger', closed: 'info' },
      page: { total: 1, currentPage: 1, size: 10, totalCount: 0 },
      sort: { prop: 'update_at', order: 'descending' },
      search: { name: '', type: [], state: [], sprint: [], assigner: [], assignee: [] },
      typeOption: [],
      personOption: [],
      sprintOption: []
    }
  },
  computed: {
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  async mounted() {
    this.$bus.$on('change-project', async() => await this.fetchData(this.$route.query.id))
    if (this.$route.query.id) {
      await this.fetchData(this.$route.query.id)
      // 获取任务类型和成员列表
      const types = await getIssueType()
      if (types && types.code === 0) {
        this.typeOption = types.data
      }
      const teamData = await getTeamInfo(this.$route.query.id)
      if (teamData && teamData.data && teamData.data.team) {
        teamData.data.team.forEach(i => {
          this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
        })
      }
      // 获取冲刺信息
      const sprint = await getSprintData(0, ['new', 'running', 'closed'], this.$route.query.id)
      if (sprint && sprint.code === 0) {
        sprint.data.forEach(i => {
          this.sprintOption.push({ value: i._id, label: i.name })
        })
      }
    }
  },
  destroyed() {
    this.$bus.$off('change-project')
  },
  methods: {
    async fetchData(project) {
      const searchText = {}
      Object.keys(this.search).forEach(k => {
        if (k !== 'name') {
          if (this.search[k].length > 0) searchText[k] = this.search[k]
        } else {
          if (this.search[k].trim().length > 0) searchText[k] = this.search[k]
        }
      })
      const issue = await getAllIssue({ project, sort: this.sort.prop, order: this.sort.order === 'ascending' ? 1 : -1, skip: (this.page.currentPage - 1) * this.page.size, search: searchText })
      if (issue && issue.code === 0) {
        this.issueData = issue.data
        this.page.total = issue.total
        this.page.totalCount = issue.totalCount
      }
    },
    handleSort(data) {
      // 回到第一页
      this.page.currentPage = 1
      this.$set(this.sort, 'prop', data.prop)
      this.$set(this.sort, 'order', data.order)
      this.fetchData(this.$route.query.id)
    },
    async handleCurrentChange() {
      await this.fetchData(this.$route.query.id)
    },
    clickName(id) {
      this.$router.push({ path: '/issue', query: { id }})
    },
    handleClear() {
      Object.keys(this.search).forEach(k => {
        if (k !== 'name') {
          this.search[k] = []
        } else this.search[k] = ''
      })
    },
    async handleSearch() {
      await this.fetchData(this.$route.query.id)
      this.$refs.drawer.closeDrawer()
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}
</style>
