import { useRender } from '@/components/crud/hooks/useRender.js'
import { useDict } from '@/hooks/useDict.js'
import axios from '@/api'
import { isEmpty } from '@/utils/index'
import { useDictStore } from '@/stores/dict-store.js'
import { SyncOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { h } from 'vue'

/**
 * 根据 field 配置渲染组件
 * 该组件的的目的是给所有通过 field 配置生成的组件添加统一的功能，如远程数据源、字典集成、表单联动逻辑、刷新按钮等
 */
export default defineComponent({
  props: {
    value: {}, // [Object, String, Number, Boolean, Array],
    field: {
      type: Object,
      required: true
    },
    isView: Boolean
  },
  setup (props) {
    /**
     * 以下是组件动态数据源获取逻辑
     * remote 说明如下：
     * url: '', // 获取动态数据源的地址
     * method: '', // 获取动态数据源的请求方式
     * params: {} // 获取动态数据源的参数，参数有可能是从表单中动态获取
     * autoRefresh: true, // 是否每次弹窗后自动刷新
     * converter: (res) => res // 数据源数据转换器，在查询到数据后可对数据进行修改
     */
    const { t } = useI18n()
    const dataSource = ref()
    const dictStore = useDictStore()
    const formData = inject('c-form.formData', {})
    const formRemotes = inject('c-form.formRemotes', {})
    let triggerRemote = null // 触发获取远程数据源的方法，刷新远程数据
    const modalVisible = inject('modal.visible', false)
    const remote = props.field.props?.remote
    let remoteParams = {}
    const dictType = props.field.props?.dictType
    const reg = /^\{(.+)\}$/ // 识别动态参数值，参数值为表单中某字段值，格式如：'{formData.type:required}'
    const isValid = ref(true) // 参数是否校验通过，有必填的需要等有值时才获取数据源，且必须所有必填字段都有值时才算校验通过
    const needWatch = ref(false) // 是否需要监听表单，有动态字段则需要
    let dyFields = [] // 动态字段收集
    // 如果使用了远程数据源
    if (remote) {
      // 填充动态参数，并收集动态字段
      remoteParams = getParamsFromFormData(remote.params)
      // 需要监听表单中的字段范围对象，此对象有变化才需要重新获取数据源
      const listenObj = computed(() => {
        return dyFields.map(field => formData[field])
      })
      // 收集获取远程数据源的方法，以在需要时再次调用
      formRemotes[props.field.fieldName] = () => {
        return getDataSource(remoteParams)
      }
      triggerRemote = async () => {
        await formRemotes[props.field.fieldName]()
        message.success(t('crud.refreshSuccess'))
      }
      // 需要每次弹窗时刷新一次
      if (remote.autoRefresh) {
        watch(
          () => modalVisible.value,
          (visible) => {
            if (visible) {
              remoteParams = getParamsFromFormData(remote.params)
              getDataSource(remoteParams)
            }
          }
        )
      }
      // 需要监听动态字段
      if (needWatch.value) {
        // 监听必要字段，重新设置查询参数并判断是否需要重新获取数据源，避免监听整个表单
        watch(
          () => listenObj.value,
          () => {
            remoteParams = getParamsFromFormData(remote.params)
            // 是否满足重新获取数据源条件，只要有一个必填字段为空，则不满足
            if (isValid.value) {
              getDataSource(remoteParams)
            }
          },
          { deep: true, immediate: true }
        )
      } else { // 没有需要监听的动态字段，直接获取
        getDataSource(remoteParams)
      }
    } else if (dictType) { // 如果使用了数据字典
      useDict([dictType], dict => {
        dataSource.value = dictStore.dictMap[dictType]
        watch(
          () => dictStore.dictMap[dictType],
          (val) => {
            dataSource.value = val
          },
          { deep: true }
        )
      })
      triggerRemote = async () => {
        await dictStore.initDictByTypes([dictType], {[dictType]: { force: true }})
        message.success(t('crud.refreshSuccess'))
      }
    }

    /** 获取动态数据源 */
    async function getDataSource (_params) {
      const result = await axios[remote.method ?? 'post'](remote.url, _params)
      if (typeof remote.converter === 'function') {
        dataSource.value = remote.converter(result)
      } else {
        dataSource.value = result
      }
      // 数据源发生变化，选中值需要做修改（部分组件如 eCustom 组件且数据源是树形数据时存在问题）
      // if (props.field.type !== EControlType.eTreeSelect) {
      //   if (isEmpty(dataSource.value) || (props.value && !dataSource.value.some(item => item.id === props.value))) {
      //     if (import.meta.env.VITE_APP_DEBUG_MODE === 'true') {
      //       console.log('数据源为空或不存在所选的值，清空选中，字段：', props.field.fieldName, '值', props.value)
      //     }
      //     formData[props.field.fieldName] = undefined // 当前列表中没有该值，则清空选中
      //   }
      // }
      return dataSource.value
    }

    // 根据表单数据，动态填充查询参数，顺便收集动态字段及校验
    function getParamsFromFormData (_params) {
      const data = {}
      needWatch.value = false
      isValid.value = true
      dyFields = []
      for (const key in _params) {
        const value = remote.params[key]
        if (typeof value === 'string' && reg.test(value)) { // 代表是动态参数，需要从表单中取值
          needWatch.value = true // 有动态字段，需要监听
          const str = value.match(reg)[1]
          const paramsName = str.match(/formData\.([^:]+)/)[1]
          dyFields.push(paramsName) // 收集动态字段
          const paramsIsRequired = /.+:required/.test(str) // 参数是否必填
          data[key] = formData[paramsName]
          if (paramsIsRequired && isEmpty(data[key])) {
            isValid.value = false // 只要有一个字段校验不通过，则整个参数校验不通过
          }
        } else {
          data[key] = value
        }
      }
      return data
    }
    // 返回
    return { dataSource, getDataSource, triggerRemote }
  },
  render () { // 组件的数据改变会触发重新渲染
    const { renderByField } = useRender({
      ctx: this,
      isView: this.isView,
      value: this.value,
      dataSource: this.dataSource
    })
    const vNode = renderByField(this.field)
    const { t } = useI18n()
    let useRefresh = true
    // 以下两种控件，默认不显示刷新按钮，手动设置除外
    if ([EControlType.eRadio, EControlType.eCheckbox].includes(this.field.type)) {
      useRefresh = false
    }
    useRefresh = this.field.props?.useRefresh ?? useRefresh
    if (this.triggerRemote && useRefresh !== false && !this.isView) {
      // 给有动态数据源的组件，添加刷新功能
      return h(resolveComponent('a-input-group'), { compact: true, class: 'nowrap' }, {
        default: () => [
          h(vNode, { style: 'width: calc(100% - 32px)' }),
          h(
            resolveComponent('a-button'),
            { title: t('crud.refreshData'), onClick: this.triggerRemote },
            {
              icon: () => h(SyncOutlined, { class: 'em08 text-gray' })
            }
          )
        ]
      })
    } else {
      return vNode
    }
  }
})
