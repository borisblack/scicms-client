import {useDrag} from 'react-dnd'

import {NamedColumn} from 'src/types/bi'
import {DndItemType} from '../../config/constants'
import FieldTypeIcon from '../../components/FieldTypeIcon/FieldTypeIcon'
import FieldName from '../../components/FieldName/FieldName'
import styles from './FieldItem.module.css'
import {Button} from 'antd'
import {CloseOutlined, FunctionOutlined} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'

interface FieldItemProps {
  field: NamedColumn
  isDatasetField: boolean
  canEdit: boolean
  onFieldOpen: (field: NamedColumn) => void
  onFieldRemove: (fieldName: string) => void
}

const BTN_SIZE = 24
const BTN_SPACE = 2

export default function FieldItem({field, isDatasetField, canEdit, onFieldOpen, onFieldRemove}: FieldItemProps) {
  const {t} = useTranslation()

  const [{isDragging}, drag] = useDrag(
    () => ({
      type: DndItemType.DATASET_FIELD,
      item: field,
      // canDrag: canEdit,
      collect: monitor => ({
        isDragging: monitor.isDragging()
      })
    }),
    [canEdit]
  )

  return (
    <div className={styles.fieldItem} ref={drag} style={{opacity: isDragging ? 0.5 : 1}}>
      <span className="text-ellipsis" title={field.name}>
        <FieldTypeIcon
          fieldType={field.type}
          color={field.custom && ((field.source && field.aggregate) || field.formula) ? '#007bff' : '#28a745'}
        />
        &nbsp;&nbsp;
        <FieldName name={field.name} tag={field.custom ? (isDatasetField ? 'dataset' : undefined) : 'lock'} />
      </span>

      {canEdit && (
        <>
          <Button
            size="small"
            // type="text"
            icon={<FunctionOutlined />}
            className={styles.fieldItem_fnBtn}
            style={{right: isDatasetField ? BTN_SPACE : BTN_SIZE + BTN_SPACE * 2}}
            disabled={false}
            onClick={() => onFieldOpen(field)}
          />

          {!isDatasetField && (
            <Button
              size="small"
              // type="text"
              title={t('Remove')}
              icon={<CloseOutlined />}
              className={styles.fieldItem_removeBtn}
              style={{right: BTN_SPACE}}
              onClick={() => onFieldRemove(field.name)}
            />
          )}
        </>
      )}
    </div>
  )
}
