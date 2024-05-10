import {MoreOutlined} from '@ant-design/icons'
import {useSortable} from '@dnd-kit/sortable'
import {Button} from 'antd'
import {useTranslation} from 'react-i18next'

export const RowDragHandleCell = ({rowId}: {rowId: string}) => {
  const {t} = useTranslation()
  const {attributes, listeners} = useSortable({id: rowId})

  return (
    <Button
      {...attributes}
      {...listeners}
      size="small"
      type="text"
      icon={<MoreOutlined/>}
      title={t('Move')}
    />
  )
}
