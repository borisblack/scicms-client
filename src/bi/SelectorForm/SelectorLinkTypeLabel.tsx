import {Space} from 'antd'
import {SwapLeftOutlined, SwapOutlined, SwapRightOutlined} from '@ant-design/icons'

import {SelectorLinkType} from 'src/types/bi'

interface SelectorLinkTypeProps {
  linkType: SelectorLinkType
}

export default function SelectorLinkTypeLabel({linkType}: SelectorLinkTypeProps) {
  function renderIcon() {
    switch (linkType) {
      case SelectorLinkType.in:
        return <SwapLeftOutlined />
      case SelectorLinkType.out:
        return <SwapRightOutlined />
      case SelectorLinkType.both:
        return <SwapOutlined />
      default:
        throw new Error('Illegal selector link type.')
    }
  }

  return (
    <Space>
      {renderIcon()}
      {linkType}
    </Space>
  )
}
