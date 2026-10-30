<!-- 饼、环型图表组件 -->
<template>
  <div class="flex-auto w100p overflow-hidden">
    <div v-if="!isEmptyData" class="common-pie-chart-container" :style="{ width, height }">
      <v-chart ref="chartRef" :loading="loading" :option="mergedOption" autoresize @click="onChartClick" />
      <!-- 总计 -->
      <div v-if="ringMode" class="pie-center-total">
        <div class="">{{ totalText ?? $t('common.total') }}</div>
        <div class="mt4 bold em12">{{ formatTotalValue(totalValue) }}</div>
      </div>
    </div>
    <!-- 空数据提示 -->
    <div v-else class="flex-y-center" :style="{ width, height }">
      <a-empty :description="emptyText ?? $t('common.noData')" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
    <!-- 点击提示 -->
    <div v-if="onItemClick && !isEmptyData" class="text-gray em09">
      <info-circle-filled />
      {{ clickTips ?? $t('common.clickTips') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'
import { use } from 'echarts/core'
import type { EChartsOption, PieSeriesOption } from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, ToolboxComponent } from 'echarts/components'
import { merge } from 'lodash-es'
import { Empty } from 'ant-design-vue'
import { colorsTypeBar } from '@/utils/color.constants'
import { useSettingStore } from '@/stores/setting-store'
import { useNumFormat } from '@/hooks/useNumFormat'
import { InfoCircleFilled } from '@ant-design/icons-vue'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent, ToolboxComponent])

/** 图表数据项，字段名由 nameField / valueField 指定 */
type PieDataItem = Record<string, unknown>

interface Props {
  /** 图表标题 */
  title?: string
  /** 图表数据 */
  data?: PieDataItem[]
  /** 名称字段 */
  nameField?: string
  /** 值字段 */
  valueField?: string
  /** 是否加载中 */
  loading?: boolean
  /** 保留小数位数 */
  digit?: number
  /** 单位 */
  unit?: string
  /** 空数据提示文本 */
  emptyText?: string
  /** 饼图扇形圆角 */
  borderRadius?: number
  /** 总计文本，默认总计 */
  totalText?: string
  /** 颜色列表 */
  colors?: string[]
  /** 内环半径，传入0则为实心圆 */
  innerRadius?: string | number
  /** 外环半径 */
  outerRadius?: string | number
  /** echarts option 增量配置，可覆盖默认配置 */
  option?: EChartsOption
  /** 饼图点击事件 */
  onItemClick?: ((params: unknown) => void) | null
  /** 饼图点击提示 */
  clickTips?: string
  /** 是否显示下载按钮 */
  showDownload?: boolean
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  nameField: 'name',
  valueField: 'value',
  loading: false,
  digit: 0,
  unit: '',
  borderRadius: 8,
  colors: () => colorsTypeBar,
  innerRadius: '50%',
  outerRadius: '75%',
  option: () => ({} as EChartsOption),
  onItemClick: null,
  showDownload: false,
  width: '100%',
  height: '200px',
})

const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const settingStore = useSettingStore()
const { numFormat } = useNumFormat()
provide(THEME_KEY, settingStore.mode)
const isLight = computed(() => settingStore.mode === 'light')
const ringMode = computed(() => !!props.innerRadius)
const isEmptyData = computed(() => {
  if (!Array.isArray(props.data) || props.data.length === 0) return true
  return !props.data.some(item => Number(item[props.valueField]) > 0)
})

const totalValue = computed(() => {
  return props.data.reduce((sum, item) => sum + Number(item[props.valueField] || 0), 0)
})

const formatTotalValue = (val: number): string => `${numFormat(val, { digit: props.digit })}${props.unit}`

const pieSeriesData = computed(() => {
  return props.data.map(item => ({
    name: String(item[props.nameField] ?? ''),
    value: Number(item[props.valueField] || 0),
  }))
})

const baseOption = computed<EChartsOption>(() => {
  const { borderRadius, innerRadius, outerRadius, title, colors, unit } = props
  const seriesItem: PieSeriesOption = {
    type: 'pie',
    radius: ringMode.value ? [innerRadius, outerRadius] : outerRadius,
    itemStyle: { borderRadius },
    data: pieSeriesData.value,
    label: { show: true, color: isLight.value ? 'black' : 'white', formatter: `{b}: {c}${unit}` },
    labelLine: { length: 0, length2: 0 },
    center: ['40%', '56%'],
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
    },
  }
  return {
    color: colors.length ? colors : undefined,
    backgroundColor: 'transparent',
    toolbox: {
      show: true,
      showTitle: false,
      tooltip: {
        confine: true,
        show: true,
        formatter: (param: unknown): string => `<div>${(param as { title?: string }).title}</div>`,
      },
      top: -10,
      right: -10,
      feature: {
        saveAsImage: { show: props.showDownload, title: '保存为图片', backgroundColor: isLight.value ? 'white' : 'black' },
      },
    },
    title: { text: title, textStyle: { color: isLight.value ? 'black' : 'white', fontSize: 15 }, left: 'left', top: 'top' },
    tooltip: { trigger: 'item', formatter: `{b}: {c}${unit} ({d}%)` },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: isLight.value ? 'black' : 'white' } },
    series: [seriesItem],
  }
})

const mergedOption = computed<EChartsOption>(() => merge({}, baseOption.value, props.option))

function onChartClick(params: unknown): void {
  if (props.onItemClick) {
    props.onItemClick(params)
  }
}
</script>

<style scoped>
.common-pie-chart-container {
  position: relative;
  width: 100%;
}
.pie-center-total {
  position: absolute;
  top: 56%;
  left: 40%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
</style>