<template>
  <el-main>
    <el-row>
      <el-col>
        <el-card>
          <el-row type="flex">
            <div class="user-info">
              <div style="width: 240px;">欢迎您，{{ $store.state.user_info.username }}！</div>
              <el-divider direction="vertical" />
            </div>
            <div style="width: 100%;">
              <div style="color: #909399;">{{ getDate(new Date(), 'yyyy年MM月dd日') }}</div>
              <div class="top-data">
                <div v-for="item in Object.keys(topData)" :key="item">
                  <div class="top-data-title">{{ dataText[item] }}</div>
                  <div class="top-data-content">
                    <animate-number from="0" :to="topData[item]" duration="500" easing="easeOutQuad" :ref="item" />
                  </div>
                </div>
              </div>
            </div>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card style="margin: 20px 20px 0 0;">
          <div slot="header">
            <span>我参与的项目</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="dialogVisible=true">显示全部</el-button>
          </div>
          <el-table :data="projectData.slice(0,8)">
            <el-table-column prop="name" label="项目名称" align="center">
              <template slot-scope="scope">
                <el-link @click="clickProject(scope.row._id)" :underline="false">{{ `${scope.row.name}` }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="leader" label="负责人" align="center">
              <template slot-scope="scope">{{ `${scope.row.leader.username}` }}</template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="create_at">
              <template slot-scope="scope">
                {{ getDate(scope.row.create_at, 'yyyy-MM-dd hh:mm') }}
              </template>
            </el-table-column>
            <el-table-column label="更新时间" align="center" prop="update_at">
              <template slot-scope="scope">
                {{ getDate(scope.row.update_at, 'yyyy-MM-dd hh:mm') }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="margin-top: 20px;">
          <div slot="header"><span>最新动态</span></div>
          <el-timeline>
              <el-timeline-item v-for="item in historyData" :key="item.id" :timestamp="getDate(item.create_at, 'yyyy-MM-dd hh:mm')" placement="top">
                <el-card>
                  <div style="display: flex;">
                    <span v-if="item.type === 'estimate'">{{ `${item.user.username} ${historyText[item.type][0]} `}}
                      <span class="issue-name" @click="handleClickIssue(item.issue._id)">{{ item.issue.name.length > 6 ? item.issue.name.slice(0,10) + '...' : item.issue.name }}</span>{{` ${historyText[item.type][1]} ${getLog(item.value)}` }}
                    </span>
                    <span v-else>{{ `${item.user.username} ${historyText[item.type][0]} `}}
                      <span class="issue-name" @click="handleClickIssue(item.issue._id)">{{ item.issue.name.length > 6 ? item.issue.name.slice(0,10) + '...' : item.issue.name }}</span>{{ ` ${historyText[item.type][1]}` }}
                    </span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="我参与的项目" :visible.sync="dialogVisible" width="60%" center>
      <el-table :data="projectData">
        <el-table-column prop="name" label="项目名称" align="center">
          <template slot-scope="scope">
            <el-link @click="clickProject(scope.row._id)" :underline="false">{{ `${scope.row.name}` }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" align="center">
          <template slot-scope="scope">{{ `${scope.row.leader.username}` }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="create_at">
          <template slot-scope="scope">
            {{ getDate(scope.row.create_at, 'yyyy-MM-dd hh:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="update_at">
          <template slot-scope="scope">
            {{ getDate(scope.row.update_at, 'yyyy-MM-dd hh:mm') }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-main>
</template>

<script>
import { getMyData } from '@/network/issue.js'
import { getMyHistory } from '@/network/history.js'
import { getMyProject } from '@/network/project.js'
import { formatDate, formatHourtoLog } from '@/utils/index.js'

export default {
  data() {
    return {
      topData: {},
      dataText: {
        assigner: '我指派的任务',
        unfinished: '进行中任务',
        todo: '我未开始的任务',
        inprogress: '我进行中的任务',
        project: '我参与的项目数'
      },
      projectData: [],
      dialogVisible: false,
      historyData: [],
      historyText: {
        create: ['创建了任务', ''],
        todo: ['将任务', '状态修改为未开始'],
        inprogress: ['将任务', '状态修改为进行中'],
        testing: ['将任务', '状态修改为测试中'],
        verified: ['将任务', '状态修改为验收中'],
        closed: ['将任务', ' 状态修改为已关闭'],
        update: ['更新了任务', '信息'],
        estimate: ['修改任务', '预计耗时为']
      }
    }
  },
  computed: {
    getDate() {
      return (date, format) => formatDate(date, format)
    },
    getLog() {
      return (input) => {
        const res = formatHourtoLog(Number(input), 8)
        let info = ''
        Object.keys(res).forEach(k => { info = info + res[k] + k })
        return info
      }
    }
  },
  async mounted() {
    await this.fetchData()
    this.$forceUpdate()
  },
  methods: {
    async fetchData() {
      // 顶部任务数据
      const res = await getMyData(this.$store.state.user_info._id)
      if (res && res.code === 0) {
        const keys = Object.keys(res.data)
        Object.keys(this.dataText).forEach(k => {
          if (keys.indexOf[k] !== -1) this.topData[k] = res.data[k]
        })
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
      // 参与项目
      const project = await getMyProject(this.$store.state.user_info._id)
      if (project && project.data) {
        this.projectData = project.data
        this.topData.project = project.total
      }
      // 历史记录最新动态
      const history = await getMyHistory()
      if (history && history.data) {
        this.historyData = history.data
      }
    },

    handleClickIssue(id) {
      this.$router.push({ path: '/issue', query: { id }})
    },
    clickProject(id) {
      this.$router.push({ path: '/project/detail', query: { id }})
    }
  }
}
</script>

<style lang="scss" scoped>
.el-divider--vertical{
  height:100%;
}

.user-info {
  font-weight: bold;
  width: 260px;
  height: 150px;
  display: flex;
}

.top-data {
  margin: 0 30px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  .top-data-title {
    font-size: 14px;
    margin-bottom: 20px;
  }
  .top-data-content {
    font-size: 30px;
    font-weight: bold;
    text-align: center;
  }
}

.issue-name {
  font-weight: bold;
  font-style:italic;
  cursor: pointer;
}
</style>
