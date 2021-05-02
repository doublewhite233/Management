<template>
  <el-main class="main">
    <div v-if="page.totalCount === 0" style="height: calc(100vh - 151px);">
      <empty>
        <template v-slot:text>
          <div>该项目中暂无冲刺信息</div>
        </template>
      </empty>
    </div>

    <div v-else>
      <el-row type="flex" justify="space-between">
        <el-col :span="10">
          <el-input placeholder="请输入冲刺名称进行查询" v-model="search.name">
            <el-button slot="append" icon="el-icon-search" @click="fetchData($route.query.id)"/>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="reportData" :default-sort="sort" @sort-change="handleSort">
        <el-table-column prop="name" label="冲刺名称" align="center" sortable="custom" />
        <el-table-column prop="goal" label="冲刺目标" align="center" sortable="custom">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="bottom">
              <p>冲刺目标: {{ scope.row.goal }}</p>
              <div slot="reference">
                <span>{{ scope.row.goal.length > 20 ? scope.row.goal.slice(0,20) + '...' : scope.row.goal }}</span>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" align="center" sortable="custom" />
        <el-table-column label="开始时间" align="center" prop="start_at" sortable="custom">
          <template slot-scope="scope">
            {{ getDate(scope.row.start_at) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="end_at" sortable="custom">
          <template slot-scope="scope">
            {{ getDate(scope.row.end_at) }}
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
  </el-main>
</template>

<script>
import { getReport } from '@/network/sprint.js'
import { formatDate } from '@/utils/index.js'

import Empty from '@/components/empty/Empty'

export default {
  components: {
    Empty
  },
  data() {
    return {
      reportData: [],
      page: { total: 1, currentPage: 1, size: 10, totalCount: 0 },
      sort: { prop: 'start_at', order: 'descending' },
      search: { name: '' }
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
    }
  },
  destroyed() {
    this.$bus.$off('change-project')
  },
  methods: {
    async fetchData(project) {
      const report = await getReport({ project, sort: this.sort.prop, order: this.sort.order === 'ascending' ? 1 : -1, skip: (this.page.currentPage - 1) * this.page.size, search: this.search.name.trim() })
      if (report && report.code === 0) {
        this.reportData = report.data
        this.page.total = report.total
        this.page.totalCount = report.totalCount
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
      console.log(this.page.currentPage)
      await this.fetchData(this.$route.query.id)
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
