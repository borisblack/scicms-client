import {CSSProperties, MouseEvent} from 'react'
import {flexRender, Row} from '@tanstack/react-table'
import {CSS} from '@dnd-kit/utilities'
import {useSortable} from '@dnd-kit/sortable'
import {Dropdown, type MenuProps} from 'antd'

import styles from './DataGrid.module.css'

interface DraggableRowProps<T> {
  row: Row<T>
  getRowContextMenu?: (row: Row<T>) => MenuProps['items']
  onRowClick: (row: Row<T>, evt: MouseEvent<any>) => void
  onRowDoubleClick: (row: Row<T>) => void
}

export function DraggableRow<T>({row, getRowContextMenu, onRowClick, onRowDoubleClick}: DraggableRowProps<T>) {
  const {transform, transition, setNodeRef, isDragging} = useSortable({
    id: row.id
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), // let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative'
  }

  const rowContent = (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${styles.tr} ${row.getIsSelected() ? styles.selected : ''}`}
      onClick={evt => onRowClick(row, evt)}
      onDoubleClick={() => onRowDoubleClick(row)}
    >
      {row.getVisibleCells().map(cell => (
        <td key={cell.id} style={{width: cell.column.getSize()}}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )

  return getRowContextMenu ? (
    <Dropdown menu={{items: getRowContextMenu(row)}} trigger={['contextMenu']}>
      {rowContent}
    </Dropdown>
  ) : (
    rowContent
  )
}
