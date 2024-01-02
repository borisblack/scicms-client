import {useDrag} from 'react-dnd'
import {Typography} from 'antd'
import {TableOutlined} from '@ant-design/icons'

import {DndItemType} from 'src/config/constants'
import {Table} from 'src/types/bi'
import styles from './TableItem.module.css'

interface TableItemProps {
    table: Table
    strong: boolean,
    canEdit: boolean
}

const {Text} = Typography

export default function TableItem({table, strong, canEdit}: TableItemProps) {
    const [{isDragging}, drag] = useDrag(
        () => ({
            type: DndItemType.SOURCE_TABLE,
            item: table,
            // canDrag: canEdit,
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        [canEdit]
    )

    return (
        <div
            className={styles.tableItem}
            ref={drag}
            style={{opacity: isDragging ? 0.5 : 1}}
        >
            <span className="text-ellipsis" title={table.name}>
                <TableOutlined className="green"/>
                &nbsp;&nbsp;
                <Text strong={strong} ellipsis>{table.name}</Text>
            </span>
        </div>
    )
}