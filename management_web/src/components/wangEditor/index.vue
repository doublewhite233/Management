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
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    this.$bus.$on('clear-editor', this.clear)
    this.editor = new E(this.$refs.editorElem)
    this.editor.zIndex.baseZIndex = 100
    this.editor.config.height = this.height
    this.$nextTick(() => {
      this.editor.txt.html(this.content)
    })
    this.editor.config.onchange = (newHtml) => {
      this.$emit('change', newHtml)
    }
    this.editor.create()
  },
  destroyed() {
    this.$bus.$off('clear-editor', this.clear)
  },
  methods: {
    clear() {
      this.editor.txt.html('<p><br></p>')
    }
  }
}
</script>

<style>

</style>
