<template>
  <el-main v-loading="$store.state.loading" style="margin-top: 1px">
    <issueItem />
    <el-collapse>
      <el-collapse-item title="一致性 Consistency" name="1">
        <draggable v-model="dataList">
          <div v-for="i in dataList" :key="i">{{ i }}</div>
        </draggable>
      </el-collapse-item>
      <el-collapse-item title="反馈 Feedback" name="2">
        <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
        <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
      </el-collapse-item>
    </el-collapse>
  </el-main>
</template>

<script>
import draggable from 'vuedraggable'

import issueItem from '@/components/issueItem/IssueItem.vue'

export default {
  components: {
    draggable,
    issueItem
  },
  data() {
    return {
      dataList: ['a', 'b']
    }
  },
  computed: {
    loading() {
      return this.$store.state.loading
    }
  },
  watch: {
    loading(val, oldVal) {
      console.log(val, oldVal)
    }
  }
}
</script>
