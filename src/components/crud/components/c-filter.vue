<!-- c-page 条件过滤组件 -->
<template>
  <div ref="cFilter" class="c-filter relative" :class="{ 'overflow-hidden': needFold, 'is-fold': isFold }">
    <a-form
      name="searchForm"
      ref="searchForm"
      :model="formData"
      :label-col="config?.labelCol"
      :wrapper-col="config?.wrapperCol"
      autocomplete="off"
      @finish="onSubmitHandle"
    >
      <a-row :gutter="10" wrap>
        <!-- 动态字段 -->
        <a-col v-for="(field, index) in currFields" :key="field.fieldName" v-bind="field.col ?? col" v-show="!isFold || (isFold && index < rowMaxShowNum)">
          <a-form-item :label="field.label" :name="field.fieldName" :label-col="field.labelCol" :wrapper-col="field.wrapperCol">
            <CComponent v-model:value="formData[field.fieldName]" :field="field" />
          </a-form-item>
        </a-col>
        <a-col v-bind="config.buttonsCol ?? { flex: '1 1 auto' }" class="flex-x" :class="{
          'x-center': config.buttonsAlign === 'center',
          'x-end': config.buttonsAlign === 'right',
        }">
          <a-form-item>
            <a-space>
              <a-button type="primary" :loading="loading" :disabled="loading" :icon="h(SearchOutlined)" html-type="submit">{{ $t('crud.search') }}</a-button>
              <a-button v-if="currFields.length > 0" :icon="h(UndoOutlined)" @click="onResetHandle">{{ $t('crud.reset') }}</a-button>
              <!-- 记住查询 及 历史查询 -->
              <a-dropdown-button v-if="config.useCache && currFields.length > 0" placement="bottomLeft" @click="onRememberHandle">
                {{ config.cacheBtnText || $t('crud.rememberSearch') }}
                <template #overlay>
                  <a-menu>
                    <a-menu-item
                      v-for="cache in cacheList"
                      :key="cache.id"
                      @click="onSelectCache(cache.id)"
                    >
                      <div class="flex-x-between">
                        <span class="mr15 flex-auto">{{ cache.name }}</span>
                        <a-divider type="vertical" />
                        <DeleteOutlined class="text-danger" @click.stop="onDeleteCache(cache.id)" />
                      </div>
                    </a-menu-item>
                    <a-menu-item v-if="!cacheList || cacheList.length === 0">
                      <span class="text-gray">{{ $t('crud.notLog') }}</span>
                    </a-menu-item>
                  </a-menu>
                </template>
                <template v-if="cacheList && cacheList.length > 0" #icon>
                  ···
                </template>
              </a-dropdown-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 折叠 -->
    <div v-if="needFold" ref="foldRef" class="c-filter__fold pointer relative" @click="toggleFold" @mousemove="onMouseover">
      <div class="bar flex-y-center" :style="`--x: ${mouseX}px`">
        <UpOutlined class="em06" v-show="!isFold" />
        <DownOutlined class="em06" v-show="isFold" />
      </div>
    </div>
    <CModal ref="cacheNameModal" :title="$t('crud.pleaseEnterRemark')" width="300">
      <a-input v-model:value="cacheName" :placeholder="$t('crud.pleaseEnterRemark')" :maxlength="15" />
    </CModal>
  </div>
</template>

<script setup>
import { useSearchCache } from '@/components/crud/hooks/useSearchCache.js'
import { EControlType } from '@/enum'
import { isAllFieldEmpty, isDayjs, isEmpty, isNotEmpty } from '@/utils/index.js'
import { DeleteOutlined, DownOutlined, SearchOutlined, UndoOutlined, UpOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { h } from 'vue'
import CComponent from './c-component.js'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})
const { t } = useI18n()
const defaultCol = { sm: 8, lg: 6, xxl: 4 }
const col = computed(() => props.config?.col ?? defaultCol)
const currFields = computed(() => {
  return props.config?.fields?.map(field => {
    return {
      ...field,
      props: {
        ...field.props,
        allowClear: field.props?.allowClear ?? true
      }
    }
  }) ?? []
})
const searchForm = ref()
const loading = inject('c-page.loading', false)
const searchParams = inject('c-page.searchParams', ref({})) // 共享的查询参数，格式化后的数据，实时从 formData 同步
const formData = reactive({}) // 当前查询表单绑定的数据
const {
  cacheList,
  getCondition,
  setCondition,
  delCondition
} = useSearchCache()
const noCondition = computed(() => isAllFieldEmpty(formData))
const emits = defineEmits(['search'])

provide('c-form.formData', formData)

onMounted(() => {
  setDefault()
  if (!isAllFieldEmpty(formData)) {
    onSubmitHandle()
  }
})

watch(
  () => formData,
  () => {
    searchParams.value = getTransformedFormData()
  },
  { deep: true }
)

/** 设置默认参数 */
function setDefault () {
  currFields.value.forEach(field => {
    formData[field.fieldName] = undefined
    if (isNotEmpty(field.defaultValue)) {
      formData[field.fieldName] = field.defaultValue
    }
  })
}

/** 日期范围字段收集 */
const dateRangeFields = computed(() => {
  return currFields.value.filter(field => field.type === EControlType.eDateRange)
})

/** 获取转换后的表单数据 */
function getTransformedFormData () {
  const transformedFormData = {}
  for (const key in formData) {
    const value = formData[key]
    if (isNotEmpty(value)) {
      transformedFormData[key] = value
    }
  }
  // 日期范围字段处理
  dateRangeFields.value.forEach(field => {
    const value = transformedFormData[field.fieldName]
    if (isNotEmpty(value)) {
      const fieldNames = field.props?.fieldNames ?? [`${field.fieldName}Begin`, `${field.fieldName}End`]
      transformedFormData[fieldNames[0]] = isDayjs(value[0]) ? value[0].startOf('day').hour(0).valueOf() : value[0]
      transformedFormData[fieldNames[1]] = isDayjs(value[1]) ? value[1].endOf('day').valueOf() : value[1]
      delete transformedFormData[field.fieldName]
    }
  })
  return transformedFormData
}

function onSubmitHandle () {
  emits('search')
}
function onResetHandle () {
  searchForm.value.resetFields()
  setDefault()
  emits('search')
}

// --------- 折叠、展开 ------------
const cFilter = useTemplateRef('cFilter')
const rowMaxShowNum = ref(5)
const needFold = computed(() => currFields.value.length > rowMaxShowNum.value)
const isFold = ref(false)
const foldRef = useTemplateRef('foldRef')
const mouseX = ref(0)
async function toggleFold () {
  isFold.value = !isFold.value
  rowMaxShowNum.value = 5
  await nextTick()
  if (isFold.value) {
    const rowMaxHeight = 60;
    async function initShowNum () {
      if (cFilter.value.clientHeight > rowMaxHeight && rowMaxShowNum.value > 1) {
        rowMaxShowNum.value = rowMaxShowNum.value - 1;
        await nextTick()
        initShowNum()
      }
    }
    initShowNum()
  }
}
function onMouseover (e) {
  mouseX.value = e.clientX - foldRef.value.getBoundingClientRect().x
}

// ------- 记住查询 start ----------
const cacheNameModal = ref()
const cacheName = ref('')
function onRememberHandle () {
  if (noCondition.value) {
    message.warning(t('crud.pleaseEnterSearchParams'))
    return
  }
  cacheName.value = ''
  cacheNameModal.value.open({
    onConfirm (close) {
      if (cacheName.value) {
        setCondition(toRaw(formData), cacheName.value)
        close()
      } else {
        message.error(t('crud.pleaseEnterRemark'))
      }
    }
  })
}
function onSelectCache (id) {
  const cacheData = getCondition(id)
  for (const key in formData) {
    formData[key] = cacheData[key]
  }
}
function onDeleteCache (id) {
  delCondition(id)
}
// ------- 记住查询 end ----------

</script>

<style lang="less" scoped>
.c-filter {
  :deep(.ant-form-item) {
    margin-bottom: 10px;
  }
  &__fold {
    height: 7px;
    margin-top: -1px;
    box-sizing: border-box;
    .bar {
      --x: 0;
      position: absolute;
      left: -20px;
      margin-top: -5px;
      width: 40px;
      height: 10px;
      border-radius: 6px;
      background-color: var(--ant-colorBorder);
      backdrop-filter: blur(10px);
      color: white;
      transform: translateX(var(--x)) scaleY(0);
      transition: all .3s;
    }
  }
  &:hover, &.is-fold {
    .c-filter__fold {
      border-top: dotted var(--ant-lineWidth) var(--ant-colorBorder);
      .bar {
        transform: translateX(var(--x)) scaleY(1);
      }
    }
  }
}
</style>
