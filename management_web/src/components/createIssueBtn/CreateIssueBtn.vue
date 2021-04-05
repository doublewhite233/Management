<template>
  <div>
    <el-button icon="el-icon-plus" @click="handleClick">创建任务</el-button>

    <el-dialog title="创建任务" :visible.sync="dialogVisible" width="60%">
      <el-form :model="editData" :rules="rules" label-position="left" ref="dialogForm" style="padding: 0 20px">
        <el-form-item label="任务名称" label-width="80px" prop="name">
          <el-input v-model="editData.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="任务类型" label-width="80px" prop="type">
          <el-select v-model="editData.type" placeholder="请选择">
            <el-option v-for="i in issueType" :key="i._id" :value="i._id" :label="i.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" label-width="80px">
          <el-radio-group v-model="editData.priority" size="small">
            <el-radio-button :label="1" />
            <el-radio-button :label="2" />
            <el-radio-button :label="3" />
            <el-radio-button :label="4" />
          </el-radio-group>
          <el-popover placement="top-start" width="200" trigger="hover" content="优先级数字越小，则代表任务越重要。">
            <i class="el-icon-question" style="margin-left: 10px;" slot="reference"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="问题描述" label-width="80px">
          <editor @change="handleEditorChange" :content="editData.desc" />
        </el-form-item>
        <el-form-item label="指派给" label-width="80px">
          <el-select v-model="editData.assignee" filterable remote :remote-method="getPersonList" :loading="loading">
            <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计耗时" label-width="80px" prop="estimate">
          <el-input v-model="editData.estimate" style="width: 220px;"/>
          <span style="padding: 0 10px">eg. 3w 4d 6h</span>
          <el-popover placement="top-start" width="300" trigger="hover">
            <div>时间单位： 周(w)，天(d)，小时(h)</div>
            <div style="margin-top: 10px;">转换标准： 1w = 5d, 1d = 8h</div>
            <i class="el-icon-question" slot="reference"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="截止日期" label-width="80px">
          <el-date-picker v-model="editData.due_at" type="datetime"/>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatLogtoHour } from '@/utils/index.js'
import { getUserData } from '@/network/user.js'
import { getIssueType } from '@/network/issueType.js'
import { createIssue } from '@/network/issue.js'

import Editor from '@/components/wangEditor/index.vue'

export default {
  components: {
    Editor
  },
  props: {
    sprint: {
      type: String,
      default: ''
    }
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
      dialogVisible: false,
      editData: { name: '', type: '', priority: 3, desc: '', assignee: '', estimate: '', due_at: '' },
      issueType: [],
      loading: false,
      personOption: [],
      rules: {
        name: { required: true, message: '请输入任务名称', trigger: 'blur' },
        type: { required: true, message: '请选择任务类型', trigger: ['blur', 'change'] },
        estimate: { validator: validateEstimate, trigger: 'blur' }
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const types = await getIssueType()
      this.issueType = types.data
    },

    handleClick() {
      this.dialogVisible = true
    },
    handleEditorChange(content) {
      this.editData.desc = content
    },
    async getPersonList(query) {
      this.loading = true
      this.personOption = []
      const users = await getUserData(query.trim())
      if (users && users.code === 0) {
        users.data.forEach(i => {
          this.personOption.push({ value: i._id, label: `${i.username}(${i.mail})` })
        })
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
      }
      this.loading = false
    },
    async handleSubmit() {
      this.$refs.dialogForm.validate(async(valid) => {
        if (valid) {
          const submitData = {}
          Object.keys(this.editData).forEach(k => {
            if (this.editData[k] !== '' && this.editData[k] !== undefined && this.editData[k] !== null) {
              this.$set(submitData, k, this.editData[k])
            }
          })
          if (submitData.estimate) {
            submitData.estimate = formatLogtoHour(submitData.estimate, 8)
            submitData.logtime = submitData.estimate
          }
          this.$set(submitData, 'assigner', this.$store.state.user_info._id)
          this.$set(submitData, 'project', this.$store.state.project_info._id)
          this.$set(submitData, 'sprint', this.sprint === '' ? null : this.sprint)
          const res = await createIssue(submitData)
          if (res && res.code === 0) {
            this.$emit('success')
            this.$message({ message: '新建任务成功', type: 'success' })
          } else {
            this.$message({ message: '新建任务失败！', type: 'error' })
          }
        }
        this.dialogVisible = false
      })
    }
  }
}
</script>
