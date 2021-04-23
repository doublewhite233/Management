<template>
  <el-main>
    <el-row>
      <el-col :span="4">
        <el-card>
          <div slot="header"><span>部门结构</span></div>
          <div v-if="departmentInfo.length === 0" style="height: 300px;">
            <empty>
              <template v-slot:text>
                <div>暂无部门</div>
              </template>
            </empty>
          </div>
          <div v-else>
            <el-tree :data="treeData" default-expand-all @node-click="handleNodeClick" :expand-on-click-node="false">
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :span="20">
        <el-card style="margin-left: 20px;">
          <div slot="header"><span>用户列表</span></div>
          <el-input placeholder="请输入邮箱或用户名进行查询" v-model="search.text" style="width: 400px;">
            <el-button slot="append" icon="el-icon-search" @click="fetchData"/>
          </el-input>

          <el-table :data="userData" :default-sort="sort" @sort-change="handleSort">
            <el-table-column prop="username" label="用户名" align="center" sortable="custom" />
            <el-table-column prop="mail" label="邮箱" align="center" sortable="custom" />
            <el-table-column prop="role" label="用户类型" align="center" sortable="custom" />
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
              @current-change="fetchData"
              :current-page.sync="page.currentPage"
              :page-size="page.size"
              layout="total, prev, pager, next"
              :total="page.total">
            </el-pagination>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import { getDepartment } from '@/network/department.js'
import { getAdminData } from '@/network/user.js'
import { formatDate } from '@/utils/index.js'

import Empty from '@/components/empty/Empty'

export default {
  components: {
    Empty
  },
  data() {
    return {
      departmentInfo: [],
      treeData: [],
      userData: [],
      page: { total: 1, currentPage: 1, size: 10, totalCount: 0 },
      sort: { prop: 'update_at', order: 'descending' },
      search: { text: '' },
      searchDepartment: []
    }
  },
  computed: {
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  async mounted() {
    await this.fetchData()

    // 部门信息
    const res = await getDepartment(null)
    if (res && res.code === 0) {
      this.departmentInfo = res.data
      this.treeData = [{ id: 'all', label: '全部部门', children: [] }]
      this.departmentInfo.forEach(i => {
        // 判断是否为顶层节点
        if (i.parent.length === 0) {
          const parent = { id: i._id, label: i.name, leader: (i.leader && i.leader.username) ? i.leader.username : '' }
          parent.children = this.getTreeChild(i._id, this.departmentInfo)
          this.treeData[0].children.push(parent)
        }
      })
    } else {
      this.$message({ message: '似乎出了一点问题...', type: 'error' })
    }
  },
  methods: {
    async fetchData() {
      // 用户列表
      const data = await getAdminData((this.page.currentPage - 1) * this.page.size, this.sort.prop, this.sort.order === 'ascending' ? 1 : -1, this.search.text, this.searchDepartment.length > 0 ? this.searchDepartment : null)
      if (data && data.code === 0) {
        this.userData = data.data
        this.page.total = data.total
        this.page.totalCount = data.totalCount
      }
    },
    getTreeChild(id, array) {
      const childs = []
      array.forEach(k => {
        if (k.parent.length > 0) {
          if (k.parent[k.parent.length - 1]._id === id) {
            childs.push({ id: k._id, label: k.name, leader: (k.leader && k.leader.username) ? k.leader.username : '' })
          }
        }
      })

      childs.forEach(i => {
        if (i.id !== undefined) {
          const ch = this.getTreeChild(i.id, this.departmentInfo)
          if (ch.length > 0) {
            i.children = ch
          }
        }
      })
      return childs
    },

    async handleNodeClick(data) {
      if (data.id === 'all') this.searchDepartment = []
      else {
        const department = []
        this.departmentInfo.forEach(i => {
          if (i._id === data.id || i.parent.some(k => k._id === data.id)) {
            department.push(i._id)
          }
        })
        this.searchDepartment = department
      }
      await this.fetchData()
    },
    handleSort(data) {
      // 回到第一页
      this.page.currentPage = 1
      this.$set(this.sort, 'prop', data.prop)
      this.$set(this.sort, 'order', data.order)
      this.fetchData()
    }
  }
}
</script>

<style>

</style>
