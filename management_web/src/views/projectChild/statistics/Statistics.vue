<template>
  <el-main class="main">
    <el-row>
      <el-col :span="6" v-for="item in chartData" :key="item.name">
        <el-card class="chart-card" @click.native="handleClickChart(item.name)">
          <img :src="require(`@/assets/charts/${item.img}`)" class="chart-card-img">
          <div class="chart-card-title">{{ item.name }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="60%">
      <v-chart class="chart" :option="option" ref="vueChart" />

      <span slot="footer">
        <el-button @click="handleDownload">下载图片</el-button>
        <el-button type="primary" @click="dialogVisible=false">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="详细信息" :visible.sync="selectDiaVisible" width="40%">
      <el-form :model="formData" :rules="rules" ref="dialogForm" label-position="left" label-width="80px" style="padding: 0 20px">
        <el-form-item label="选择冲刺" prop="sprint">
          <el-select v-model="formData.sprint" placeholder="请选择要查看的冲刺">
            <el-option v-for="i in sprintOptions" :key="i._id" :label="i.name" :value="i._id" />
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
  </el-main>
</template>

<script>
import { getDetailData, getDetailDataByType, getBurnDown, getBurnUp, getNewDaily } from '@/network/issue.js'
import { getSprintData } from '@/network/sprint.js'

import { formatDate } from '@/utils/index.js'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  components: {
    VChart
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      selectDiaVisible: false,
      sprintOptions: '',
      formData: { sprint: '' },
      rules: { sprint: [{ required: true, message: '请选择一个冲刺名称', trigger: 'blur' }] },
      chartData: [
        { name: '任务概况图(任务状态)', img: 'pie.png' },
        { name: '任务概况图(任务类型)', img: 'pie2.png' },
        { name: '燃尽图', img: 'burndown.png' },
        { name: '燃起图', img: 'burnup.png' },
        { name: '每日新增任务统计', img: 'bar.png' }
      ],
      option: {
        title: {
          text: '',
          left: 'center'
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
          data: []
        },
        series: [
          {
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  },
  async mounted() {
    this.$bus.$on('change-project', () => { this.fetchData() })
    this.fetchData()
  },
  destroyed() {
    this.$bus.$off('change-project')
  },
  methods: {
    async fetchData() {
      this.sprintOptions = []
      const data = await getSprintData(0, ['closed', 'running'], this.$route.query.id)
      if (data && data.code === 0) {
        this.sprintOptions = data.data
      }
    },
    handleDownload() {
      const link = this.$refs.vueChart.getDataURL()
      const $a = document.createElement('a')
      $a.setAttribute('href', link)
      $a.setAttribute('download', new Date().getTime() + '.png')
      $a.click()
    },

    async handleClickChart(name) {
      this.dialogTitle = name
      if (name === '任务概况图(任务状态)') {
        // 任务概况图(任务状态)
        const chart = await getDetailData(this.$route.query.id)
        if (chart && chart.code === 0) {
          // 清空原有echarts数据
          if (this.$refs.vueChart) this.$refs.vueChart.clear()
          this.option.series = []
          this.option.series[0] = { type: 'pie', data: [] }
          this.$delete(this.option, 'xAxis')
          this.$delete(this.option, 'yAxis')
          const issueStates = { todo: '未开始', inprogress: '进行中', testing: '测试中', verified: '验收中', closed: '已关闭' }
          this.option.legend.data = []
          Object.keys(issueStates).forEach(k => {
            this.option.series[0].data.push({ value: chart.data[k], name: issueStates[k] })
            this.option.legend.data.push(issueStates[k])
          })
          this.option.title.text = '任务概况图(任务状态)'
          this.option.series[0].radius = ['40%', '70%']
          this.option.series[0].center = ['50%', '60%']
          this.option.tooltip = { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' }
          this.option.series[0].emphasis = {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }

          this.dialogVisible = true
        } else this.$message({ message: '似乎出了一点问题...', type: 'error' })
      } else if (name === '任务概况图(任务类型)') {
        // 任务概况图(任务类型)
        const chart = await getDetailDataByType(this.$route.query.id)
        if (chart && chart.code === 0) {
          // 清空原有echarts数据
          if (this.$refs.vueChart) this.$refs.vueChart.clear()
          this.option.series = []
          this.option.series[0] = { type: 'pie', data: [] }
          this.option.legend.data = []
          this.$delete(this.option, 'xAxis')
          this.$delete(this.option, 'yAxis')
          if (chart.data[0] && chart.data[0].count) {
            chart.data.forEach(i => {
              this.option.series[0].data.push({ value: i.count, name: i.issuetype[0] && i.issuetype[0].name ? i.issuetype[0].name : i._id })
              this.option.legend.data.push(i.issuetype[0].name ? i.issuetype[0].name : i._id)
            })
          } else {
            chart.data.forEach(i => {
              this.option.series[0].data.push({ value: 0, name: i.name })
              this.option.legend.data.push(i.name)
            })
          }
          this.option.title.text = '任务概况图(任务类型)'
          this.option.series[0].radius = '55%'
          this.option.series[0].center = ['50%', '60%']
          this.option.tooltip = { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' }
          this.option.series[0].emphasis = {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }

          this.dialogVisible = true
        } else this.$message({ message: '似乎出了一点问题...', type: 'error' })
      } else if (name === '燃尽图') {
        // 燃尽图
        this.selectDiaVisible = true
        Object.keys(this.formData).forEach(k => { this.formData[k] = '' })
        this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      } else if (name === '燃起图') {
        // 燃起图
        this.selectDiaVisible = true
        Object.keys(this.formData).forEach(k => { this.formData[k] = '' })
        this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      } else if (name === '每日新增任务统计') {
        // 每日新增任务统计
        this.selectDiaVisible = true
        Object.keys(this.formData).forEach(k => { this.formData[k] = '' })
        this.$nextTick(() => { this.$refs.dialogForm.clearValidate() })
      }
    },

    async handleSubmit() {
      this.$refs.dialogForm.validate(async(valid) => {
        if (valid) {
          if (this.dialogTitle === '燃尽图') {
            const chart = await getBurnDown(this.formData.sprint)
            if (chart && chart.code === 0) {
              const legend = this.getTimeLime(chart.data.sprint.start_at, chart.data.sprint.end_at)
              const estimateData = [chart.data.totalEstimate]
              const trueData = [chart.data.totalEstimate]
              // 转换数据格式
              const logData = {}
              chart.data.data.forEach(d => {
                logData[d._id] = d.count
              })
              const perDay = chart.data.totalEstimate / legend.length
              legend.forEach(k => {
                estimateData.push((estimateData[estimateData.length - 1] - perDay).toFixed(2))
                if (Object.keys(logData).includes(k)) {
                  trueData.push(trueData[trueData.length - 1] - logData[k])
                } else trueData.push(trueData[trueData.length - 1])
              })
              estimateData[estimateData.length - 1] = 0
              // 清空原有echarts数据
              this.option.series = []
              this.option.legend.data = ['参考线(h)', '实际剩余工时(h)']
              this.option.series[0] = { type: 'line', data: [] }
              this.option.xAxis = {
                type: 'category',
                axisLabel: { interval: 0, rotate: 45 },
                data: JSON.parse(JSON.stringify(legend))
              }
              this.option.yAxis = { type: 'value' }
              this.option.tooltip = { trigger: 'axis' }
              this.option.series[0] = {
                name: '参考线(h)',
                type: 'line',
                data: estimateData
              }
              this.option.series[1] = {
                name: '实际剩余工时(h)',
                type: 'line',
                data: trueData
              }
              this.option.title.text = '燃尽图'

              this.dialogVisible = true
            } else this.$message({ message: '似乎出了一点问题...', type: 'error' })
          } else if (this.dialogTitle === '燃起图') {
            const chart = await getBurnUp(this.formData.sprint)
            if (chart && chart.code === 0) {
              const legend = this.getTimeLime(chart.data.sprint.start_at, new Date(chart.data.sprint.end_at) > new Date() ? new Date() : chart.data.sprint.end_at)
              const devData = {}
              const testData = {}
              const dev = []
              const test = []
              // 转换数据格式
              const logData = {}
              chart.data.data.forEach(d => {
                if (!logData[d._id.day]) logData[d._id.day] = {}
                logData[d._id.day][d._id.type] = d.count
              })
              legend.forEach(k => {
                if (Object.keys(logData).includes(k)) {
                  if (logData[k].testing) {
                    devData[k] = logData[k].testing
                  } else devData[k] = 0
                  if (logData[k].verified) {
                    testData[k] = logData[k].verified
                  } else testData[k] = 0
                } else {
                  devData[k] = 0
                  testData[k] = 0
                }
              })
              Object.keys(devData).forEach((i, index) => {
                if (index === 0) {
                  dev.push(devData[i])
                  test.push(testData[i])
                } else {
                  dev.push(dev[dev.length - 1] + devData[i])
                  test.push(test[test.length - 1] + testData[i])
                }
              })
              // 清空原有echarts数据
              this.option.series = []
              this.option.legend.data = ['开发完成', '测试完成']
              this.option.series[0] = { type: 'line', data: [] }
              this.option.xAxis = {
                type: 'category',
                axisLabel: { interval: 0, rotate: 45 },
                data: JSON.parse(JSON.stringify(legend))
              }
              this.option.yAxis = { type: 'value' }
              this.option.tooltip = { trigger: 'axis' }
              this.option.series[0] = {
                name: '开发完成',
                type: 'line',
                data: dev
              }
              this.option.series[1] = {
                name: '测试完成',
                type: 'line',
                data: test
              }
              this.option.title.text = '燃起图'

              this.dialogVisible = true
            } else this.$message({ message: '似乎出了一点问题...', type: 'error' })
          } else if (this.dialogTitle === '每日新增任务统计') {
            const chart = await getNewDaily(this.formData.sprint)
            if (chart && chart.code === 0) {
              const legend = this.getTimeLime(chart.data.sprint.start_at, new Date(chart.data.sprint.end_at) > new Date() ? new Date() : chart.data.sprint.end_at)
              const countData = []
              // 转换数据格式
              const logData = {}
              chart.data.data.forEach(d => {
                logData[d._id] = d.count
              })
              legend.forEach(k => {
                if (Object.keys(logData).includes(k)) {
                  countData.push(logData[k])
                } else countData.push(0)
              })
              // 清空原有echarts数据
              this.option.series = []
              this.option.legend.data = ['新建问题数']
              this.option.series[0] = { type: 'bar', data: [] }
              this.option.xAxis = {
                type: 'category',
                axisLabel: { interval: 0, rotate: 45 },
                data: JSON.parse(JSON.stringify(legend))
              }
              this.option.yAxis = { type: 'value' }
              this.option.tooltip = { trigger: 'axis' }
              this.option.series[0] = {
                name: '新建问题数',
                type: 'bar',
                data: countData
              }
              this.option.title.text = '每日新增任务统计'

              this.dialogVisible = true
            } else this.$message({ message: '似乎出了一点问题...', type: 'error' })
          }
          this.selectDiaVisible = false
        }
      })
    },

    getTimeLime(start, end) {
      const res = []
      let start_time = new Date(start)
      const end_time = new Date(end)
      start_time.setHours(0, 0, 0)
      while (start_time < end_time) {
        res.push(formatDate(start_time, 'yyyy-MM-dd'))
        const date = new Date(start_time)
        start_time = date.setDate(date.getDate() + 1)
      }
      return res
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  margin-top: 1px;
  height: calc(100vh - 111px);
}

.chart-card {
  margin: 15px;
  .chart-card-title {
    font-size: 14px;
    text-align: center;
    margin-top:20px;
  }
  .chart-card-img {
    width: 100%;
    max-height: 300px;
  }
}

.chart-card:hover {
  box-shadow: 5px 5px 5px #dddddd;
}

.chart {
  height: 400px;
}
</style>
