import {CSSProperties, ReactNode} from 'react'
import {Badge} from 'antd'
import {DatabaseFilled, LockFilled} from '@ant-design/icons'

import styles from './FieldName.module.css'

export type TagType = 'lock' | 'dataset'

interface FieldNameProps {
    name: string
    tag?: TagType
    className?: string
    style?: CSSProperties
}

function renderTagIcon(tag: TagType): ReactNode {
  switch (tag) {
    case 'lock':
      return <LockFilled className={styles.badgeIcon}/>
    case 'dataset':
      return <DatabaseFilled className={styles.badgeIcon}/>
    default:
      return null
  }
}

export default function FieldName({name, tag, className, style}: FieldNameProps) {

  return tag ? (
    <Badge className={styles.fieldNameBadge} count={renderTagIcon(tag)} offset={[5, 5]}>
      <span
        className={`${className ?? ''} ${styles.fieldNameWrapper}`}
        style={style}
      >
        {name}
      </span>
    </Badge>
  ) : (
    <span
      className={`${className ?? ''} ${styles.fieldNameWrapper}`}
      style={style}
    >
      {name}
    </span>
  )
}