<template>
  <div class="content">
    <el-row>
      <el-col :span="18">
        <h3>{{ data.name }}</h3>
      </el-col>
      <el-col :span="6">
        <span style="float: right">{{ data.assignee ? `${data.assignee.username}(${data.assignee.mail})` : '暂未指派' }}</span>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="18">
        <span>{{ `重要程度：${data.priority} · 类型：${data.type.name}` }}</span>
      </el-col>
      <el-col :span="6">
        <span style="float: right" class="estimate">{{ data.logtime ? getLog(data.logtime) : '-' }}</span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { formatHourtoLog } from '@/utils/index.js'

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 10px 20px;
  border-bottom: 1px solid #DCDFE6;
}

.content:hover {
  background-color: #DCDFE6;
}

.estimate {
  border-radius: 25px;
  background: #ccc;
  padding: 3px 20px;
}
</style>
