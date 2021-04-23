<template>
  <div>
    <el-row type="flex">
      <el-col :span="16" class="box" style="padding-left: 50px;">
        <div class="content top-div">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>项目</el-breadcrumb-item>
            <el-breadcrumb-item v-if="issueInfo.project && issueInfo.project.name">{{ issueInfo.project.name }}</el-breadcrumb-item>
          </el-breadcrumb>
          <div v-if="$store.state.user_info._id === (issueInfo.assigner ? issueInfo.assigner._id : '') || $store.state.user_info.role === 'admin'">
            <el-button v-if="!isEdit" size="mini" @click="handleEdit">编辑任务</el-button>
            <div v-else>
              <el-button type="primary" size="mini" @click="handleSaveEdit">保存编辑</el-button>
              <el-button type="danger" size="mini" @click="handleCancelEdit">取消编辑</el-button>
            </div>
          </div>
        </div>

        <div v-if="!this.isEdit">
          <h2 class="content">{{ issueInfo.name }}</h2>
          <div class="content">
            <div v-if="!issueInfo.desc || issueInfo.desc === ''" style="height: 300px;">
              <empty>
                <template v-slot:text>暂无任务介绍</template>
              </empty>
            </div>
            <div v-else>
              <h3 style="margin-bottom: 10px;">任务介绍</h3>
              <div v-html="issueInfo.desc" style="min-height: 200px;" />
            </div>
          </div>
        </div>
        <!-- 编辑界面 -->
        <div v-else>
          <el-input v-model="editData.name" placeholder="请输入任务名称" class="content" @input="$forceUpdate()" />
          <h3 style="margin-bottom: 10px;">任务介绍</h3>
          <editor :content="editData.desc" @change="handleEditorChange" :height="400" />
        </div>

        <el-divider />
        <el-tabs v-model="activeTabName" type="card">
          <el-tab-pane label="评论区" name="comment">
            <div style="height: 280px;" v-if="commentData.length === 0">
              <empty>
                <template v-slot:text>暂无评论</template>
              </empty>
            </div>
            <div v-else>
              <div v-for="i in commentData" :key="i._id" style="padding: 5px;">
                <div style="margin: 20px 0;">来自<span style="font-weight: bold;">{{ ' ' + i.user.username + ' ' }}</span>的评论：</div>
                <div v-html="i.comment" style="margin: 20px 0;" />
                <div class="top-div">
                  <div class="date" style="margin-bottom: 0">{{ `发布于${getDate(i.create_at)} | 更新于${getDate(i.update_at)}` }}</div>
                  <div v-if="$store.state.user_info._id === i.user._id || $store.state.user_info.role === 'admin'">
                    <el-button @click="handleDeleteComment(i._id)" type="danger" size="mini">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
            <h3 style="margin:20px 0;">发表评论</h3>
            <editor :height="150" :content="commentContent" @change="handleCommentChange" />
            <div style="float: right; margin-top: 10px;">
              <el-button type="primary" @click="handleSubmitComment">发表</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="历史记录" name="history">
            <el-timeline>
              <el-timeline-item v-for="item in historyData" :key="item.id" :timestamp="getDate(item.create_at)" placement="top">
                <el-card>
                  <div class="top-div">
                    <span v-if="item.type === 'log'">{{ `${item.user.username} ${historyText[item.type]} ${getLog(item.value)}` }}</span>
                    <span v-else-if="item.type === 'estimate'">{{ `${item.user.username} ${historyText[item.type]} ${getLog(item.value)}` }}</span>
                    <span v-else>{{ `${item.user.username} ${historyText[item.type]}` }}</span>
                    <el-button size="mini" type="danger" v-if="$store.state.user_info.role === 'admin'" @click="handleDeleteHistory(item._id)">删除</el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="8" class="box">
        <div class="top-div" style="margin-bottom: 15px;">
          <el-dropdown @command="handleCommand">
            <el-button type="primary">
              {{ issueStates[issueInfo.state] }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in stateRule[issueInfo.state]" :key="item" :command="item">
                {{ issueStates[item] }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-button-group v-if="$store.state.user_info._id === (issueInfo.assigner ? issueInfo.assigner._id : '') || $store.state.user_info._id === (issueInfo.assignee ? issueInfo.assignee._id : '') || $store.state.user_info.role === 'admin'">
            <el-button icon="el-icon-edit" @click="handleShowLog" :disabled="!issueInfo.estimate" />
            <el-button icon="el-icon-s-tools" @click="handleShowEst" />
            <el-button icon="el-icon-delete" type="danger" v-if="$store.state.user_info.role === 'admin'" @click="handleDeleteIssue" />
          </el-button-group>
        </div>

        <h4 style="margin-bottom: 20px;">问题详细信息</h4>
        <el-form ref="form" :model="editData" label-width="80px" label-position="left">
          <el-form-item label="分配人">
            <span>{{ issueInfo.assigner ? issueInfo.assigner.username : '' }}</span>
          </el-form-item>
          <el-form-item label="指派给">
            <span v-if="!isEdit">{{ issueInfo.assignee ? issueInfo.assignee.username : '暂未指派' }}</span>
            <span v-else>
              <el-select v-model="editData.assignee" filterable @change="$forceUpdate()" clearable>
                <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </span>
          </el-form-item>
          <el-form-item label="任务类型">
            <span v-if="!isEdit">{{ issueInfo.type ? issueInfo.type.name : '' }}</span>
            <span v-else>
              <el-select v-model="editData.type" filterable @change="$forceUpdate()">
                <el-option v-for="item in typeOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </span>
          </el-form-item>
          <el-form-item label="优先级">
            <span v-if="!isEdit"><el-tag size="mini">{{ issueInfo.priority }}</el-tag></span>
            <span v-else>
              <el-radio-group v-model="editData.priority" size="small" @change="$forceUpdate()">
                <el-radio-button :label="1" />
                <el-radio-button :label="2" />
                <el-radio-button :label="3" />
                <el-radio-button :label="4" />
              </el-radio-group>
            </span>
          </el-form-item>
          <el-form-item label="预计耗时">
            <span class="estimate">{{ issueInfo.estimate ? getLog(issueInfo.estimate) : '-' }}</span>
          </el-form-item>
          <el-form-item label="时间追踪">
            <div style="width: 90%;">
              <div v-if="issueInfo.estimate">
                <el-progress :percentage="getPercent(issueInfo.logtime, issueInfo.estimate)" :show-text="false" />
                <div style="display: flex; justify-content: space-between;">
                  <div class="progress-text">{{ `已记录${getLog(issueInfo.estimate - issueInfo.logtime)}` }}</div>
                  <div class="progress-text">{{ `剩余${getLog(issueInfo.logtime)}` }}</div>
                </div>
              </div>
              <div v-else>
                <el-progress :percentage="0" :show-text="false" />
                <div class="progress-text" style="float: right;">暂无预计耗时</div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="所属冲刺">
            <span v-if="!isEdit">{{ issueInfo.sprint ? issueInfo.sprint.name : '-' }}</span>
            <span v-else>
              <el-select v-model="editData.sprint" filterable @change="$forceUpdate()" clearable>
                <el-option v-for="item in sprintOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </span>
          </el-form-item>
        </el-form>

        <el-divider />
        <div class="date">{{ `创建于 ${getDate(issueInfo.create_at)}` }}</div>
        <div class="date">{{ `更新于 ${getDate(issueInfo.update_at)}` }}</div>
      </el-col>
    </el-row>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="dialogData" label-position="left" label-width="80px" ref="dialogForm" :rules="rules">
        <el-form-item :label="dialogTitle === '记录时间' ? '记录时间' : '预估时间'" prop="input">
          <el-input v-model="dialogData.input" style="width: 220px;"/>
          <span style="padding: 0 10px">eg. 3w 4d 6h</span>
          <el-popover placement="bottom-start" width="300" trigger="hover">
            <div>时间单位： 周(w)，天(d)，小时(h)</div>
            <div style="margin-top: 10px;">转换标准： 1w = 5d, 1d = 8h</div>
            <i class="el-icon-question" slot="reference"/>
          </el-popover>
        </el-form-item>
      </el-form>
      <div>
        {{ `剩余时间：${getLog(issueInfo.logtime)}` }}
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitLog">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getIssueDataByID, updateIssue, deleteIssue } from '@/network/issue.js'
import { logHistory, getHistory, deleteHistory } from '@/network/history.js'
import { getComment, createComment, deleteComment } from '@/network/comment.js'
import { getTeamInfo } from '@/network/project.js'
import { getIssueType } from '@/network/issueType.js'
import { getSprintData } from '@/network/sprint.js'

import { formatHourtoLog, formatDate, formatLogtoHour } from '@/utils/index.js'

import Empty from '@/components/empty/Empty.vue'
import Editor from '@/components/wangEditor/index.vue'

export default {
  components: {
    Empty,
    Editor
  },
  data() {
    const validateEstimate = (rule, value, callback) => {
      // 只能输入数字和hdw、空格
      const reg = /^[(h|d|w)0-9\s]+$/
      const reg2 = /\d+(h|w|d)\d+(h|w|d)\d+(h|w|d)|\d+(h|w|d)\d+(h|w|d)|\d+(h|w|d)/
      if (value.trim() === '') {
        callback(new Error('输入内容不能为空'))
      } else if (!reg.test(value) || !reg2.test(value)) {
        callback(new Error('请输入正确的格式'))
      } else {
        callback()
      }
    }
    return {
      issueInfo: {},
      editData: {},
      historyData: [],
      commentData: [],
      personOption: [],
      typeOption: [],
      sprintOption: [],
      historyText: {
        create: '创建了任务',
        todo: '将任务状态修改为未开始',
        inprogress: '将任务状态修改为进行中',
        log: '记录工作时间',
        testing: '将任务状态修改为测试中',
        verified: '将任务状态修改为验收中',
        closed: '将任务状态修改为已关闭',
        update: '更新了任务信息',
        estimate: '修改任务预计耗时'
      },
      issueStates: { todo: '未开始', inprogress: '进行中', testing: '测试中', verified: '验收中', closed: '已关闭' },
      stateRule: { todo: ['inprogress', 'closed'],
        inprogress: ['todo', 'testing', 'closed'],
        testing: ['todo', 'verified'],
        verified: ['todo', 'closed'],
        closed: ['todo']
      },
      isEdit: false,
      activeTabName: 'comment',
      dialogVisible: false,
      dialogTitle: '',
      dialogData: { input: '' },
      rules: { input: { validator: validateEstimate, trigger: 'blur' }},
      commentContent: ''
    }
  },
  computed: {
    getLog() {
      return (input) => {
        const res = formatHourtoLog(Number(input), 8)
        let info = ''
        Object.keys(res).forEach(k => { info = info + res[k] + k })
        return info
      }
    },
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd hh:mm')
    },
    getPercent() {
      return (log, estimate) => {
        const num = estimate - log
        if (num === 0) return 0
        else {
          return parseInt((num / estimate) * 100)
        }
      }
    }
  },
  async mounted() {
    if (this.$route.query.id) {
      // 获取任务详情
      const data = await getIssueDataByID(this.$route.query.id)
      if (data && data.code === 0) {
        this.issueInfo = data.data
        // 获取历史记录
        const history = await getHistory(this.$route.query.id)
        if (history && history.code === 0) {
          this.historyData = history.data
        }
        // 获取评论
        const comment = await getComment(this.$route.query.id)
        if (comment && comment.code === 0) {
          this.commentData = comment.data
        }
        // 获取团队人员列表
        const teamData = await getTeamInfo(this.issueInfo.project._id)
        if (teamData && teamData.data && teamData.data.team) {
          teamData.data.team.forEach(i => {
            this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
          })
        }
        // 获取任务类型
        const types = await getIssueType()
        if (types && types.code === 0) {
          types.data.forEach(i => {
            this.typeOption.push({ value: i._id, label: i.name })
          })
        }
        // 获取冲刺信息
        const sprint = await getSprintData(0, ['new', 'running'], this.issueInfo.project._id)
        if (sprint && sprint.code === 0) {
          sprint.data.forEach(i => {
            this.sprintOption.push({ value: i._id, label: i.name })
          })
        }
      } else this.$router.replace('/404')
    } else {
      this.$router.replace('/404')
    }
  },
  methods: {
    handleEdit() {
      this.isEdit = true
      Object.keys(this.issueInfo).forEach(k => {
        if (k !== 'create_at' && k !== 'update_at' && k !== 'estimate') {
          if (this.issueInfo[k] && this.issueInfo[k]._id) {
            this.editData[k] = this.issueInfo[k]._id
          } else {
            this.editData[k] = this.issueInfo[k]
          }
        }
        this.editData.estimate = this.getLog(this.issueInfo.estimate)
      })
      if (!this.issueInfo.assignee) this.editData.assignee = ''
    },
    async handleSaveEdit() {
      this.$confirm('您是否确认修改任务信息？').then(async() => {
        // 获取data
        const data = {}
        Object.keys(this.editData).forEach(k => {
          if (k !== '_id') {
            data[k] = this.editData[k]
            if (k === 'sprint' || k === 'assignee') {
              if (this.editData[k] === '') {
                data[k] = null
              } else { data[k] = this.editData[k] }
            } if (k === 'estimate') {
              data[k] = formatLogtoHour(this.editData.estimate, 8)
            }
          }
        })
        // 更新任务
        const res = await updateIssue(this.editData._id, data)
        if (res && res.code === 0) {
          this.$message({ message: '更新成功', type: 'success' })
          this.isEdit = false
          // 获取任务详情
          await logHistory(this.issueInfo.project._id, this.editData._id, this.$store.state.user_info._id, 'update', null)
          const data = await getIssueDataByID(this.$route.query.id)
          if (data && data.code === 0) {
            this.issueInfo = data.data
          }
          // 获取历史记录
          const history = await getHistory(this.$route.query.id)
          if (history && history.code === 0) {
            this.historyData = history.data
          }
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    handleCancelEdit() {
      this.isEdit = false
    },
    async handleDeleteHistory(id) {
      await this.$confirm('您确定要删除这条历史记录吗').then(async() => {
        const data = await deleteHistory(id)
        if (data && data.code === 0) {
          this.$message({ message: '删除成功', type: 'success' })
          const history = await getHistory(this.$route.query.id)
          if (history && history.code === 0) {
            this.historyData = history.data
          }
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleEditorChange(content) {
      this.editData.desc = content
    },
    handleCommentChange(content) {
      this.commentContent = content
    },
    async handleCommand(command) {
      await this.$confirm(`您确定要修改任务状态为 ${this.issueStates[command]} 吗？`).then(async() => {
        const res = await updateIssue(this.issueInfo._id, { state: command })
        if (res && res.code === 0) {
          this.$message({ message: '更新成功', type: 'success' })
          // 获取任务详情
          await logHistory(this.issueInfo.project._id, this.issueInfo._id, this.$store.state.user_info._id, command, null)
          const data = await getIssueDataByID(this.$route.query.id)
          if (data && data.code === 0) {
            this.issueInfo = data.data
          }
          // 获取历史记录
          const history = await getHistory(this.$route.query.id)
          if (history && history.code === 0) {
            this.historyData = history.data
          }
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    handleShowLog() {
      this.dialogVisible = true
      this.dialogTitle = '记录时间'
      this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      this.dialogData.input = ''
    },
    handleShowEst() {
      this.dialogVisible = true
      this.dialogTitle = '修改预计耗时'
      this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      if (this.issueInfo.estimate) {
        this.dialogData.input = this.getLog(this.issueInfo.estimate)
      } else {
        this.dialogData.input = ''
      }
    },
    handleSubmitLog() {
      this.$refs.dialogForm.validate(async(valid) => {
        if (valid) {
          const time = formatLogtoHour(this.dialogData.input, 8)
          if (isNaN(time)) {
            this.$message({ message: '时间格式转换失败！', type: 'warning' })
            this.dialogVisible = false
            return
          }
          if (this.dialogTitle === '记录时间') {
            await this.$confirm(`您确定要记录工作时间吗？`).then(async() => {
              if (time > this.issueInfo.logtime) {
                this.$message({ message: '记录的时间大于剩余时间！', type: 'warning' })
              } else {
                const res = await updateIssue(this.issueInfo._id, { logtime: this.issueInfo.logtime - time })
                if (res && res.code === 0) {
                  this.$message({ message: '更新成功', type: 'success' })
                  // 获取任务详情
                  await logHistory(this.issueInfo.project._id, this.issueInfo._id, this.$store.state.user_info._id, 'log', time)
                  const data = await getIssueDataByID(this.$route.query.id)
                  if (data && data.code === 0) {
                    this.issueInfo = data.data
                  }
                  // 获取历史记录
                  const history = await getHistory(this.$route.query.id)
                  if (history && history.code === 0) {
                    this.historyData = history.data
                  }
                }
              }
            }).catch(() => {
              this.$message.info('已取消')
            })
          } else if (this.dialogTitle === '修改预计耗时') {
            await this.$confirm(`您确定要修改预计耗时吗？`).then(async() => {
              let res = {}
              if (this.issueInfo.estimate) {
                if (time < this.issueInfo.estimate - this.issueInfo.logtime) {
                  this.$message({ message: '预计耗时不能小于已记录时间！', type: 'warning' })
                } else if (time === this.issueInfo.estimate) {
                  this.$message({ message: '预计耗时未修改' })
                } else {
                  res = await updateIssue(this.issueInfo._id, { estimate: time, logtime: time - this.issueInfo.estimate + this.issueInfo.logtime })
                }
              } else {
                res = await updateIssue(this.issueInfo._id, { estimate: time, logtime: time })
              }
              if (res && res.code === 0) {
                this.$message({ message: '更新成功', type: 'success' })
                // 获取任务详情
                await logHistory(this.issueInfo.project._id, this.issueInfo._id, this.$store.state.user_info._id, 'estimate', time)
                const data = await getIssueDataByID(this.$route.query.id)
                if (data && data.code === 0) {
                  this.issueInfo = data.data
                }
                // 获取历史记录
                const history = await getHistory(this.$route.query.id)
                if (history && history.code === 0) {
                  this.historyData = history.data
                }
              }
            }).catch(() => {
              this.$message.info('已取消')
            })
          }
          this.dialogVisible = false
        }
      })
    },
    async handleDeleteIssue() {
      await this.$confirm(`您确定要删除该问题吗？`).then(async() => {
        const res = await deleteIssue(this.issueInfo._id)
        if (res && res.code === 0) {
          this.$router.go(-1)
          this.$message({ message: '删除成功', type: 'success' })
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async handleSubmitComment() {
      await this.$confirm(`您确定要发表评论吗？`).then(async() => {
        const res = await createComment(this.issueInfo.project._id, this.issueInfo._id, this.$store.state.user_info._id, this.commentContent)
        if (res && res.code === 0) {
          this.commentContent = ''
          this.$bus.$emit('clear-editor')
          this.$message({ message: '发表成功', type: 'success' })
          const comment = await getComment(this.issueInfo._id)
          if (comment && comment.code === 0) {
            this.commentData = comment.data
          }
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    async handleDeleteComment(id) {
      await this.$confirm(`您确定要删除这条评论吗？`).then(async() => {
        const res = await deleteComment(id)
        if (res && res.code === 0) {
          this.$message({ message: '删除成功', type: 'success' })
          const comment = await getComment(this.issueInfo._id)
          if (comment && comment.code === 0) {
            this.commentData = comment.data
          }
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    }
  }
}
</script>

<style lang="scss">
.el-progress-bar {
  margin-top: 15px;
}
</style>

<style lang="scss" scoped>
.box {
  padding: 20px;
  height: calc(100vh - 110px);
  overflow-y: scroll;
  .top-div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .content {
    margin-bottom: 20px;
  }
  .estimate {
    border-radius: 25px;
    background: #DCDFE6;
    padding: 3px 20px;
    font-size: 13px;
    font-weight: normal;
  }
  .progress-text {
    font-size: 12px;
    color: #909399;
    margin-top: -10px;
  }
  .date {
    font-size: 14px;
    margin-bottom: 15px;
    color: #909399;
  }
}
</style>
