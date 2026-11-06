/**
 * 根据 field 配置渲染组件
 * 该组件给所有通过 field 配置生成的组件添加统一功能，如远程数据源、字典集成、表单联动逻辑、刷新按钮等
 */
import { useRender } from '@/components/crud/hooks/useRender'
import { useDict } from '@/hooks/useDict'
import { useDictStore } from '@/stores/dict-store'
import { isEmpty } from '@/utils/index'
import type { IsEmptyValue } from '@/utils/index'
import { crudRequest } from '@/components/crud/utils/request'
import { EControlType } from '@/enum'
import { SyncOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { h } from 'vue'
import type { PropType, Ref, VNode } from 'vue'
import type {
  CrudComponentField,
  CrudFormData,
  FormRemotes,
  OptionItem,
  RemoteConfig
} from '@/components/crud/types'

export default defineComponent({
  name: 'CComponent',
  props: {
    /** 双向绑定的值，类型不限 */
    value: { type: null as unknown as PropType<unknown> },
    /** 字段配置 */
    field: { type: Object as PropType<CrudComponentField>, required: true },
    /** 是否查看模式 */
    isView: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const { t } = useI18n()
    const dataSource = ref<OptionItem[]>()
    const dictStore = useDictStore()
    const formData = inject<CrudFormData>('c-form.formData', {})
    const formRemotes = inject<FormRemotes>('c-form.formRemotes', {})
    const modalVisible = inject<Ref<boolean>>('modal.visible', ref(false))
    /** 触发获取远程数据源的方法，刷新远程数据 */
    let triggerRemote: (() => Promise<void>) | null = null
    const remote = props.field.props?.remote
    const dictType = props.field.props?.dictType
    /** 识别动态参数值，参数值为表单中某字段值，格式如：{formData.type:required} */
    const reg = /^\{(.+)\}$/
    /** 参数是否校验通过，必填字段都有值时才算校验通过 */
    const isValid = ref(true)
    /** 是否需要监听表单，有动态字段则需要 */
    const needWatch = ref(false)
    /** 动态字段收集 */
    let dyFields: string[] = []
    let remoteParams: Record<string, unknown> = {}

    if (remote) {
      // 填充动态参数，并收集动态字段
      remoteParams = getParamsFromFormData(remote.params)
      // 需要监听表单中的字段范围对象，此对象有变化才需要重新获取数据源
      const listenObj = computed(() => dyFields.map((field) => formData[field]))
      // 收集获取远程数据源的方法，以在需要时再次调用
      formRemotes[props.field.fieldName] = () => getDataSource(remoteParams)
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
              void getDataSource(remoteParams)
            }
          }
        )
      }
      // 需要监听动态字段
      if (needWatch.value) {
        watch(
          () => listenObj.value,
          () => {
            remoteParams = getParamsFromFormData(remote.params)
            // 只要有一个必填字段为空，则不满足重新获取数据源条件
            if (isValid.value) {
              void getDataSource(remoteParams)
            }
          },
          { deep: true, immediate: true }
        )
      } else {
        // 没有需要监听的动态字段，直接获取
        void getDataSource(remoteParams)
      }
    } else if (dictType) {
      // 如果使用了数据字典
      useDict([dictType], () => {
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
        await dictStore.initDictByTypes([dictType], { [dictType]: { force: true } })
        // 字典加载失败不会抛出异常（initDictByTypes 内部 allSettled），需按 errors 判断真实结果
        if (dictStore.errors[dictType]) {
          message.error(t('crud.refreshFailed'))
          return
        }
        message.success(t('crud.refreshSuccess'))
      }
    }

    /** 获取动态数据源 */
    async function getDataSource(params: Record<string, unknown>): Promise<OptionItem[] | undefined> {
      if (!remote) return undefined
      const result = await crudRequest<OptionItem[]>(
        remote.method ?? 'post',
        remote.url,
        params
      )
      dataSource.value = typeof remote.converter === 'function' ? remote.converter(result) : result
      return dataSource.value
    }

    /** 根据表单数据动态填充查询参数，顺便收集动态字段及校验 */
    function getParamsFromFormData(params: RemoteConfig['params'] = {}): Record<string, unknown> {
      const data: Record<string, unknown> = {}
      needWatch.value = false
      isValid.value = true
      dyFields = []
      for (const key in params) {
        const value = params[key]
        if (typeof value === 'string' && reg.test(value)) {
          // 代表是动态参数，需要从表单中取值
          needWatch.value = true
          const str = value.match(reg)?.[1] ?? ''
          const paramsName = str.match(/formData\.([^:]+)/)?.[1] ?? ''
          dyFields.push(paramsName)
          const paramsIsRequired = /.+:required/.test(str)
          data[key] = formData[paramsName]
          if (paramsIsRequired && isEmpty(data[key] as IsEmptyValue)) {
            isValid.value = false
          }
        } else {
          data[key] = value
        }
      }
      return data
    }

    return () => {
      const { renderByField } = useRender({
        ctx: { $emit: emit },
        isView: props.isView,
        value: props.value,
        dataSource: dataSource.value ?? []
      })
      const vNode = renderByField(props.field)
      let useRefresh = true
      // 单选、多选默认不显示刷新按钮，手动设置除外
      if (props.field.type === EControlType.eRadio || props.field.type === EControlType.eCheckbox) {
        useRefresh = false
      }
      useRefresh = props.field.props.useRefresh ?? useRefresh
      if (triggerRemote && useRefresh !== false && !props.isView) {
        return h(
          resolveComponent('a-input-group'),
          { compact: true, class: 'nowrap' },
          {
            default: () => [
              h(vNode as VNode, { style: 'width: calc(100% - 32px)' }),
              h(
                resolveComponent('a-button'),
                { title: t('crud.refreshData'), onClick: triggerRemote },
                {
                  icon: () => h(SyncOutlined, { class: 'em08 text-gray' })
                }
              )
            ]
          }
        )
      }
      return vNode
    }
  }
})
