<!-- 地图选择位置组件，拷贝于旧项目，后续有时间再优化 -->
<!-- <MapSelect v-model="formData.location" /> -->
<!-- <MapSelect v-model:lng="formData.lng" v-model:lat="formData.lat" /> -->
<template>
  <div class="map-select">
    <div>
      <a-popover>
        <template slot="content">
          <template v-if="confirmLoacation && confirmLoacation.length">
            <div>经纬度：[{{ confirmLoacation.join(', ') }}]</div>
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
          <a :disabled="disabled" @click="open">
            <template v-if="confirmAddress">
              {{ stringStar(confirmAddress, 5, 10, '.') }}
            </template>
            <template v-else>
              {{ disabled || readOnly ? '-' : '地图上选择' }}
            </template>
          </a>
        </span>
        <a-icon v-if="allowClear && confirmAddress && !disabled && !readOnly" type="close-circle" theme="filled" class="ml10" @click.stop="onClearHandle" />
      </a-popover>
    </div>
    <a-modal :title="readOnly ? '查看地点' : '选择地点'" :visible="visible" :width="1200" @cancel="close">
      <div>
        <div v-if="!readOnly" class="flex-x x-middle mb10">
          <div class="nowrap">关键字搜索：</div>
          <a-input
            v-model="searchKey"
            placeholder="请输入内容"
            id="searchInput"
          />
        </div>
        <div id="mapContainer" class="radius5" style="height:500px;"></div>
        <div class="tc mt10">
          当前经纬度：{{ location }}
        </div>
        <div class="tc mt10">
          当前地址：{{ address }}
        </div>
      </div>
      <span slot="footer">
        <a-button @click="close">取 消</a-button>
        <a-button v-if="!disabled && !readOnly" type="primary" @click="submit">确 定</a-button>
      </span>
    </a-modal>
  </div>
</template>
<script>
import AMapLoader from '@amap/amap-jsapi-loader' // 引入AMapLoader
import { stringStar } from '@/utils/index.js'

window._AMapSecurityConfig = {
  // 设置安全密钥
  securityJsCode: import.meta.env.VITE_APP_GD_MAP_SECRET
}
export default {
  props: {
    modelValue: Array, // 经纬度数组，格式如：[113, 23]
    fullAddress: String, // 地址，用于展示、回显时设置，避免额外去解析
    disabled: Boolean, // 是否禁用，禁用后只能预览，查看经纬度、地址，不能弹出地图定位
    readOnly: Boolean, // 是否只读，只读后能预览并弹出地图定位，不能选择及改变地址
    allowClear: { type: Boolean, default: true }
  },
  data () {
    return {
      loading: false,
      visible: false,
      searchKey: '',
      map: null,
      autoComplete: null,
      placeSearch: null,
      defaultLocation: [113.264013, 23.128053],
      location: [], // 当前选中的坐标
      address: '', // 当前选中的地址
      markers: [],
      geocoderInited: false,
      confirmLoacation: [], // 确认选中的坐标
      confirmAddress: '' // 确认选中的地址
    }
  },
  unmounted () {
    this.map && this.map.destroy()
  },
  watch: {
    modelValue (val) {
      this.setValue(val)
    }
  },
  methods: {
    async setValue (val) {
      this.location = val
      this.confirmLoacation = val
      if (val && val.length === 2) {
        await this.initGeocoder()
        if (this.fullAddress) {
          this.address = this.fullAddress
        } else {
          this.address = await this.getAddressByLnglat(val)
        }
        this.confirmAddress = this.address
      } else {
        this.address = ''
      }
      this.confirmAddress = this.address
    },
    async initGeocoder () {
      if (window.AMap && AMap.Geocoder) {
        return Promise.resolve()
      }
      return new Promise((resolve, reject) => {
        if (!this.geocoderInited) {
          this.geocoderInited = true
          AMapLoader.load({
            key: import.meta.env.VITE_APP_GD_MAP_KEY, // 申请好的Web端开发者Key，首次调用 load 时必填
            version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: ['AMap.Geocoder']
          }).then(() => {
            let time = 10 // 每 300 毫秒检测一次 Geocoder 是否加载好，最多检测 10 次
            // 延迟原因：then 后，不能立即拿到 AMap.Geocoder
            let timer = setInterval(() => {
              time--
              if (AMap && AMap.Geocoder) {
                clearInterval(timer)
                resolve()
              }
              if (time <= 0) {
                clearInterval(timer)
              }
            }, 300)
            resolve()
          }).catch(e => {
            reject(new Error('加载 Geocoder 模块出错'))
          })
        } else {
          resolve()
        }
      })
    },
    // 地图初始化
    initMap () {
      const centerLocation = this.confirmLoacation.length === 2 ? this.confirmLoacation : this.defaultLocation
      if (!this.map) {
        this.initGeocoder()
        AMapLoader.load({
          key: config.GD_MAP_KEY, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: ['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.ToolBar']
        }).then(AMap => {
          this.map = new AMap.Map('mapContainer', {
            // 设置地图容器id
            viewMode: '3D', // 是否为3D地图模式
            zoom: this.modelValue && this.modelValue.length === 2 ? 15 : 8, // 初始化地图级别
            center: centerLocation, // 中心点坐标
            resizeEnable: true
          })
          this.map.addControl(new AMap.Scale())
          this.map.addControl(new AMap.ToolBar())
          // 创建标记
          this.setMarker(centerLocation)
          if (!this.readOnly && !this.disabled) {
            // 关键字查询
            this.searchMap()
            // 监听鼠标点击事件
            this.map.on('click', this.clickMapHandler)
          }
        }).catch(e => {
          console.log(e)
        })
      } else {
        // 创建标记
        this.setMarker(centerLocation)
        // 将标记显示在地图中心
        this.map.setCenter(centerLocation)
        // 设置缩放层级 setZoom(zoom, immediately, duration) immediately：是否立即跳转到目标级别(不使用动画)
        this.map.setZoom(this.location && this.location.length === 2 ? 15 : 8, true)
      }
    },
    // 关键字查询
    searchMap () {
      // 搜索框自动完成类
      this.autoComplete = new AMap.AutoComplete({
        input: 'searchInput' // 使用联想输入的input的id
      })
      // 构造地点查询类
      this.placeSearch = new AMap.PlaceSearch({
        map: this.map
      })
      // 当选中某条搜索记录时触发
      this.autoComplete.on('select', this.selectSite)
    },
    // 选中查询出的记录
    selectSite (e) {
      // console.log('选择回调数据：', e)
      if (e.poi.location) {
        this.location = [e.poi.location.lng, e.poi.location.lat]
        this.placeSearch.setCity(e.poi.adcode)
        this.placeSearch.search(e.poi.name) // 关键字查询
        this.address = e.poi.district + e.poi.name
        this.searchKey = this.address
      } else {
        this.$message.error('查询地址失败，请重新输入地址')
      }
    },
    // 点击地图事件获取经纬度，并添加标记
    async clickMapHandler (e) {
      this.location = [e.lnglat.getLng(), e.lnglat.getLat()]
      this.setMarker(this.location)
      // 点击地图上的位置，根据经纬度转换成详细地址
      this.address = await this.getAddressByLnglat(this.location)
      this.searchKey = this.address // 把查询到的地址赋值到输入框
    },
    getAddressByLnglat (lnglat) {
      if (!lnglat || !Array.isArray(lnglat) || lnglat.length !== 2) {
        return Promise.resolve()
      }
      return new Promise((resolve, reject) => {
        let geocoder = new window.AMap.Geocoder({})
        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.regeocode) {
            const address = result.regeocode.formattedAddress
            resolve(address)
          } else {
            reject(new Error(`经纬度[${lnglat}]解析失败`))
          }
        })
      })
    },
    // 添加标记
    setMarker (lnglat) {
      this.removeMarker()
      let marker = new AMap.Marker({
        position: lnglat
      })
      marker.setMap(this.map)
      this.markers.push(marker)
    },
    // 删除之前后的标记点
    removeMarker () {
      if (this.map && this.markers) {
        this.map.remove(this.markers)
      }
    },
    onClearHandle () {
      this.location = []
      this.address = ''
      this.submit()
    },
    submit () {
      this.confirmLoacation = this.location
      this.confirmAddress = this.address
      this.$emit('update:modelValue', this.confirmLoacation)
      this.$emit('update:lng', this.confirmLoacation[0])
      this.$emit('update:lat', this.confirmLoacation[1])
      this.$emit('change', this.confirmLoacation, this.confirmAddress)
      this.close()
    },
    open () {
      this.visible = true
      this.initMap()
    },
    close () {
      this.visible = false
    }
  }
}
</script>

<style lang="scss">
.amap-sug-result {
  z-index: 2999 !important;
}
</style>
