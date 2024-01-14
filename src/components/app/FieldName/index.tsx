import {ReactNode} from 'react'
import {Badge} from 'antd'
import {DatabaseFilled, LockFilled} from '@ant-design/icons'

import styles from './FieldName.module.css'

export type TagType = 'lock' | 'dataset'

interface FieldNameProps {
    name: string
    tag?: TagType
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

export default function FieldName({name, tag}: FieldNameProps) {

    return tag ? (
        <Badge className={styles.fieldNameBadge} count={renderTagIcon(tag)} offset={[5, 5]}>
            <span className={styles.fieldNameWrapper}>{name}</span>
        </Badge>
    ) : (
        <span className={styles.fieldNameWrapper}>{name}</span>
    )
}