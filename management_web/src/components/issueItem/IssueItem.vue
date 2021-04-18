<template>
  <div :class="ishovercss ? 'content active' : 'content'" @click="handleClick">
    <el-row>
      <el-col :span="size === 'mini' ? 24 : 18">
        <div class="issue-title">{{ data.name }}</div>
      </el-col>
      <el-col :span="size === 'mini' ? 24 : 6">
        <div v-if="size === 'mini'" class="mini-text">{{ data.assignee ? `${data.assignee.username}(${data.assignee.mail})` : '暂未指派' }}</div>
        <span v-else style="float: right">{{ data.assignee ? `${data.assignee.username}(${data.assignee.mail})` : '暂未指派' }}</span>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="size === 'mini' ? 24 : 18">
        <span v-if="size === 'mini'">
          <div class="mini-text">{{ `重要程度：${data.priority}` }}</div>
          <div class="mini-text">{{ `类型：${data.type.name}` }}</div>
        </span>
        <span v-else>{{ `重要程度：${data.priority} · 类型：${data.type.name}` }}</span>
      </el-col>
      <el-col :span="size === 'mini' ? 24 : 6">
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
    },
    ishovercss: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'normal'
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
  },
  methods: {
    handleClick() {
      this.$router.push({ path: '/issue', query: { id: this.data._id }})
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 10px 20px;
  border-bottom: 1px solid #E4E7ED;
  background-color: #FFFFFF;
  border-radius: 10px;
  cursor: pointer;
}

.active:hover {
  background-color: #F2F6FC;
}

.issue-title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  padding-bottom: 7px;
}

.mini-text {
  font-size: 12px;
  padding: 4px 0;
  font-weight: normal;
}

.estimate {
  border-radius: 25px;
  background: #DCDFE6;
  padding: 3px 20px;
  font-size: 13px;
  font-weight: normal;
}
</style>
