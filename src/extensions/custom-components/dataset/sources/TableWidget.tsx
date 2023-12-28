import {CSSProperties} from 'react'
import {CloseOutlined, TableOutlined} from '@ant-design/icons'

import {Table} from 'src/types/bi'
import styles from './Sources.module.css'
import {Button, Space} from 'antd'
import {useTranslation} from 'react-i18next'

interface TableWidgetProps {
    style?: CSSProperties
    table: Table
    onRemove: () => void
}

export default function TableWidget({style, table, onRemove}: TableWidgetProps) {
    const {t} = useTranslation()

    return (
        <div
            className={styles.tableWidget}
            style={style}
        >
            <Space>
                <TableOutlined className="green"/>
                {table.name}
                <Button
                    style={{position: 'absolute', bottom: 3, right: 3}}
                    type="text"
                    size="small"
                    title={t('Remove')}
                    onClick={onRemove}
                >
                    <CloseOutlined/>
                </Button>
            </Space>
        </div>
    )
}