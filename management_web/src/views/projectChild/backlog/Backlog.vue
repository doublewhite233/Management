<template>
  <el-main v-loading="$store.state.loading" class="main">
    <el-row style="margin-bottom: 20px;">
      <el-col :span="10">
        <el-select placeholder="输入人员进行查找" v-model="searchList" filterable multiple reserve-keyword clearable style="width: 100%">
          <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <el-collapse v-model="activeNames">

      <el-collapse-item v-for="i in sprintList" :key="i._id" :name="i._id">
        <div class="collaspse-title" slot="title">
          <span>{{ i.name }}</span>
          <span v-if="$store.state.user_info.role === 'admin'">
            <el-button-group class="util" style="margin-left: 10px">
              <el-button type="info" plain icon="el-icon-edit" @click.stop="handleEditSprint(i)"></el-button>
              <el-button type="danger" icon="el-icon-delete" @click.stop="handleDeleteSprint(i._id, i.name)"></el-button>
            </el-button-group>
            <el-button v-if="i.state === 'new'" class="util" @click.stop="handleStartSprint(i)">开始冲刺</el-button>
            <el-button v-else class="util" type="primary">结束冲刺</el-button>
          </span>
        </div>

        <span v-if="i.state === 'running'">{{ `起止日期： ${getDate(i.start_at)} - ${getDate(i.end_at)}` }}</span>

        <div v-if="!issueInfo[i._id]" style="height: 300px"><empty /></div>

        <div v-else style="margin-bottom: 10px;">
          <div v-for="item in issueInfo[i._id]" :key="item._id" @contextmenu.prevent="rightClickIssue = item._id">
            <issueItem :data="item" :ishovercss="true" v-contextmenu:sprint />
          </div>
        </div>
        <v-contextmenu ref="sprint">
            <v-contextmenu-item @click="handleMove(null)">
              移入代办需求
            </v-contextmenu-item>
          </v-contextmenu>

        <createIssueBtn @success="fetchData($store.state.project_info._id)" :sprint="i._id" />
      </el-collapse-item>

      <el-collapse-item name="backlog">
        <div class="collaspse-title" slot="title">
          <span>代办需求 Backlog</span>
          <el-button plain @click.stop="handleCreateSprint" class="util" v-if="$store.state.user_info.role === 'admin'">创建冲刺</el-button>
        </div>
        <div v-if="!issueInfo.null" style="height: 300px"><empty /></div>
        <div v-else style="margin-bottom: 10px;">
          <div v-for="item in issueInfo.null" :key="item._id" @contextmenu.prevent="rightClickIssue = item._id">
            <issueItem :data="item" :ishovercss="true" v-contextmenu:backlog />
          </div>
          <span/>

          <v-contextmenu ref="backlog">
            <v-contextmenu-item v-for="i in sprintList" :key="i._id" :name="i._id" @click="handleMove(i._id)">
              {{`移入 ${i.name} `}}
            </v-contextmenu-item>
          </v-contextmenu>
        </div>
        <createIssueBtn @success="fetchData($store.state.project_info._id)" />
      </el-collapse-item>
    </el-collapse>

    <el-button type="primary" icon="el-icon-s-promotion" round id="helpBtn" @click="helpVisible = true">快速上手</el-button>
    <el-dialog title="快速上手" :visible.sync="helpVisible" width="50%">
      <div class="help-context">代办需求是团队需要在特定迭代中解决的一系列活动或问题。项目的所有问题均按待办事项和冲刺进行分组。</div>
      <div class="help-context">向待办事项中添加任务,首先需要创建一个任务。</div>
      <div class="help-context">单击任务，查看任务详情。右键点击任务，可以对任务进行移动。</div>
    </el-dialog>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="editData" :rules="rules" label-position="left" ref="dialogForm" style="padding: 0 20px">
        <el-form-item label="冲刺名称" label-width="80px" prop="name">
          <el-input v-model="editData.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="持续时间" label-width="80px" prop="duration">
          <el-select v-model="editData.duration">
            <el-option label="2周" value="2w" />
            <el-option label="3周" value="3w" />
            <el-option label="1个月" value="1m" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" label-width="80px" prop="start_at">
          <el-date-picker v-model="editData.start_at" type="datetime" placeholder="选择日期时间" :disabled="this.dialogTitle !== '开始冲刺'" />
        </el-form-item>
        <el-form-item label="结束时间" label-width="80px">
          <el-date-picker v-model="editData.end_at" type="datetime" placeholder="选择日期时间" disabled/>
        </el-form-item>
        <el-form-item label="冲刺目标" label-width="80px">
          <el-input v-model="editData.goal" type="textarea" :rows="4" placeholder="请输入冲刺目标" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
  </el-main>
</template>

<script>
import { getSprintData, createSprint, deleteSprint, updateSprint } from '@/network/sprint.js'
import { getTeamInfo } from '@/network/project.js'
import { getIssueData, moveIssueSprint } from '@/network/issue.js'
import { logHistory } from '@/network/history.js'
import { SET_LOADING_STATE } from '@/store/mutation-types.js'
import { formatDate, debounce } from '@/utils/index.js'

import issueItem from '@/components/issueItem/IssueItem.vue'
import createIssueBtn from '@/components/createIssueBtn/CreateIssueBtn.vue'
import Empty from '@/components/empty/Empty'

export default {
  components: {
    issueItem,
    createIssueBtn,
    Empty
  },
  data() {
    const checkStart_at = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('开始时间不能为空'))
      }
      callback()
    }
    return {
      sprintList: [],
      issueInfo: {},
      rightClickIssue: '', // 右键点击后的issue id
      activeNames: ['backlog'],
      helpVisible: false,
      dialogVisible: false,
      dialogTitle: '',
      editData: { name: '', duration: '2w', start_at: '', end_at: '', goal: '' },
      searchList: [],
      personOption: [],
      rules: {
        name: { required: true, message: '请输入冲刺名称', trigger: 'blur' },
        duration: { required: true, message: '请选择持续时间', trigger: 'blur' }
      },
      addRules: { start_at: { validator: checkStart_at, trigger: 'blur' }}
    }
  },
  computed: {
    loading() {
      return this.$store.state.loading
    },
    getDate() {
      return (date) => formatDate(date, 'yy/MM/dd hh:mm')
    }
  },
  watch: {
    async loading(val, oldVal) {
      if (val) {
        await this.fetchData(this.$store.state.project_info._id)
      }
    },
    'editData.start_at': {
      handler: function(val) {
        if (val !== '' && val !== null && val !== undefined) {
          this.editData.end_at = new Date(this.editData.start_at)
          if (this.editData.duration === '2w') {
            this.editData.end_at.setDate(this.editData.end_at.getDate() + 14)
          } else if (this.editData.duration === '3w') {
            this.editData.end_at.setDate(this.editData.end_at.getDate() + 21)
          } else if (this.editData.duration === '1m') {
            this.editData.end_at.setMonth(this.editData.end_at.getMonth() + 1)
          }
        } else { this.editData.end_at = '' }
      }
    },
    'editData.duration': {
      handler: function() {
        if (this.editData.start_at !== '' && this.editData.start_at !== null && this.editData.start_at !== undefined) {
          this.editData.end_at = new Date(this.editData.start_at)
          if (this.editData.duration === '2w') {
            this.editData.end_at.setDate(this.editData.end_at.getDate() + 14)
          } else if (this.editData.duration === '3w') {
            this.editData.end_at.setDate(this.editData.end_at.getDate() + 21)
          } else if (this.editData.duration === '1m') {
            this.editData.end_at.setMonth(this.editData.end_at.getMonth() + 1)
          }
        }
      }
    },
    searchList: {
      handler() {
        this.debounceInput(this)
      },
      deep: true
    }
  },
  async mounted() {
    if (this.$store.state.project_info._id !== '') {
      await this.fetchData(this.$store.state.project_info._id)
      // 获取成员列表
      const teamData = await getTeamInfo(this.$store.state.project_info._id)
      if (teamData && teamData.data && teamData.data.team) {
        teamData.data.team.forEach(i => {
          this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
        })
      }
      // 如果有正在进行中的sprint，打开collapse
      this.sprintList.find(i => {
        if (i.state === 'running') {
          if (this.activeNames.indexOf(i._id) === -1) {
            this.activeNames.push(i._id)
          }
        }
        return i.state === 'running'
      })
    }
  },
  methods: {
    async fetchData(project) {
      // 获取sprint信息
      const { data } = await getSprintData(0, ['new', 'running'], project)
      this.$store.commit(SET_LOADING_STATE, false)
      this.sprintList = data
      const sprintids = [null]
      this.sprintList.forEach(i => sprintids.push(i._id))
      // 根据project sprint信息获取任务信息并分类
      const issueRes = await getIssueData(project, sprintids, this.searchList)
      this.issueInfo = {}
      issueRes.data.forEach(item => {
        if (!this.issueInfo[item.sprint]) {
          this.issueInfo[item.sprint] = []
        }
        this.issueInfo[item.sprint].push(item)
      })
    },
    async handleCreateSprint() {
      await this.$confirm('您确定要新建一个冲刺吗？').then(async() => {
        const res = await createSprint('New Sprint', this.$store.state.project_info._id)
        if (res && res.code === 0) {
          this.$message({ message: res.data, type: 'success' })
        } else {
          this.$message({ message: '新建冲刺失败！', type: 'error' })
        }
        await this.fetchData(this.$store.state.project_info._id)
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    async handleDeleteSprint(id, name) {
      await this.$confirm(`您确定要删除${name}吗？`).then(async() => {
        const res = await deleteSprint(id)
        if (res && res.code === 0) {
          this.$message({ message: res.data, type: 'success' })
        } else {
          this.$message({ message: '删除冲刺失败！', type: 'error' })
        }
        await this.fetchData(this.$store.state.project_info._id)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleStartSprint(item) {
      this.dialogVisible = true
      this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      this.dialogTitle = '开始冲刺'
      if (this.rules.start_at === undefined) {
        this.rules = Object.assign({}, this.rules, this.addRules)
      }
      Object.keys(this.editData).forEach(k => {
        if (item[k] !== undefined) {
          this.editData[k] = item[k]
        } else { this.editData[k] = '' }
      })
      this.editData._id = item._id
    },
    handleEditSprint(item) {
      this.dialogVisible = true
      this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      this.dialogTitle = '编辑冲刺信息'
      if (this.rules.start_at !== undefined) {
        this.$delete(this.rules, 'start_at')
      }
      Object.keys(this.editData).forEach(k => {
        if (item[k] !== undefined) {
          this.editData[k] = item[k]
        } else { this.editData[k] = '' }
      })
      this.editData._id = item._id
    },
    async handleSubmit() {
      this.$refs.dialogForm.validate(async(valid) => {
        if (valid) {
          const formData = {}
          let flag = true
          if (this.dialogTitle === '开始冲刺') {
            await this.$confirm('您确定要开始这个冲刺吗？')
            this.$set(formData, 'state', 'running')
            if (this.sprintList.find(k => k.state === 'running')) flag = false
          }
          if (flag) {
            Object.keys(this.editData).forEach(k => {
              if (k === 'start_at' || k === 'end_at') {
                if (this.editData[k] !== '' && this.editData[k] !== null && this.editData[k] !== undefined) {
                  this.$set(formData, k, this.editData[k])
                }
              } else { this.$set(formData, k, this.editData[k]) }
            })
            const data = await updateSprint(formData)
            if (data && data.code === 0) {
              this.$message({ message: '操作成功！', type: 'success' })
            } else {
              this.$message({ message: '似乎出了一点问题...', type: 'error' })
            }
          } else {
            this.$message({ message: '现在已经有一个冲刺在进行中，请结束后再开始其他冲刺！', type: 'warning' })
          }
          this.dialogVisible = false
          await this.fetchData(this.$store.state.project_info._id)
        }
      })
    },

    async handleMove(sprint) {
      const data = await moveIssueSprint(this.rightClickIssue, sprint)
      if (data && data.code === 0) {
        this.$message({ message: '移动成功！', type: 'success' })
        await logHistory(this.$store.state.project_info._id, this.rightClickIssue, this.$store.state.user_info._id, 'update', null)
        await this.fetchData(this.$store.state.project_info._id)
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
    },

    debounceInput: debounce(async(that) => {
      await that.fetchData(that.$store.state.project_info._id)
    }, 500)
  }
}
</script>

<style lang="scss" scoped>
.v-contextmenu-item{
    padding: 10px;
}

.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}

.collaspse-title {
  flex: 1 0 90%;
  order: 1;
  font-size: 18px;
}

.util {
  float: right;
  margin-top: 4px;
}

#helpBtn {
  position: fixed;
  right: 50px;
  bottom: 10%;
}

.help-context {
  margin: 0 10px 20px 10px;
  font-size: 16px;
}
</style>
