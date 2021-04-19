<template>
  <el-main v-loading="mainLoading" class="main">
    <div v-if="sprintData._id === ''" style="height: 100%;">
      <empty>
        <template v-slot:text>现在没有冲刺在进行中，无法使用看板功能哦</template>
      </empty>
    </div>

    <div v-else style="position: relative;">
      <h3 style="margin-top: 10px;">{{ sprintData.name }}</h3>
      <div class="remain-box">
        <i class="el-icon-s-flag" style="margin-right: 10px;"/>
        <span style="font-size: 14px;">{{ getDateSub(new Date(sprintData.end_at)) }}</span>
        <createIssueBtn :sprint="sprintData._id" @success="fetchData($route.query.id)" :project="$route.query.id" style="display: inline-block; margin-left: 20px;"/>
      </div>

      <el-row style="margin-top: 20px;">
        <el-col :span="10">
          <el-select placeholder="输入人员进行查找" v-model="searchList" filterable multiple reserve-keyword clearable style="width: 100%">
            <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
      </el-row>

      <div class="kanban">
        <div v-for="i in Object.keys(issueStates)" :key="i" class="kanban-item" @drop="onDrop(i)">
          <kanban-col :issues="issues[i] ? issues[i] : []" :id="i">
            <template v-slot:title>{{ issueStates[i] }}</template>
            <template v-slot:issues v-if="issues[i]">
              <div style="position: relative;">
                <draggable :list="issues[i]" animation="300" @start="onDragStart(i)" @end="onDragEnd" @change="onDragChange" :group="groupStates[i]">
                  <div v-for="issue in issues[i]" :key="issue._id">
                    <issueItem :data="issue" :size="'mini'" />
                  </div>
                  <div v-if="issues[i].length === 0" style="min-height: 280px;" />
                </draggable>
              </div>
            </template>
          </kanban-col>
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="dialogData" :rules="rules" label-position="left" ref="dialogForm" style="padding: 0 20px">
        <el-form-item label="预计耗时" label-width="80px" prop="estimate">
          <el-input v-model="dialogData.estimate" style="width: 220px;"/>
          <span style="padding: 0 10px">eg. 3w 4d 6h</span>
          <el-popover placement="top-start" width="300" trigger="hover">
            <div>时间单位： 周(w)，天(d)，小时(h)</div>
            <div style="margin-top: 10px;">转换标准： 1w = 5d, 1d = 8h</div>
            <i class="el-icon-question" slot="reference"/>
          </el-popover>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
  </el-main>
</template>

<script>
import { getSprintData } from '@/network/sprint.js'
import { getIssueData, updateIssue } from '@/network/issue.js'
import { getTeamInfo } from '@/network/project.js'
import { logHistory } from '@/network/history.js'
import { getDateSub, debounce, formatLogtoHour } from '@/utils/index.js'

import draggable from 'vuedraggable'

import KanbanCol from '@/components/kanbanColumn/index.vue'
import createIssueBtn from '@/components/createIssueBtn/CreateIssueBtn.vue'
import Empty from '@/components/empty/Empty'
import issueItem from '@/components/issueItem/IssueItem.vue'

export default {
  components: {
    draggable,
    KanbanCol,
    createIssueBtn,
    Empty,
    issueItem
  },
  data() {
    const validateEstimate = (rule, value, callback) => {
      // 只能输入数字和hdw、空格
      const reg = /^[(h|d|w)0-9\s]+$/
      const reg2 = /\d+(h|w|d)\d+(h|w|d)\d+(h|w|d)|\d+(h|w|d)\d+(h|w|d)|\d+(h|w|d)/
      if (value.trim() === '') {
        callback()
      } else if (!reg.test(value) || !reg2.test(value)) {
        callback(new Error('请输入正确的格式'))
      } else {
        callback()
      }
    }
    return {
      sprintData: { _id: '' },
      issueStates: { todo: '未开始', inprogress: '进行中', testing: '测试中', verified: '验收中', closed: '已关闭' },
      groupStates: { todo: 0, inprogress: 0, testing: 0, verified: 0, closed: 0 },
      dragRule: { todo: ['todo', 'inprogress', 'closed'],
        inprogress: ['todo', 'inprogress', 'testing', 'closed'],
        testing: ['todo', 'testing', 'verified'],
        verified: ['todo', 'verified', 'closed'],
        closed: ['todo', 'closed']
      },
      issues: {},
      personOption: [],
      selectLoading: false,
      searchList: [],
      mainLoading: false,
      draggingCol: { start: '', end: '' },
      dialogVisible: false,
      dialogTitle: '',
      dialogData: { _id: '', estimate: '' },
      rules: {
        estimate: { validator: validateEstimate, trigger: 'blur' }
      }
    }
  },
  computed: {
    getDateSub() {
      return (date) => {
        const time = getDateSub(new Date(), date)
        if (time.day > 0) return `剩余 ${time.day} 天`
        else if (time.day === 0 && time.hour > 0) return `剩余 ${time.hour} 小时`
        else if (time.day === 0 && time.hour === 0 && time.minute > 0) return `剩余 ${time.minute} 分钟`
      }
    }
  },
  watch: {
    searchList: {
      handler() {
        this.debounceInput(this)
      },
      deep: true
    }
  },
  async mounted() {
    this.$bus.$on('change-project', async() => await this.fetchData(this.$route.query.id))
    if (this.$route.query.id) {
      await this.fetchData(this.$route.query.id)
      // 获取成员列表
      const teamData = await getTeamInfo(this.$route.query.id)
      if (teamData && teamData.data && teamData.data.team) {
        teamData.data.team.forEach(i => {
          this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
        })
      }
    }
  },
  destroyed() {
    this.$bus.$off('change-project')
  },
  methods: {
    onDragStart(i) {
      this.dragRule[i].forEach(k => {
        if (k !== i) {
          document.getElementById(k).classList.add('dash-class')
        }
        this.$set(this.groupStates, k, 1)
      })
      this.draggingCol.start = i
    },
    onDragEnd(col) {
      this.$forceUpdate()
      Object.keys(this.issueStates).forEach(k => {
        document.getElementById(k).classList.remove('dash-class')
        this.groupStates[k] = 0
      })
    },
    async onDragChange(e) {
      // 获取选择的任务_id
      if (e.added && this.draggingCol !== '') {
        const issue = e.added.element
        if (this.dragRule[this.draggingCol.start].some(col => col === this.draggingCol.end)) {
          // 开始任务需要有预估时间
          if (issue.state === 'todo' && this.draggingCol.end === 'inprogress' && !issue.estimate) {
            this.dialogTitle = '预估任务时间'
            this.dialogVisible = true
            Object.keys(this.dialogData).forEach(k => {
              this.dialogData[k] = ''
            })
            this.dialogData._id = issue._id
          } else {
            // 修改状态
            const data = await updateIssue(issue._id, { state: this.draggingCol.end })
            if (data && data.code === 0) {
              this.$message({ message: '更新成功', type: 'success' })
            } else {
              this.$message({ message: '似乎出了一点问题...', type: 'error' })
            }
            await logHistory(this.$route.query.id, issue._id, this.$store.state.user_info._id, this.draggingCol.end, null)
          }
        }
        await this.getIssueData(this.$route.query.id)
      }
    },
    onDrop(col) {
      this.draggingCol.end = col
    },
    debounceInput: debounce(async(that) => {
      await that.fetchData(that.$route.query.id)
    }, 500),
    async handleSubmit() {
      const data = await updateIssue(this.dialogData._id, { state: this.draggingCol.end, estimate: formatLogtoHour(this.dialogData.estimate, 8), logtime: formatLogtoHour(this.dialogData.estimate, 8) })
      if (data && data.code === 0) {
        await logHistory(this.$route.query.id, this.dialogData._id, this.$store.state.user_info._id, 'estimate', formatLogtoHour(this.dialogData.estimate, 8))
        this.$message({ message: '更新成功', type: 'success' })
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
      await logHistory(this.$route.query.id, this.dialogData._id, this.$store.state.user_info._id, this.draggingCol.end, null)
      await this.getIssueData(this.$route.query.id)
      this.dialogVisible = false
    },

    async fetchData(project) {
      this.mainLoading = true
      const { data } = await getSprintData(0, ['running'], project)
      if (data.length > 0) {
        this.sprintData = data[0]
        await this.getIssueData(project)
      } else {
        this.sprintData = { _id: '' }
      }
      this.mainLoading = false
    },
    async getIssueData(project) {
      const issue = await getIssueData(project, [this.sprintData._id], this.searchList)
      // 初始化issue数组
      this.issues = {}
      Object.keys(this.issueStates).forEach(k => {
        this.issues[k] = []
      })
      issue.data.forEach(item => {
        this.issues[item.state].push(item)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}

.remain-box {
  position: absolute;
  right: 0;
  top: -10px;
}

.kanban {
  display: flex;
  margin-top: 10px;
}

.kanban-item {
  flex: 1;
  height: 100%;
}

.dash-class {
  border: 3px dashed #000;
}

.mask-div {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
</style>
