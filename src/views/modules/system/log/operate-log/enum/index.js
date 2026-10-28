import { Enum, init } from '@/utils/enum.util'

/**
 * 操作类型
 * 0其它 1后台用户 2手机端用户
 */
export const EOperateType = {
  eBackend: Enum(1, '后台用户'),
  eMobile: Enum(2, '手机端用户'),
  eOther: Enum(0, '其它')
}
init(EOperateType)
