import {FC} from 'react'
import {Col, Row, Tabs} from 'antd'

import {copyToClipboard} from 'src/util'
import {antdIcons, allFaIcons} from './loaders'

export interface IconsProps {
    height?: number | string
    onSelect?: (iconName: string) => void
}

export default function Icons({height, onSelect = copyToClipboard}: IconsProps) {
  const renderIcons = (icons: Record<string, FC>) => (
    <div style={{height, overflowY: 'scroll'}}>
      <Row>
        {Object.entries(icons).map(([iconName, Icon]) => (
          <Col span={6} key={iconName}>
            <span
              style={{cursor: 'pointer'}}
              onClick={() => {onSelect(iconName)}}
            >
              <Icon/>&nbsp;{iconName}
            </span>
          </Col>
        ))}
      </Row>
    </div>
  )

  return (
    <Tabs
      type="card"
      items={[
        {key: 'antd', label: 'Ant Design', children: renderIcons(antdIcons)},
        {key: 'fa', label: 'Font Awesome', children: renderIcons({...allFaIcons})}
      ]}
    />
  )
}