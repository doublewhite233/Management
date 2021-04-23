<template>
  <el-main>
    <div>
      <el-row type="flex" justify="space-between">
        <el-col :span="10">
          <el-input placeholder="请输入邮箱或用户名进行查询" v-model="search.text">
            <el-button slot="append" icon="el-icon-search" @click="fetchData"/>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleCreate" style="float: right" :loading="loading">新建用户</el-button>
        </el-col>
      </el-row>

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
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="handleUpdate(scope.row)" size="mini">修改</el-button>
            <el-button @click="handleDelete(scope.row._id)" type="danger" size="mini">删除</el-button>
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
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="userForm" :rules="rules" label-position="left" label-width="80px" ref="userForm" style="padding: 0 20px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="邮箱" prop="mail" v-if="this.dialogTitle === '新建用户'" key="mail">
          <el-input v-model="userForm.mail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="this.dialogTitle === '新建用户'" key="password">
          <el-input v-model="userForm.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-radio-group v-model="userForm.role" size="small">
            <el-radio-button :label="'user'" />
            <el-radio-button :label="'admin'" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="userForm.department">
            <el-option v-for="item in departmentOption" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
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
import { getAdminData, createUser, updateUser, deleteUser } from '@/network/user.js'
import { getDepartment } from '@/network/department.js'
import { formatDate } from '@/utils/index.js'
import { encryptAES } from '@/utils/secret.js'

export default {
  data() {
    const validateMail = (rule, value, callback) => {
      const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (value.trim() === '') {
        callback(new Error('邮箱不能为空'))
      } else if (!regex.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      userData: [],
      page: { total: 1, currentPage: 1, size: 10, totalCount: 0 },
      sort: { prop: 'update_at', order: 'descending' },
      search: { text: '' },
      dialogVisible: false,
      dialogTitle: '',
      departmentOption: [],
      userForm: { username: '', mail: '', password: '', role: 'user', department: '', _id: '' },
      rules: {
        username: { required: true, message: '请输入用户名', trigger: 'blur' },
        mail: [{ required: true, validator: validateMail, trigger: 'blur' }],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 18, message: '请输入6-18位密码', trigger: 'blur' }
        ]
      }
    }
  },
  async mounted() {
    await this.fetchData()

    // 获取部门信息
    const res = await getDepartment(null)
    if (res && res.code === 0) {
      res.data.forEach(k => {
        this.departmentOption.push({ label: k.name, value: k._id })
      })
    } else {
      this.$message({ message: '似乎出了一点问题...', type: 'error' })
    }
  },
  computed: {
    getDate() {
      return (date) => formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  methods: {
    async fetchData() {
      const res = await getAdminData((this.page.currentPage - 1) * this.page.size, this.sort.prop, this.sort.order === 'ascending' ? 1 : -1, this.search.text, null)
      if (res && res.code === 0) {
        this.userData = res.data
        this.page.total = res.total
        this.page.totalCount = res.totalCount
      }
    },

    handleCreate() {
      Object.keys(this.userForm).forEach(k => {
        if (k === 'role') {
          this.userForm[k] = 'user'
        } else {
          this.userForm[k] = ''
        }
      })
      this.personOption = []
      this.dialogVisible = true
      this.dialogTitle = '新建用户'
      this.$nextTick(() => { this.$refs.userForm.clearValidate() })
    },
    handleUpdate(data) {
      const tempArr = Object.keys(data)
      Object.keys(this.userForm).forEach(k => {
        if (tempArr.indexOf(k) !== -1) {
          this.userForm[k] = data[k]
        }
      })
      if (this.userForm.department === null) this.userForm.department = ''
      this.dialogVisible = true
      this.dialogTitle = '修改用户信息'
      this.$nextTick(() => { this.$refs.userForm.clearValidate() })
    },
    async handleDelete(id) {
      await this.$confirm('您确定要删除该用户吗？').then(async() => {
        const res = await deleteUser(id)
        if (res && res.code === 0) {
          this.$message({ message: res.data, type: 'success' })
        } else {
          this.$message({ message: '删除用户失败！', type: 'error' })
        }
        this.fetchData()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    handleSort(data) {
      // 回到第一页
      this.page.currentPage = 1
      this.$set(this.sort, 'prop', data.prop)
      this.$set(this.sort, 'order', data.order)
      this.fetchData()
    },
    async handleSubmit() {
      // 表单校验
      this.$refs.userForm.validate(async(valid) => {
        if (valid) {
          // 新建
          if (this.dialogTitle === '新建用户') {
            const data = await createUser(this.userForm.username, this.userForm.mail, encryptAES(this.userForm.password), this.userForm.role, this.userForm.department === '' ? null : this.userForm.department)
            if (data && data.code === 0) {
              this.$message({ message: data.data, type: 'success' })
            } else if (data && data.code === 2) {
              this.$message({ message: '登陆邮箱不能重复！', type: 'warning' })
            } else {
              this.$message({ message: '新建项目失败！', type: 'error' })
            }
          } else if (this.dialogTitle === '修改用户信息') {
            // 修改
            const formData = {}
            Object.keys(this.userForm).forEach(i => {
              if (i !== 'password' && i !== '_id') this.$set(formData, i, this.userForm[i])
            })
            if (formData.department === '') {
              formData.department = null
            }
            const data = await updateUser(this.userForm._id, formData)
            if (data && data.code === 0) {
              this.$message({ message: data.data, type: 'success' })
            } else {
              this.$message({ message: '修改项目失败！', type: 'error' })
            }
          }
          // 重新调用接口，刷新数据
          this.fetchData()
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>
