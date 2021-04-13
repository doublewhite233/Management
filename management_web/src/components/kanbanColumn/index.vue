<template>
  <div class="kanban-box">
    <span class="kanban-title">
      <slot name="title">Title</slot>
      <el-divider />
      <slot name="issues"></slot>
    </span>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
$background: #E4E7ED;
$text: #606266;
$border: #C0C4CC;

.el-divider {
  background-color: $border;
  margin-top: 10px;
  margin-bottom: 2px;
}

.kanban-box {
  background: $background;
  min-height: 500px;
  border-radius: 20px;
  padding: 20px 2px 10px 2px;
  margin: 10px 6px;
}

.kanban-title {
  color: $text;
  font-weight: bold;
  padding: 18px;
}
</style>
