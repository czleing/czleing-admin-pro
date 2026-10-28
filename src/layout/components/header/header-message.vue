<!-- 待办消息 -->
<template>
  <div class="header-message pointer" :class="{'pr10': total > 0}">
    <a-popover placement="bottomRight" trigger="click">
      <a-tooltip :title="$t('frame.message')">
        <a-badge :count="total" :overflow-count="99">
          <BellOutlined class="em14" />
        </a-badge>
      </a-tooltip>
      <template #content>
        <div class="flex-x-between mb10">
          <div class="bold">{{ $t('frame.message') }}</div>
          <div class="text-info pointer">查看全部</div>
        </div>
        <div class="list-container flex-y">
          <div class="flex-auto list px10">
            <div class="item flex-x gap10 lh1_5 pa10"
              v-for="(item, index) in list"
              :key="item.id"
              :class="{'border-top': index > 0}"
            >
              <MessageOutlined class="em12" />
              <div class="flex-auto">{{ item.content }}</div>
              <a v-if="item.type !== '1'" href="javascript:;" class="nowrap" @click="toDo(item)">去办理</a>
            </div>
            <a-empty v-if="total === 0" description="暂无消息" />
          </div>
          <div class="tr mt5" v-if="total > 0">
            <a-pagination
              size="small"
              :current="pageParam.pageNum"
              :pageSize="pageParam.pageSize"
              :total="total"
              @change="handlePageChange"
              show-less-items
            />
          </div>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script setup>
import { notification, message } from 'ant-design-vue';
import { MessageOutlined, SmileOutlined, BellOutlined } from '@ant-design/icons-vue'
import axios from '@/api/index.js'
import { useRouter } from 'vue-router'
import { watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store.js'
import { useSSE } from '@/hooks/useSEE.js'

const { connect, addSSEListener, disconnect } = useSSE()
const router = useRouter()
const authStore = useAuthStore()
const total = ref(11)
const list = ref([])
const pageParam = ref({
  pageNum: 1,
  pageSize: 10
})

// 初始化SSE连接
const initSSE = async (token) => {
  try {
    const connected = await connect(token)
    if (connected) {
      // 添加消息监听
      addSSEListener('message', handleSSEMessage)
      console.log('SSE监听器已注册')
    }
  } catch (error) {
    console.error('SSE初始化失败:', error)
  }
}

// 处理SSE消息
const handleSSEMessage = (resp) => {
  notification.open({
    message: '收到新消息',
    description: resp?.data,
    icon: () => h(SmileOutlined, { style: 'color: #108ee9' }),
  });
  getList()
}

// 监听token变化建立连接
watch(() => authStore.token, (newToken) => {
  if (newToken) {
    initSSE(newToken)
  } else {
    disconnect()
  }
}, { immediate: true })

onMounted(() => {
  // if (authStore.token) {
    setTimeout(() => {
      getList()
    }, 1000)
  // }
})

onUnmounted(() => {
  disconnect()
})

/** 获取消息列表 */
async function getList() {
  try {
    // const pageResult = await axios.post('/xx/xx/list', {
    //   page: pageParam.value,
    //   status: '0' // 过滤状态
    // })
    // total.value = pageResult.total ?? 0
    // list.value = pageResult.list ?? []
    // 模拟
    if (pageParam.value.pageNum === 1) {
      list.value = [
        { id: 1, type: '1', code: '', content: '欢迎使用 czleing-admin!' },
        { id: 2, type: '2', code: 'Z0001', content: '本周周报待提交，请点击前往填写' },
        { id: 3, type: '2', code: 'D0009', content: '线上 bug 工单待处理，立即查看并修复' },
        { id: 4, type: '2', code: 'D0009', content: '新的审批申请待查阅，点击进入审核' },
        { id: 5, type: '2', code: 'D0009', content: '项目接口文档待确认，前往核对内容' },
        { id: 6, type: '2', code: 'D0009', content: '考勤异常提醒，点击办理补卡手续' },
        { id: 7, type: '2', code: 'D0009', content: '会议纪要待归档，进入页面完成提交' },
        { id: 8, type: '2', code: 'D0009', content: '客户咨询未回复，点击前往及时处理' },
        { id: 9, type: '1', code: 'xxxx', content: '下周五公司将举行xxx会议，请提前做好准备！' },
        { id: 10, type: '3', code: 'D0009', content: '办公物资申领待确认，点击办理登记' }
      ]
    } else {
      list.value = [
        { id: 11, type: '4', code: 'D0009', content: '版本上线预案待完善，进入编辑补充' }
      ]
    }
  } catch (error) {
    message.error('获取消息失败')
    console.error('获取消息失败:', error)
  }
}

function handlePageChange(page, pageSize) {
  pageParam.value.pageNum = page
  pageParam.value.pageSize = pageSize
  getList()
}

/** 点击处理 */
function toDo (item) {
  // list.value = list.value.filter(li => li.id !== item.id)
  // total.value--
  // if (list.value.length === 0 && total.value > 0) {
  //   getList()
  // }
  // 已读
  // axios.post('/xx/xx/read/' + item.id, {})
  // getList()
  // 跳转
  // router.push(``)
}
</script>

<style lang="scss" scoped>
.list-container {
  width: 400px;
  min-height: 440px;
  .item:hover {
    background-color: rgba(155, 155, 155, .1);
    border-radius: var(--ant-borderRadiusLG);
    &, & + .item {
      border-color: transparent;
    }
  }
}
</style>
