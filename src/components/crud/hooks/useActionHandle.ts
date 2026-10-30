/**
 * 处理表格操作、预设操作（新增/编辑/详情/删除/启停）及提交
 */
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { crudRequest } from '../utils/request'
import type {
  ActionHandleParams,
  CrudRecord,
  FormConfig,
  ModalFormContext,
  NormalizedModalButtonConfig,
  PageActionParams
} from '../types'

/**
 * 处理操作相关、表格预设操作等
 * @param params 操作处理所需上下文
 * @returns 操作状态及处理方法
 */
export function useActionHandle<Row extends CrudRecord = CrudRecord>({
  cModal,
  cForm,
  cTable,
  modalConfig = {},
  api,
  apiMethod,
  transformDetail,
  afterOpenModal,
  primaryKey,
  apiOptionConfig,
  afterSubmit,
  emit
}: ActionHandleParams<Row>) {
  const isAdd = ref(false)
  const isEdit = ref(false)
  const isView = ref(false)
  const detail = ref<CrudRecord>({})
  const { t } = useI18n()

  const buttonConfig = computed<NormalizedModalButtonConfig>(() => {
    let config = modalConfig.buttonConfig
    if (typeof config === 'function') {
      config = config({ isAdd: isAdd.value, isEdit: isEdit.value, isView: isView.value })
    }
    return {
      ...config,
      showConfirm: config?.showConfirm ?? !isView.value,
      cancelText: config?.cancelText ?? (isView.value ? t('crud.close') : undefined),
      showCancel: config?.showCancel ?? true,
      confirmAlign: config?.confirmAlign ?? 'right'
    }
  })
  const formConfig = computed<FormConfig | undefined>(() => {
    const context: ModalFormContext = {
      isAdd: isAdd.value,
      isEdit: isEdit.value,
      isView: isView.value,
      detail: detail.value
    }
    return typeof modalConfig.formConfig === 'function'
      ? modalConfig.formConfig(context)
      : modalConfig.formConfig
  })

  /** 设置当前弹窗类型 */
  function setViewType(type: 'add' | 'edit' | 'detail'): void {
    isAdd.value = type === 'add'
    isEdit.value = type === 'edit'
    isView.value = type === 'detail'
  }

  /** 拼接弹窗标题 */
  function getModalTitle(keyword: string): string {
    if (modalConfig.fullTitle) return modalConfig.fullTitle
    return modalConfig.title ? `${modalConfig.title}-${keyword}` : keyword
  }

  async function openModal(options: {
    title?: string
    record?: Row
  }): Promise<void> {
    await nextTick()
    cModal.value?.open({
      mode: modalConfig.mode,
      width: modalConfig.width,
      ...options
    })
    await nextTick()
    if (typeof afterOpenModal === 'function') {
      await afterOpenModal({
        isAdd: isAdd.value,
        isEdit: isEdit.value,
        isView: isView.value,
        record: options.record as CrudRecord | undefined,
        detail: detail.value,
        cForm
      })
    }
  }

  /** 表格操作按钮事件处理 */
  function onActionHandle({ action, record }: PageActionParams<Row>): void {
    if (action === 'edit') {
      void onEditHandle(record)
    } else if (action === 'detail') {
      void onDetailHandle(record)
    } else if (action === 'delete') {
      void onDeleteHandle([record[primaryKey] as string | number])
    } else if (action === 'toggle') {
      void onToggleHandle(record)
    } else {
      console.error(`action[${action}]不正确，只支持[edit, detail, delete, toggle]`)
    }
  }

  function onAddHandle(initData: CrudRecord = {}): void {
    setViewType('add')
    detail.value = initData
    void openModal({ title: getModalTitle(t('crud.add')) })
  }

  async function onEditHandle(record: Row): Promise<void> {
    setViewType('edit')
    detail.value = await getDetail(record[primaryKey] as string | number)
    void openModal({ record, title: getModalTitle(t('crud.edit')) })
  }

  async function onDetailHandle(record: Row): Promise<void> {
    setViewType('detail')
    detail.value = await getDetail(record[primaryKey] as string | number)
    void openModal({ record, title: getModalTitle(t('crud.detail')) })
  }

  async function onDeleteHandle(ids: (string | number)[]): Promise<void> {
    await crudRequest(
      apiMethod.delete,
      api.delete.replace(':ids', ids.join(',')),
      {},
      apiOptionConfig?.delete
    )
    message.success(t('crud.deleteSuccess'))
    emit('deleted')
    cTable.value?.refresh?.()
  }

  async function onToggleHandle(record: Row): Promise<void> {
    await crudRequest(
      apiMethod.toggle,
      api.toggle,
      { [primaryKey]: record[primaryKey] },
      apiOptionConfig?.toggle
    )
    message.success(t('crud.toggleSuccess'))
    cTable.value?.refresh?.()
  }

  async function getDetail(id: string | number): Promise<CrudRecord> {
    const result = await crudRequest<CrudRecord>(
      apiMethod.detail,
      api.detail.replace(':id', String(id)),
      { id },
      apiOptionConfig?.detail
    )
    if (transformDetail) {
      return transformDetail(result, { isEdit: isEdit.value, isView: isView.value })
    }
    return result
  }

  async function onBatchDeleteHandle(ids: (string | number)[]): Promise<void> {
    if (ids.length === 0) return
    Modal.confirm({
      title: t('crud.warmTips'),
      content: t('crud.confirmDeleteBySelected', { value: ids.length }),
      icon: createVNode(ExclamationCircleOutlined),
      onOk: async () => {
        await onDeleteHandle(ids)
        cTable.value?.clearSelect?.()
      }
    })
  }

  async function onSubmitHandle(submitData: CrudRecord): Promise<void> {
    if (isAdd.value) {
      await crudRequest(apiMethod.add, api.add, submitData, apiOptionConfig?.add)
      message.success(t('crud.addSuccess'))
      emit('added', submitData)
    } else if (isEdit.value) {
      await crudRequest(apiMethod.update, api.update, submitData, apiOptionConfig?.update)
      message.success(t('crud.updateSuccess'))
      emit('updated', submitData)
    }
    if (typeof afterSubmit === 'function') {
      await afterSubmit({
        isAdd: isAdd.value,
        isEdit: isEdit.value,
        formData: submitData,
        detail: detail.value
      })
    }
    cTable.value?.refresh?.()
  }

  return {
    isAdd,
    isEdit,
    isView,
    detail,
    buttonConfig,
    formConfig,
    onActionHandle,
    onAddHandle,
    onBatchDeleteHandle,
    onSubmitHandle
  }
}
