/**
 * 高德地图 JSAPI 最小类型声明
 * 项目未安装 @amap/amap-jsapi-types，此处仅声明 MapSelect 组件用到的成员，避免使用 any
 */

/** 高德坐标对象 */
export interface AMapLngLat {
  lng: number
  lat: number
  getLng: () => number
  getLat: () => number
}

/** 地图点击事件 */
export interface AMapMapClickEvent {
  lnglat: AMapLngLat
}

/** 关键字联想返回的 POI 信息 */
export interface AMapPoi {
  name: string
  district?: string
  adcode: string
  location?: AMapLngLat
}

/** 地图实例 */
export interface AMapMapInstance {
  addControl: (control: unknown) => void
  on: (event: 'click', handler: (e: AMapMapClickEvent) => void) => void
  remove: (overlay: AMapMarker[]) => void
  setCenter: (center: number[]) => void
  setZoom: (zoom: number, immediately?: boolean, duration?: number) => void
  destroy: () => void
}

/** 点标记 */
export interface AMapMarker {
  setMap: (map: AMapMapInstance | null) => void
}

/** 逆地理编码 */
export interface AMapGeocoder {
  getAddress: (
    lnglat: number[],
    callback: (status: string, result: { regeocode?: { formattedAddress: string } } | null) => void
  ) => void
}

/** 关键字联想 */
export interface AMapAutoComplete {
  on: (event: 'select', handler: (e: { poi?: AMapPoi }) => void) => void
}

/** 地点查询 */
export interface AMapPlaceSearch {
  setCity: (adcode: string) => void
  search: (keyword: string) => void
}

/** 高德 JSAPI 命名空间（仅含本组件使用的成员） */
export interface AMapNamespace {
  Map: new (el: string, opts: Record<string, unknown>) => AMapMapInstance
  Marker: new (opts: { position: number[] }) => AMapMarker
  Scale: new () => unknown
  ToolBar: new () => unknown
  Geocoder: new (opts: Record<string, unknown>) => AMapGeocoder
  AutoComplete: new (opts: { input: string }) => AMapAutoComplete
  PlaceSearch: new (opts: { map: AMapMapInstance }) => AMapPlaceSearch
}

declare global {
  interface Window {
    /** 高德 JSAPI 命名空间，由 AMapLoader 加载后挂载 */
    AMap?: AMapNamespace
    /** 高德 JSAPI 安全密钥配置，须在 loader 加载前设置 */
    _AMapSecurityConfig?: { securityJsCode: string }
  }
}
