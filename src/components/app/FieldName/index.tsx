import {Badge} from 'antd'
import {LockFilled, LockOutlined} from '@ant-design/icons'

import styles from './FieldName.module.css'

interface FieldNameProps {
    name: string
    locked?: boolean
}

export default function FieldName({name, locked}: FieldNameProps) {
    return locked ? (
        <Badge className={styles.fieldNameBadge} count={<LockFilled className={styles.badgeIcon}/>} offset={[5, 5]}>
            <span className={styles.fieldNameWrapper}>{name}</span>
        </Badge>
    ) : (
        <span className={styles.fieldNameWrapper}>{name}</span>
    )
}