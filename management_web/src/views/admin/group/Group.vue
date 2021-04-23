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
                <el-button type="primary" @click="handleCreate" style="margin-top:20px">点击创建部门</el-button>
              </template>
            </empty>
          </div>
          <div v-else>
            <el-tree :data="treeData" default-expand-all @node-click="handleNodeClick" :expand-on-click-node="false">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span>
                  <el-button type="text" size="mini" @click.stop="handleEditDia(data)">编辑</el-button>
                </span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :span="20">
        <el-card style="margin-left: 20px;">
          <div slot="header"><span>下级部门</span></div>
          <div style="display: flex; justify-content: center; align-items: center;">
            <span style="cursor: pointer" @click="handleChangeDepartment('')">企业<i class="el-icon-arrow-right" /></span>
            <span v-if="inputDepartment[0]">
              <span v-for="i in inputDepartment[0].parent" :key="i._id" @click="handleChangeDepartment(i._id)"  style="cursor: pointer">{{ i.name }}<i class="el-icon-arrow-right" /></span>
            </span>
            <div>
              <div v-for="item in inputDepartment" :key="item._id">
                <div style="display: flex; align-items: center;">
                  <el-input v-model="item.name" style="width: 200px; margin: 5px 0;" />
                  <el-button size="mini" style="margin-left: 10px" @click="handleEdit(item)">保存编辑</el-button>
                  <el-button size="mini" type="danger" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 20px;">
            <el-button type="primary" @click="handleAdd">添加部门</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :rules="rules" :model="departmentForm" label-position="left" label-width="80px" ref="departmentForm" style="padding: 0 20px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="departmentForm.leader" filterable remote :remote-method="getPersonList" :loading="loading" style="width: 100%;" clearable>
            <el-option v-for="item in personOption" :key="item.value" :label="item.label" :value="item.value" />
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
import { getDepartment, createDepartment, updateDepartment, deleteDepartment } from '@/network/department.js'
import { getUserData } from '@/network/user.js'

import Empty from '@/components/empty/Empty'

export default {
  components: {
    Empty
  },
  data() {
    return {
      departmentInfo: [],
      treeData: [],
      dialogVisible: false,
      dialogTitle: '',
      departmentForm: { id: '', name: '', leader: '', leaderName: '' },
      personOption: [],
      loading: false,
      rules: { name: { required: true, message: '请输入部门名称', trigger: 'blur' }},
      activeNode: '',
      inputDepartment: []
    }
  },
  async mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getDepartment(null)
      if (res && res.code === 0) {
        this.departmentInfo = res.data
        this.treeData = []
        this.departmentInfo.forEach(i => {
          // 判断是否为顶层节点
          if (i.parent.length === 0) {
            const parent = { id: i._id, label: i.name, leader: (i.leader && i.leader.username) ? i.leader.username : '' }
            parent.children = this.getTreeChild(i._id, this.departmentInfo)
            this.treeData.push(parent)
          }
          // 初始化下级部门
          this.inputDepartment = this.getDepartment(this.activeNode)
        })
      } else {
        this.$message({ message: '似乎出了一点问题...', type: 'error' })
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
    getDepartment(id) {
      const array = []
      if (id === '') {
        this.departmentInfo.forEach(i => {
          if (i.parent.length === 0) {
            array.push(i)
          }
        })
      } else {
        const item = this.departmentInfo.find(i => i._id === id)
        if (item.parent.length === 0) {
          this.departmentInfo.forEach(i => {
            if (i.parent.length === 0) {
              array.push(i)
            }
          })
        } else {
          this.departmentInfo.forEach(i => {
            if (i.parent.length > 0 && i.parent[i.parent.length - 1]._id === item.parent[item.parent.length - 1]._id) {
              array.push(i)
            }
          })
        }
      }
      return array
    },

    handleNodeClick(data) {
      if (data.children && data.children.length > 0) {
        this.activeNode = data.children[0].id
        this.inputDepartment = this.getDepartment(data.children[0].id)
      } else {
        // 当前节点
        const item = JSON.parse(JSON.stringify(this.departmentInfo.find(i => i._id === data.id)))
        item.parent.push({ name: data.label, _id: data.id })
        this.inputDepartment = []
        this.inputDepartment.push({ name: '', parent: item.parent })
      }
    },
    handleCreate() {
      this.dialogVisible = true
      this.dialogTitle = '创建部门'
      Object.keys(this.departmentForm).forEach(i => { this.departmentForm[i] = '' })
      this.$nextTick(() => { this.$refs.departmentForm.clearValidate() })
    },
    handleEditDia(data) {
      this.dialogVisible = true
      this.dialogTitle = '修改部门信息'
      this.departmentForm.id = data.id
      this.departmentForm.name = data.label
      this.departmentForm.leader = data.leader
      this.departmentForm.leaderName = data.leader
      this.$nextTick(() => { this.$refs.departmentForm.clearValidate() })
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
    handleChangeDepartment(id) {
      this.activeNode = id
      this.inputDepartment = this.getDepartment(id)
    },
    async handleSubmit() {
      this.$refs.departmentForm.validate(async(valid) => {
        if (valid) {
          if (this.dialogTitle === '创建部门') {
            await this.$confirm(`您确定要创建新部门吗？`).then(async() => {
              const data = await createDepartment({ name: this.departmentForm.name, leader: this.departmentForm.leader && this.departmentForm.leader !== '' ? this.departmentForm.leader : null })
              if (data && data.code === 0) {
                this.$message({ message: '创建成功', type: 'success' })
                await this.fetchData()
              } else {
                this.$message({ message: '似乎出了一点问题...', type: 'error' })
              }
            }).catch(() => {
              this.$message.info('已取消')
            })
          } else {
            // 修改信息
            await this.$confirm(`您确定要修改部门信息吗？`).then(async() => {
              const submitData = {}
              submitData.name = this.departmentForm.name
              if (this.departmentForm.leader !== this.departmentForm.leaderName) submitData.leader = this.departmentForm.leader
              const data = await updateDepartment(this.departmentForm.id, { name: submitData.name, leader: submitData.leader === '' ? null : submitData.leader })
              if (data && data.code === 0) {
                this.$message({ message: '更新成功', type: 'success' })
                await this.fetchData()
              } else {
                this.$message({ message: '似乎出了一点问题...', type: 'error' })
              }
            }).catch(() => {
              this.$message.info('已取消')
            })
          }
          this.dialogVisible = false
        }
      })
    },

    handleAdd() {
      const parent = this.inputDepartment[0].parent
      this.inputDepartment.push({ name: '', parent })
    },
    async handleEdit(item) {
      await this.$confirm(`您确定要保存编辑吗？`).then(async() => {
        if (item.name.trim() === '') {
          this.$message.info('部门名称不能为空!')
        } else {
          if (!item._id) {
            // 新建
            const parent = []
            item.parent.forEach(p => parent.push(p._id))
            const data = await createDepartment({ name: item.name, parent })
            if (data && data.code === 0) {
              this.$message({ message: '创建成功', type: 'success' })
              await this.fetchData()
            } else {
              this.$message({ message: '似乎出了一点问题...', type: 'error' })
            }
          } else {
            const data = await updateDepartment(item._id, { name: item.name })
            if (data && data.code === 0) {
              this.$message({ message: '更新成功', type: 'success' })
              await this.fetchData()
            } else {
              this.$message({ message: '似乎出了一点问题...', type: 'error' })
            }
          }
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    async handleDelete(item) {
      await this.$confirm(`您确定要删除该部门吗？`).then(async() => {
        const data = await deleteDepartment(item._id)
        if (data && data.code === 0) {
          this.$message({ message: '删除成功', type: 'success' })
          this.activeNode = ''
          await this.fetchData()
        } else {
          this.$message({ message: '似乎出了一点问题...', type: 'error' })
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
