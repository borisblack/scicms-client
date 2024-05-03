import {PropsWithChildren, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from 'antd'

import './Expandable.css'
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons'

interface ExpandableProps {
  initialExpanded?: boolean
  onToggle?: (expanded: boolean) => void
}

export function Expandable({initialExpanded, children, onToggle}: PropsWithChildren<ExpandableProps>) {
  const {t} = useTranslation()
  const [expanded, setExpanded] = useState(initialExpanded)

  function toggleExpanded() {
    setExpanded(!expanded)
    onToggle?.(!expanded)
  }

  return (
    <div className={`expandable-mask ${expanded ? 'expandable-mask_expanded' : ''}`}>
      <div className={`expandable ${expanded ? 'expandable_expanded' : ''}`}>
        <Button
          className="expandable__button"
          icon={expanded ? <FullscreenExitOutlined/> : <FullscreenOutlined/>}
          type="text"
          size="middle"
          title={t(expanded ? 'Collapse' : 'Expand')}
          onClick={toggleExpanded}
        />
        {children}
      </div>
    </div>
  )
}