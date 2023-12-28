import {useDrag} from 'react-dnd'
import {Space, Typography} from 'antd'
import {TableOutlined} from '@ant-design/icons'

import {DndItemType} from 'src/config/constants'
import {Table} from 'src/types/bi'
import styles from './Sources.module.css'

interface TableItemProps {
    table: Table
    strong: boolean
}

const {Text} = Typography

export default function TableItem({table, strong}: TableItemProps) {
    const [{isDragging}, drag] = useDrag(
        () => ({
            type: DndItemType.SOURCE_TABLE,
            item: table,
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    )

    return (
        <div
            className={styles.tableItem}
            ref={drag}
            style={{opacity: isDragging ? 0.5 : 1}}
        >
            <Space>
                <TableOutlined className="green"/>
                <Text strong={strong}>{table.name}</Text>
            </Space>
        </div>
    )
}