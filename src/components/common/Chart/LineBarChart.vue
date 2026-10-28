<!-- 线、柱图组件 -->
<template>
  <div class="lineBarChart overflow-hidden flex-y gap5" :style="`width: 100%; height: ${height}`">
    <VChart v-show="data?.length" :loading="loading" :option="currOption" :loading-options="loadingOptions" class="flex-auto" autoresize @click="onChartClick" />
    <!-- 工具箱 -->
    <div class='tools flex-x x-middle gap10 em09'>
      <span v-if="onRefresh" class="pointer" @click="onRefresh"><ReloadOutlined /> {{ $t('common.refresh') }}</span>
      <a-checkbox v-if="!isEmpty && useShowLabel" v-model:checked="showLabel" size="small">{{ $t('common.showLabel') }}</a-checkbox>
    </div>
    <!-- 点击提示 -->
    <div v-if="!isEmpty && !!onItemClick" class="text-gray em09">
      <InfoCircleFilled />
      {{ clickTips ?? $t('common.clickTips') }}
    </div>
    <!-- 空数据提示 -->
    <div v-show="!data?.length" class="flex-y y-center h100p">
      <div class="mt10 bold em12 tc" style="margin-bottom: -10px;">{{ props.title }}</div>
      <div class="flex-auto flex-y-center">
        <a-empty :description="emptyText" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import dayjs from 'dayjs';
  import { use } from 'echarts/core'
  import { BarChart, LineChart } from 'echarts/charts';
  import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent, DataZoomComponent, MarkLineComponent } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers'
  import { merge } from 'lodash-es';
  import { ref, watchEffect } from 'vue';
  import VChart, { THEME_KEY } from 'vue-echarts';
  import { Empty } from 'ant-design-vue'
  import { useSettingStore } from '@/stores/setting-store';
  import { InfoCircleFilled, ReloadOutlined } from '@ant-design/icons-vue';
  import useThemeToken from '@/hooks/useThemeToken';

  use([LineChart, BarChart, CanvasRenderer, GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent, DataZoomComponent, MarkLineComponent])

  const { token } = useThemeToken()
  /**
   * 线形、柱形图通用组件
   * 全局统一默认配置，支持自定义配置增量覆盖
   * 支持设置目标线、最大阈值线、最小阈值线
   * 支持是否启用X轴缩放条
   * 支持加载中动画
   * 支持多个线、柱随意组合
   * 支持导出图片
   * 支持设置单位
   * 支持多个Y轴
   * 支持标题
   * 支持空数据状态展示
   * @returns
   */
  const props = defineProps({
    /** 图表标题 */
    title: { type: String, default: '' },
    /** 是否加载中 */
    loading: { type: Boolean, default: false },
    /** 图表数据，对象数组 */
    data: { type: Array },
    /** x轴字段名 */
    xField: { type: String, default: 'x' },
    /** y轴字段名, 多个表示有多个Y轴 */
    yFields: { type: Array, default: ['y'] },
    /** y轴字段对应的坐标轴索引 */
    yAxisIndexs: { type: Array, default: [0] },
    /** y轴类型数组，取值范围：'value', 'percent'，最多2个，配合 yAxisTypesIndexs 指定索引 */
    yAxisTypes: { type: Array, default: ['value'] },
    /** y轴保留小数位数 */
    yAxisDigits: { type: Array, default: [0, 0] },
    /** 系列类型，多个系列时，分别指定类型 */
    types: { type: Array, default: ['bar'] },
    /** y轴名称或名称数组 */
    yNames: { type: [String, Array], default: '' },
    /** 系列名称或名称数组，根据索引一一对应 */
    seriesNames: { type: Array, default: [] },
    /** 柱子颜色，多个系列时循环使用，不传则使用默认的 */
    colors: { type: Array, default: ['#3f62c9', '#ee6666', '#61bd5e', '#fac858', '#adc6ff', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'] },
    /** y轴单位, 或单位数组，根据索引一一对应 */
    units: { type: [String, Array], default: '' },
    /** 增量配置，可对默认配置进行覆盖 */
    option: Object,
    /** 设置最大值，大于该值显示红色 */
    maxValue: [Number, Function],
    /** 设置最小值，小于该值显示红色 */
    minValue: [Number, Function],
    /** 设置目标值，小于该值显示红色 */
    targetValue: Number,
    /** 目标值作用于哪个字段 */
    targetFields: Array,
    /** 是否使用圆角(柱形图) */
    useRadius: { type: Boolean, default: true },
    /** 圆角大小(柱形图) */
    radius: { type: Number, default: 6 },
    /** 是否使用曲线(线形图) */
    useSmooth: { type: Boolean, default: true },
    /** 是否使用X轴缩放条 */
    useDataZoom: { type: Boolean, default: false },
    /** 是否自动计算百分比，自动乘以100 */
    useCalcPercent: { type: Boolean, default: true },
    /** 是否使用切换显示数值 */
    useShowLabel: { type: Boolean, default: false },
    /** 默认是否显示数值 */
    defaultShowLabel: { type: Boolean, default: true },
    /** 是否只显示最大最小数据的数值 */
    showMinMaxLabel: { type: Boolean, default: false },
    /** 是否显示下载按钮 */
    showDownload: { type: Boolean, default: true },
    /** 图表高度 */
    height: { type: String, default: '100%' },
    /** 错误颜色 */
    errorColor: { type: String, default: '#fa5050' },
    /** 数据为空展示的文本 */
    emptyText: { type: String, default: 'No data' },
    /** 加载中相关配置，参考：https://echarts.apache.org/en/api.html#echartsInstance.showLoading opts */
    loadingOptions: { type: Object, default: () => ({ maskColor: 'rgba(0, 0, 0, .2)' }) },
    /** 可点击的提示 */
    clickTips: String,
    /** 柱子点击事件 */
    onItemClick: Function,
    /** 点击刷新按钮执行 */
    onRefresh: Function,
  });

  const getDataZoomDef = (length) => [
    {
      id: 'dataZoomX',
      type: 'slider',
      xAxisIndex: [0],
      filterMode: 'filter',
      start: length > 0 ? Number((100 - Math.min(50 / length, 1) * 100).toFixed(0)) : 0,
      end: 100,
      right: 5,
      minSpan: 5,
    },
  ];

  const showLabel = ref(props.defaultShowLabel);
  const currOption = shallowRef()
  const settingStore = useSettingStore();
  provide(THEME_KEY, settingStore.mode);
  const isLight = computed(() => settingStore.mode === 'light');
  const isEmpty = computed(() => !props.data?.length);
  
  function onChartClick (params) {
    if (props.onItemClick) {
      props.onItemClick(params)
    }
  }

  /** 多个Y轴配置，value|percent */
  const getYAxis = (type, yName, digit) => {
    return {
      value: {
        type: 'value',
        name: yName,
        alignTicks: true,
        axisLabel: {
          color: isLight.value ? 'black' : 'white',
          formatter: (value) => {
            value = Number(value).toFixed(digit);
            return `${value}`;
          },
        },
        scale: true, // true：刻度范围根据数据自动缩放，false：默认从 0 到最大，很难看出变化趋势
        min: function (value) {
          const min = Math.min(
            ...[props.minValue, props.maxValue, value.min, props.targetValue].filter(n => n || n === 0),
          );
          let minNum = min >= 0 ? min * 0.9 : min * 1.1
          minNum = minNum >= 0 && minNum < 10 ? 0 : minNum
          return Number(minNum).toFixed(digit);
        },
        // max: function (value: any) { // 不再统一设置，改为通过 option 自定义，通过手动计算设置最大值还存在一些兼容问题，如：双Y轴时，另外一个Y轴被影响
        //   const max = Math.max(...[maxValue, value.max, targetValue].filter(v => v !== undefined))
        //   return Number((max >= 0 ? max * 1.1 : max * 0.9)).toFixed(digit)
        // },
        nameTextStyle: {
          align: 'left',
          color: '#bbbbbb',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(155, 155, 155, 0.5)',
          },
        },
      },
      percent: {
        type: 'value',
        name: yName,
        alignTicks: true,
        axisLabel: {
          color: isLight.value ? 'black' : 'white',
          formatter: (value) => `${Number(value).toFixed(digit)}%    `,
        },
        min: function (value) {
          let min = Math.min(
            ...[props.maxValue, value.min, props.targetValue].filter((v) => v !== undefined),
          );
          min = min * 0.9;
          if (min < 1) min = 0;
          return min.toFixed(digit);
        },
        max: function (value) {
          let max = Math.max(
            ...[props.maxValue, value.max, props.targetValue].filter((v) => v !== undefined),
          );
          max = max * 1.1;
          if (max > 100) max = 100;
          return max.toFixed(digit);
        },
        scale: true, // true：刻度范围根据数据自动缩放，false：默认从 0 到最大，很难看出变化趋势
        nameTextStyle: {
          color: '#bbbbbb',
          padding: [0, 20, 0, 0],
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(155, 155, 155, 0.5)',
          },
        },
      },
    }[type];
  };

  watchEffect(() => {
    const dayReplaceStr = dayjs().format('YYYY-MM-DD ');
    const yearReplaceStr = dayjs().format('YYYY-');
    // 获取X轴数据
    const xData = props.data?.map((item) =>
      String(item[props.xField]).replace(dayReplaceStr, '').replace(yearReplaceStr, ''),
    );

    // 生成 series
    const series = props.yFields.map((yField, index) => {
      const type = props.types?.[index] ?? 'bar';
      const yAxisIndex = props.yAxisIndexs?.[index] ?? (props.yAxisTypes?.length === 2 ? index % 2 : 0);
      const isRate = props.yAxisTypes[yAxisIndex] === 'percent';
      const yDatas = props.data?.map(item => item[yField]) ?? []
      let min, max;
      if (yDatas.length && showLabel.value && props.showMinMaxLabel) {
        min = Math.min(...yDatas)
        max = Math.max(...yDatas)
      }
      return {
        name: props.seriesNames?.[index],
        type,
        smooth: props.useSmooth,
        cursor: props.onItemClick ? 'pointer' : 'default',
        yAxisIndex,
        label: {
          show: showLabel.value,
          position: 'top',
          color: isLight.value ? 'black' : 'white',
          rotate: xData?.length > 10 ? 35 : 0,
          // formatter: `{c}${Array.isArray(units) ? units[index] : units}`,
          overflow: 'breakAll',
        },
        tooltip: {
          valueFormatter: (value) =>
            value + (Array.isArray(props.units) ? props.units[index] : props.units),
        },
        barMaxWidth: 40,
        itemStyle: {
          color: ({ value }) => {
            if (props.maxValue && value > props.maxValue) return props.errorColor;
            if (props.minValue && value < props.minValue) return props.errorColor;
            if (props.targetFields && props.targetValue) {
              if (props.targetFields.includes(yField) && value < props.targetValue)
                return props.errorColor;
            } else if (props.targetValue && value < props.targetValue) {
              return props.errorColor;
            }
            return props.colors?.[index % props.colors?.length] ?? '#5470c6';
          },
          borderRadius: props.useRadius ? [props.radius, props.radius, 0, 0] : undefined,
        },
        markLine: {
          label: {
            fontSize: 11,
            position: 'insideEndTop',
            distance: [25, 5],
          },
          // symbolOffset: [
          //   [0, 0],
          //   [0, 0],
          // ],
          data: [
            props.targetValue
              ? {
                  name: '目标线',
                  yAxis: props.targetValue,
                  lineStyle: {
                    type: 'dashed',
                    color: props.errorColor,
                  },
                  label: {
                    color: props.errorColor,
                    formatter: `目标值：{c}`,
                  },
                }
              : null,
            props.maxValue
              ? {
                  name: '最大合理线',
                  yAxis: props.maxValue,
                  lineStyle: {
                    type: 'dashed',
                    color: 'orange',
                  },
                  label: {
                    color: 'orange',
                    formatter: `MAX：{c}`,
                  },
                }
              : null,
            props.minValue
              ? {
                  name: '最小合理线',
                  yAxis: props.minValue,
                  lineStyle: {
                    type: 'dashed',
                    color: 'orange',
                  },
                  label: {
                    color: 'orange',
                    formatter: `MIN：{c}`,
                  },
                }
              : null,
          ].filter(Boolean),
        },
        data: yDatas.map(d => {
          const value = Number(d ?? 0);
          return {
            value: isRate && props.useCalcPercent
              ? Number((value * 100).toFixed(2).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1'))
              : value,
            label: {
              show: (min || max) ? (d == min || d == max) : showLabel.value
            }
          }
        }) ?? [],
      };
    });

    const newOption = {
      // width: '100%',
      title: props.title
        ? {
            text: props.title,
            top: 'top',
            left: 'left',
            textStyle: {
              fontSize: 15,
              fontWeight: 'bold',
              color: isLight.value ? 'black' : 'white',
            },
          }
        : undefined,
      legend: {
        show: series.length > 1,
        top: props.title ? 20 : 0,
        textStyle: {
          color: isLight.value ? 'black' : 'white',
        },
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: {
          type: 'shadow',
        },
      },
      toolbox: {
        show: true,
        showTitle: false,
        tooltip: {
          confine: true,
          show: true,
          formatter: function (param) {
            return '<div>' + param.title + '</div>';
          },
        },
        top: -10,
        right: -10,
        feature: {
          saveAsImage: { show: props.showDownload, title: '保存为图片', backgroundColor: isLight.value ? 'white' : 'black' },
          // magicType: { show: true, type: ['line', 'bar'], title: { line: '切换为线形图', bar: '切换为柱形图'} },
          // restore: { show: true, title: '还原' },
        },
      },
      grid: {
        left: 10,
        right: 10,
        top: props.title ? 60 : 20,
        bottom: props.useDataZoom ? 60 : 10,
        outerBoundsContain: 'axisLabel',
      },
      backgroundColor: 'transparent',
      xAxis: {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(155, 155, 155, .2)'
          }
        },
        axisLabel: {
          color: isLight.value ? 'rgba(0, 0, 0, .8)' : 'rgba(255, 255, 255, .8)',
          rotate: xData?.length > 10 ? 35 : 0,
          formatter(value) {
            return String(value)?.length > 10
              ? value.replace(/^(.{5}).*(.{5})$/, '$1...$2')
              : value;
          },
        },
        data: xData,
      },
      dataZoom: props.useDataZoom ? getDataZoomDef(props.data?.length) : undefined,
      color: props.colors,
      yAxis: props.yAxisTypes?.map((ya, index) =>
        getYAxis(
          ya,
          Array.isArray(props.yNames) ? props.yNames[index] : props.yNames,
          props.yAxisDigits?.[index] ?? 0,
        ),
      ),
      series,
    };
    const mergeOptoin = merge(newOption, props.option);
    currOption.value = mergeOptoin
  });
</script>
<style lang="less" scoped>
.lineBarChart {
  position: relative;
  .tools {
    position: absolute;
    right: 20px;
    top: 5px;
    z-index: 10;
  }
}
</style>
