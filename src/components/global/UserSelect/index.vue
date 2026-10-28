<!-- 用户选择，点击选择框，弹出用户选择窗 -->
<!-- 用法： -->
<!-- 单选：<UserSelect v-model:value="formData.userId" />  formData.userId 为字符串 -->
<!-- 多选：<UserSelect v-model:value="formData.userIds" :maxCount="10" />  formData.userIds 为字符串逗号拼接 -->
<template>
  <div class="user-select">
    <!-- 查看模式，只展示文本 -->
    <span v-if="isView">{{ selectedUserNames?.join(joinChar) }}</span>
    <!-- 触发选择 -->
    <a-select
      v-else-if="showSelect"
      ref="selector"
      :placeholder="placeholder"
      v-model:value="selectedUserIds"
      :disabled="disabled"
      :mode="multiple ? 'multiple' : 'default'"
      :allowClear="allowClear"
      :dropdownStyle="{ width: 0, overflow: 'hidden' }"
      :getPopupContainer="() => UserSelectPopupContainer"
      v-bind="$attrs"
      @click.native="open({ value: selectedUserIds })"
      @deselect="removeUser"
    >
      <a-select-option
        v-for="item in selectedUserOptions"
        :key="item[primaryKey]"
        :value="item[primaryKey]"
        :title="item[primaryName]"
      >{{ item[primaryName] }}</a-select-option>
    </a-select>
    <div ref="UserSelectPopupContainer" style="position:absolute;width:0;height:0;overflow:hidden;"></div>
    <!-- 选择弹窗 -->
    <!-- 渲染到body上 -->
    <Teleport to="body">
      <CModal v-if="!isView" ref="cModal" title="选择用户" width="1200" v-bind="modalProps">
        <!-- 避免表单校验收集 -->
        <a-form-item-rest>
          <CPage
            ref="cPage"
            noAdd
            noDelete
            noSelect
            noFullscreen
            primary-key="userId"
            :api-config="{
              list: '/system/user/selectUser'
            }"
            :tree-config="treeConfig"
            :filter-config="filterConfig"
            :tools-config="toolsConfig"
            :table-config="tableConfig"
            :before-search="beforeSearch"
            :after-search="afterSearch"
          >
            <template #table_checkbox="{ text, record, index, column }">
              <a-checkbox :checked="selectUserIds.includes(text)" />
            </template>
          </CPage>
        </a-form-item-rest>
      </CModal>
    </Teleport>
  </div>
</template>

<script setup>
import CPage from '@/components/crud/c-page.vue'
import { EControlType } from '@/enum/index.js'
import { isEmpty } from '@/utils/index.js'
import axios from '@/api'
import { nextTick } from 'vue'

defineOptions({
  name: 'UserSelect'
})
const props = defineProps({
  value: [String, Number, Array],
  // 组织机构树查询参数 如：deptId, parentId, isEnabled, deptName
  orgParams: Object,
  // 用户列表查询参数, 如：userId, userName, isEnabled, phonenumber, ids, roleKey, deptId
  userParams: Object,
  // 选择框提示
  placeholder: { type: String, default: '请选择用户' },
  // 最大选择数，<= 0 不限制，大于1多选
  maxCount: { type: Number, default: 1 },
  // 查看模式，不展示控件样式，只展示文本
  isView: { type: Boolean, default: false },
  // 是否允许清空
  allowClear: { type: Boolean, default: false },
  // 弹窗标题
  title: { type: String, default: '选择用户' },
  // 是否禁用
  disabled: { type: Boolean, default: false },
  /** 是否显示选择框 */
  showSelect: { type: Boolean, default: true },
  // 组织关联查询来源字段，组织树主键字段
  sourceField: { type: String, default: 'id' },
  // 组织关联查询目标字段，用户列表查询时组织ID对应的字段
  targetField: { type: String, default: 'orgId' },
  // 默认展开所有树节点
  expandAll: { type: Boolean, default: true },
  // 展示文本时，用于拼接多个名称的拼接符
  joinChar: { type: String, default: ',' }
})

const cModal = ref()
const cPage = ref()
const selector = ref()
const UserSelectPopupContainer = ref()
const primaryKey = 'userId'
const primaryName = 'nickName'
const needRefresh = ref(false) // 用户列表是否需要刷新，比如：弹窗关闭之后，更新了查询参数 userParams, 待弹窗显示之后，刷新用户列表
const options = ref({}) // 弹窗时 open 接收的参数，如：id, callback
const isLoaded = ref(false) // 当前列表是否已经加载
const selectUserIds = computed(() => selectUsers.value?.map(user => user[primaryKey])) // 当前选中但未确认选择的用户ids
const selectUsers = ref([]) // 当前选中但未确认选择的用户
const selectedUserIds = ref() // '' 或 ['xx','xx'] 当前已确认选择的用户IDS，单选时是用户ID(单选 a-select 必须设置单个值，不能设置数组)
const selectedUserOptions = ref([]) // 当前已确认的用户数据，单选、多选时都是数组，单选时只有一项
const selectedUserNames = computed(() => selectedUserOptions.value?.map(user => user[primaryName]))
const selectedNum = computed(() => selectUsers.value?.length || 0)
const multiple = computed(() => props.maxCount !== 1)

watch(
  () => props.value,
  setData,
  { deep: true, immediate: true }
)
watch(
  () => props.userParams,
  () => {
    if (cModal.value.visible) {
      cPage.value.refresh()
    } else {
      needRefresh.value = true
    }
  },
  { deep: true }
)

/** 打开弹窗 */
async function open (_options) {
  selector.value.blur()
  if (props.disabled) return
  options.value = _options
  if (_options) {
    setData(_options?.value)
  }
  cModal.value.open({
    onConfirm
  })
  nextTick(() => {
    if (needRefresh.value) {
      cPage.value?.refresh()
      needRefresh.value = false
    }
  })
}

/** 关闭弹窗 */
function close () {
  cModal.value.close()
}

/** 给控件设置值 */
async function setData (val) {
  // 预先加载用户信息，解决回显问题
  let ids = val || []
  if (val && typeof val === 'string') {
    ids = val.split(',')
  } else if (typeof val === 'number') {
    ids = [val]
  }
  ids = ids.map(id => String(id))
  if (!isEmpty(ids) && selectUsers.value.length === 0) {
    const result = await axios.post('/system/user/selectUser?from=initUserSelect', {
      pageNum: 1,
      pageSize: 9999,
      ids
    })
    selectUsers.value = result.list
    selectedUserIds.value = multiple.value ? ids : ids[0]
    selectedUserOptions.value = selectUsers.value
  } else if (isEmpty(ids)) {
    // 避免从编辑切换到新增时，控件值不会清空问题
    selectUsers.value = []
    selectedUserIds.value = undefined
    selectedUserOptions.value = []
  }
}

/** 以下为用户列表页相关配置 */
const treeConfig = {
  url: '/system/user/deptTree',
  params: { isEnabled: true, ...props.orgParams }, // deptId, parentId, isEnabled, deptName
  replaceField: { key: 'id', children: 'children', title: 'label' },
  searchField: 'deptId'
}

const filterConfig = {
  col: { span: 6 },
  fields: [
    {
      label: '用户姓名',
      fieldName: primaryKey,
      type: EControlType.eInput,
      props: {
        placeholder: '请输入用户姓名'
      }
    },
    {
      label: '角色',
      fieldName: 'roleKey',
      type: EControlType.eSelect,
      defaultValue: props.userParams?.roleKey,
      props: {
        allowClear: true,
        remote: {
          url: '/system/role/select',
          converter (list) {
            return list?.map(item => ({ id: item.roleKey, name: item.roleName }))
          }
        }
      }
    },
    {
      label: '手机号码',
      fieldName: 'phonenumber',
      type: EControlType.eInput,
      props: {
        placeholder: '请输入手机号码'
      }
    }
  ]
}

const toolsConfig = {
  otherTools: [
    {
      name: '清空',
      props: {
        type: 'default',
        disabled: () => isEmpty(selectUserIds.value),
        onClick () {
          selectUsers.value = []
        }
      }
    }
  ]
}

const tableConfig = computed(() => ({
  props: {
    rowClick ({ key, record }) {
      if (!selectUserIds.value.includes(key)) {
        if (props.maxCount >= 1 && selectUsers.value.length >= props.maxCount) {
          selectUsers.value.shift()
        }
        selectUsers.value.push(record)
      } else {
        selectUsers.value = selectUsers.value.filter(item => item[primaryKey] != key)
      }
    }
  },
  columns: [
    {
      title: '选择',
      dataIndex: primaryKey,
      slot: 'table_checkbox'
    },
    {
      title: '用户账号',
      dataIndex: 'userName'
    },
    {
      title: '用户姓名',
      dataIndex: primaryName
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      resizable: true,
      width: 150,
      customRender: ({ record }) => record.dept?.deptName ?? '-'
    },
    {
      title: '手机号码',
      dataIndex: 'phonenumber',
      hideChar: [3, 4]
    }
  ]
}))

function beforeSearch (params) {
  return {
    ...props.userParams,
    ...params
  }
}
function afterSearch (list) {
  isLoaded.value = true
  return list
}

const modalProps = computed(() => {
  return {
    confirmDisabled: isEmpty(selectUserIds.value),
    confirmText: `确认选择${multiple.value ? ('(' + selectedNum.value + ')') : ''}`
  }
})

function removeUser (userId) {
  selectUsers.value = selectUsers.value?.filter(item => item[primaryKey] != userId)
  onConfirm()
}

function onConfirm () {
  selectedUserOptions.value = selectUsers.value
  if (multiple.value) {
    selectedUserIds.value = selectUsers.value?.map((item) => item[primaryKey])
  } else {
    selectedUserIds.value = selectUsers.value?.[0][primaryKey] // 单选时必须是值，不能是数组，否则 a-select 无法选中
  }
  emitUpdate()
  close()
}

function emitUpdate () {
  let ids, objs
  if (multiple.value) {
    objs = selectedUserOptions.value
    ids = selectedUserIds.value?.join(',')
  } else {
    objs = selectedUserOptions.value?.[0]
    ids = selectedUserIds.value
  }
  emits('update:value', ids, objs)
  if (typeof options.value.callback === 'function') {
    options.value.callback(ids, objs)
  }
}

const emits = defineEmits(['update:value'])

defineExpose({
  open,
  close,
  setData
})
</script>

<style lang="scss" scoped>
</style>
