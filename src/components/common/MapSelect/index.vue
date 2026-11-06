<!-- 地图选择位置组件（基于高德地图 JSAPI），支持 v-model:value 经纬度数组 / v-model:lng / v-model:lat 双向绑定，属性命名与 ant-design-vue 保持一致 -->
<!-- 用法：<MapSelect v-model:value="formData.location" :full-address="formData.address" /> -->
<script setup lang="ts">
import { load as loadAMap } from '@amap/amap-jsapi-loader'
import { message } from 'ant-design-vue'
import { stringStar } from '@/utils'
import type { AMapAutoComplete, AMapMapClickEvent, AMapMapInstance, AMapMarker, AMapNamespace, AMapPlaceSearch, AMapPoi } from './types'

interface Props {
  /** 经纬度数组，格式如：[113.26, 23.12] */
  value?: number[] | null
  /** 详细地址，用于回显展示，避免额外逆地理解析 */
  fullAddress?: string
  /** 是否禁用，禁用后只能预览经纬度、地址，不能弹出地图定位 */
  disabled?: boolean
  /** 是否只读，只读后能弹出地图查看，不能选择及改变地址 */
  readOnly?: boolean
  /** 是否允许清除已选位置 */
  allowClear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  fullAddress: '',
  disabled: false,
  readOnly: false,
  allowClear: true,
})

const emit = defineEmits<{
  (e: 'update:value', location: number[]): void
  (e: 'update:lng', lng: number | undefined): void
  (e: 'update:lat', lat: number | undefined): void
  (e: 'change', location: number[], address: string): void
}>()

/** 默认地图中心坐标（广州） */
const DEFAULT_LOCATION: number[] = [113.264013, 23.128053]

const visible = ref(false)
const searchKey = ref('')
const location = ref<number[]>([])
/** 弹窗内当前选中的地址 */
const address = ref('')
/** 已确认选中的坐标 */
const confirmLocation = ref<number[]>([])
/** 已确认选中的地址 */
const confirmAddress = ref('')

// 高德地图相关对象为原生实例，无需响应式，用普通变量持有
let amap: AMapNamespace | null = null
let map: AMapMapInstance | null = null
let autoComplete: AMapAutoComplete | null = null
let placeSearch: AMapPlaceSearch | null = null
let markers: AMapMarker[] = []
let geocoderReady = false

// 设置高德安全密钥，须在 JSAPI 加载前完成
window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_APP_GD_MAP_SECRET,
}

/**
 * 加载高德 JSAPI 及插件
 * loader 的类型声明返回 Promise<any>，此处统一收敛断言为组件内声明的命名空间类型
 * @param plugins 需要加载的插件列表，如 ['AMap.Geocoder']
 */
async function loadAMapJS(plugins: string[]): Promise<AMapNamespace> {
  amap = (await loadAMap({
    key: import.meta.env.VITE_APP_GD_MAP_KEY,
    version: '2.0',
    plugins,
  })) as unknown as AMapNamespace
  return amap
}

/** 确保 Geocoder 插件可用；loader resolve 后插件类可能延迟挂载，短轮询兜底 */
async function ensureGeocoder(): Promise<void> {
  if (geocoderReady && window.AMap?.Geocoder) {
    return
  }
  await loadAMapJS(['AMap.Geocoder'])
  for (let retry = 0; retry < 10 && !window.AMap?.Geocoder; retry++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 300))
  }
  if (!window.AMap?.Geocoder) {
    throw new Error('加载 Geocoder 模块出错')
  }
  geocoderReady = true
}

/**
 * 逆地理解析：根据经纬度获取详细地址
 * @param lnglat 经纬度数组 [经度, 纬度]
 * @returns 详细地址，参数不合法或解析失败返回空字符串
 */
async function getAddressByLnglat(lnglat: number[]): Promise<string> {
  if (!Array.isArray(lnglat) || lnglat.length !== 2) {
    return ''
  }
  try {
    await ensureGeocoder()
  } catch (err) {
    message.error((err as Error).message)
    return ''
  }
  const namespace = window.AMap
  if (!namespace) {
    return ''
  }
  return new Promise((resolve) => {
    const geocoder = new namespace.Geocoder({})
    geocoder.getAddress(lnglat, (status, result) => {
      resolve(status === 'complete' && result?.regeocode ? result.regeocode.formattedAddress : '')
    })
  })
}

/** 根据 value 同步当前选中值与地址回显 */
async function applyValue(val?: number[] | null): Promise<void> {
  const lnglat = Array.isArray(val) ? [...val] : []
  location.value = lnglat
  confirmLocation.value = [...lnglat]
  if (lnglat.length === 2) {
    address.value = props.fullAddress || (await getAddressByLnglat(lnglat))
  } else {
    address.value = ''
  }
  confirmAddress.value = address.value
}

/** 地图初始化（首次打开弹窗时加载 JSAPI 并创建地图，再次打开只移动中心点） */
async function initMap(): Promise<void> {
  const center = confirmLocation.value.length === 2 ? confirmLocation.value : DEFAULT_LOCATION
  if (map) {
    setMarker(center)
    map.setCenter(center)
    map.setZoom(location.value.length === 2 ? 15 : 8, true)
    return
  }
  try {
    const namespace = await loadAMapJS(['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.ToolBar', 'AMap.Geocoder'])
    map = new namespace.Map('mapContainer', {
      viewMode: '3D',
      zoom: confirmLocation.value.length === 2 ? 15 : 8,
      center,
      resizeEnable: true,
    })
    map.addControl(new namespace.Scale())
    map.addControl(new namespace.ToolBar())
    setMarker(center)
    if (!props.readOnly && !props.disabled) {
      initSearch(namespace, map)
      map.on('click', clickMapHandler)
    }
  } catch {
    message.error('地图加载失败，请检查网络或地图 Key 配置')
  }
}

/** 初始化关键字搜索：绑定 #searchInput 联想输入与地点查询 */
function initSearch(namespace: AMapNamespace, mapInstance: AMapMapInstance): void {
  autoComplete = new namespace.AutoComplete({ input: 'searchInput' })
  placeSearch = new namespace.PlaceSearch({ map: mapInstance })
  autoComplete.on('select', selectSiteHandle)
}

/** 选中联想搜索出的 POI 记录 */
function selectSiteHandle(e: { poi?: AMapPoi }): void {
  const poi = e.poi
  if (poi?.location) {
    location.value = [poi.location.lng, poi.location.lat]
    placeSearch?.setCity(poi.adcode)
    placeSearch?.search(poi.name)
    address.value = `${poi.district ?? ''}${poi.name}`
    searchKey.value = address.value
  } else {
    message.error('查询地址失败，请重新输入地址')
  }
}

/** 点击地图：取点击点经纬度、打点标记并逆解析地址 */
async function clickMapHandler(e: AMapMapClickEvent): Promise<void> {
  location.value = [e.lnglat.getLng(), e.lnglat.getLat()]
  setMarker(location.value)
  address.value = await getAddressByLnglat(location.value)
  searchKey.value = address.value
}

/** 添加点标记（先清除旧标记） */
function setMarker(lnglat: number[]): void {
  if (!amap || !map) {
    return
  }
  removeMarker()
  const marker = new amap.Marker({ position: lnglat })
  marker.setMap(map)
  markers.push(marker)
}

/** 移除已有标记 */
function removeMarker(): void {
  if (map && markers.length) {
    map.remove(markers)
  }
  markers = []
}

/** 确认选择：向父组件同步选中结果并关闭弹窗 */
function handleConfirm(): void {
  confirmLocation.value = [...location.value]
  confirmAddress.value = address.value
  emit('update:value', confirmLocation.value)
  emit('update:lng', confirmLocation.value[0])
  emit('update:lat', confirmLocation.value[1])
  emit('change', confirmLocation.value, confirmAddress.value)
  visible.value = false
}

/** 清除已选位置并同步给父组件 */
function handleClear(): void {
  location.value = []
  address.value = ''
  searchKey.value = ''
  handleConfirm()
}

/** 打开地图弹窗（禁用状态不响应），等待弹窗 DOM 渲染后再初始化地图 */
async function handleOpen(): Promise<void> {
  if (props.disabled) {
    return
  }
  visible.value = true
  await nextTick()
  void initMap()
}

/** 关闭地图弹窗 */
function handleClose(): void {
  visible.value = false
}

onMounted(() => {
  applyValue(props.value)
})

watch(
  () => props.value,
  (val) => {
    applyValue(val)
  }
)

onBeforeUnmount(() => {
  if (map) {
    map.destroy()
    map = null
  }
})
</script>

<template>
  <div class="map-select">
    <div>
      <a-popover>
        <template #content>
          <template v-if="confirmLocation && confirmLocation.length">
            <div>经纬度：[{{ confirmLocation.join(', ') }}]</div>
            <div>详细地址：{{ confirmAddress || '-' }}</div>
          </template>
          <template v-else-if="!disabled && !readOnly">
            请点击选择
          </template>
          <template v-else>
            暂无定位
          </template>
        </template>
        <span>
          <a :class="{ disabled }" @click="handleOpen">
            <template v-if="confirmAddress">
              {{ stringStar(confirmAddress, 5, 10, '.') }}
            </template>
            <template v-else>
              {{ disabled || readOnly ? '-' : '地图上选择' }}
            </template>
          </a>
        </span>
        <a-icon v-if="allowClear && confirmAddress && !disabled && !readOnly" type="close-circle" theme="filled" class="ml10" @click.stop="handleClear" />
      </a-popover>
    </div>
    <a-modal :title="readOnly ? '查看地点' : '选择地点'" :open="visible" :width="1200" @cancel="handleClose">
      <div>
        <div v-if="!readOnly" class="flex-x x-middle mb10">
          <div class="nowrap">关键字搜索：</div>
          <a-input v-model:value="searchKey" placeholder="请输入内容" id="searchInput" />
        </div>
        <div id="mapContainer" class="radius5" style="height:500px;" />
        <div class="tc mt10">
          当前经纬度：{{ location }}
        </div>
        <div class="tc mt10">
          当前地址：{{ address }}
        </div>
      </div>
      <template #footer>
        <span>
          <a-button @click="handleClose">取 消</a-button>
          <a-button v-if="!disabled && !readOnly" type="primary" @click="handleConfirm">确 定</a-button>
        </span>
      </template>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.map-select a.disabled {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

/* 地图关键字联想面板由 AMap JSAPI 动态注入 DOM，scoped 属性选择器无法命中，借助 :global 提升层级避免被弹窗遮挡 */
:global(.amap-sug-result) {
  z-index: 2999 !important;
}
</style>
