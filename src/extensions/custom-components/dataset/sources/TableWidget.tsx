import {CSSProperties} from 'react'
import {CloseOutlined, TableOutlined} from '@ant-design/icons'

import {Table} from 'src/types/bi'
import styles from './Sources.module.css'
import {Button} from 'antd'
import {useTranslation} from 'react-i18next'

interface TableWidgetProps {
    style?: CSSProperties
    table: Table
    canEdit: boolean
    onRemove: () => void
}

export default function TableWidget({style, table, canEdit, onRemove}: TableWidgetProps) {
    const {t} = useTranslation()

    return (
        <div className={styles.tableWidget} style={style}>
            <span title={table.name}>
                <TableOutlined className="green"/>
                &nbsp;&nbsp;
                {table.name}
                {canEdit && (
                    <Button
                        style={{position: 'absolute', bottom: 3, right: 3}}
                        type="text"
                        size="small"
                        title={t('Remove')}
                        onClick={onRemove}
                    >
                        <CloseOutlined/>
                    </Button>
                )}
            </span>
        </div>
    )
}