<template>
  <el-main class="main">
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
          <div slot="header">
            <span>团队信息</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="showMoreTeam">显示更多</el-button>
          </div>
          <el-col v-for="i in (projectData.team || '').slice(0,7)" :key="i._id" :span="12" class="item">
            <i class="el-icon-user-solid" />
            {{ i.username }}
          </el-col>
          <el-col v-if="$store.state.user_info.role === 'admin'" :span="12" class="item">
            <i class="el-icon-plus" />
            <el-link :underline="false" @click="showMoreTeam" style="font-size: 16px;">团队管理</el-link>
          </el-col>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="cards" style="margin-left: 10px">
          <div slot="header"><span>任务概况</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="60%">
      <el-table :data="projectData.team" v-if="dialogTitle === '团队信息'">
        <el-table-column prop="username" align="center" label="用户名" />
        <el-table-column prop="mail" align="center" label="邮箱" />
        <el-table-column label="操作" align="center" width="150" v-if="$store.state.user_info.role === 'admin'">
          <template slot-scope="scope">
            <el-button @click="handleDeleteTeam(scope)" type="danger" size="mini" :disabled="scope.row._id === projectData.leader._id">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer">
        <span v-if="dialogTitle === '团队信息'">
          <el-popover v-model="popVisible" placement="top" trigger="click" width="400" v-if="$store.state.user_info.role === 'admin'">
            <el-row>
              <el-col :span="20">
                <el-select style="width: 95%;" v-model="addUser" filterable remote :remote-method="getPersonList" :loading="selectLoading" placeholder="输入进行查找" clearable>
                  <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-button type="success" @click="handleAddTeam" :disabled="addUser.trim() === ''">确认</el-button>
              </el-col>
            </el-row>
            <el-button type="primary" slot="reference">添加成员</el-button>
          </el-popover>
        </span>
      </span>
    </el-dialog>
  </el-main>
</template>

<script>
import { getProjectDetail, addTeamMember, deleteTeamMember } from '@/network/project.js'
import { getUserData } from '@/network/user.js'
import { formatDate } from '@/utils/index.js'

export default {
  data() {
    return {
      projectData: {},
      dialogVisible: false,
      dialogTitle: '',
      selectLoading: false,
      addUser: '',
      personOption: [],
      popVisible: false
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
    async fetchData(id) {
      const data = await getProjectDetail(id)
      if (data && data.code === 0) {
        this.projectData = data.data
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
    },
    showMoreTeam() {
      this.dialogTitle = '团队信息'
      this.dialogVisible = true
    },
    async handleDeleteTeam(scope) {
      await this.$confirm('您确定要删除这个成员吗？').then(async() => {
        const data = await deleteTeamMember(this.$route.query.id, scope.row._id)
        if (data && data.code === 0) {
          this.$message({ message: '删除项目成员成功！', type: 'success' })
          await this.fetchData(this.$route.query.id)
        } else {
          this.$message({ message: '删除失败，似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async handleAddTeam() {
      if (this.projectData.team.some(user => user._id === this.addUser)) {
        this.$message({ message: '该用户已是项目成员！', type: 'warning' })
      } else {
        const data = await addTeamMember(this.$route.query.id, this.addUser)
        if (data && data.code === 0) {
          this.$message({ message: '添加项目成员成功！', type: 'success' })
          await this.fetchData(this.$route.query.id)
        } else {
          this.$message({ message: '添加失败，似乎出了一点问题...', type: 'error' })
        }
      }
      this.addUser = ''
      this.popVisible = false
    },
    async getPersonList(query) {
      this.selectLoading = true
      this.personOption = []
      const users = await getUserData(query.trim())
      if (users && users.code === 0) {
        users.data.forEach(i => {
          this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
        })
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
      this.selectLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}

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
