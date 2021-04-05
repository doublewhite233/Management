<template>
  <div>
    <div ref="editorElem" style="text-align: left;" />
  </div>
</template>

<script>
import E from 'wangeditor'

export default {
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    this.editor = new E(this.$refs.editorElem)
    this.$nextTick(() => {
      this.editor.txt.html(this.content)
    })
    this.editor.config.onchange = (newHtml) => {
      this.$emit('change', newHtml)
    }
    this.editor.create()
  }
}
</script>

<style>

</style>
