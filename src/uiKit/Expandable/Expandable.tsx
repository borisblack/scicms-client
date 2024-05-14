import {KeyboardEvent, PropsWithChildren, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from 'antd'
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons'

import './Expandable.css'

interface ExpandableProps {
  initialExpanded?: boolean
  onToggle?: (expanded: boolean) => void
}

export function Expandable({initialExpanded, children, onToggle}: PropsWithChildren<ExpandableProps>) {
  const {t} = useTranslation()
  const [expanded, setExpanded] = useState(initialExpanded)

  function handleKeyUp(evt: KeyboardEvent<HTMLInputElement>) {
    if (evt.key === 'Escape' && expanded) {
      toggleExpanded()
      return
    }
  }

  function toggleExpanded() {
    setExpanded(!expanded)
    onToggle?.(!expanded)
  }

  return (
    <div className={`expandable-mask ${expanded ? 'expandable-mask_expanded' : ''}`}>
      <div
        className={`expandable ${expanded ? 'expandable_expanded' : ''}`}
        onKeyUp={handleKeyUp}
      >
        <Button
          className="expandable__button"
          icon={expanded ? <FullscreenExitOutlined/> : <FullscreenOutlined/>}
          type="text"
          size="middle"
          disabled={false}
          title={t(expanded ? 'Collapse' : 'Expand')}
          onClick={toggleExpanded}
        />
        {children}
      </div>
    </div>
  )
}