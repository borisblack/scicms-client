import {useTranslation} from 'react-i18next'
import {Button, Dropdown, Space, Typography} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {DeleteOutlined, EditOutlined, SettingOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'

import {IText} from 'src/types/bi'
import {useModal} from 'src/util/hooks'
import TextModal from '../TextModal'
import styles from './Text.module.css'

interface TextProps {
  text: IText
  height: number
  canEdit: boolean
  readOnly: boolean
  onLockChange: (locked: boolean) => void
  onChange: (text: IText) => void
  onDelete: () => void
}

export default function Text({text, height, readOnly, canEdit, onLockChange, onChange, onDelete}: TextProps) {
  const {t} = useTranslation()
  const {show: showTextModal, close: closeTextModal, modalProps: textModalProps} = useModal()

  function handleTextModalOpen() {
    onLockChange(true)
    showTextModal()
  }

  function handleTextModalClose() {
    onLockChange(false)
    closeTextModal()
  }

  const getSettingsMenuItems = (): ItemType[] => {
    const menuItems: ItemType[] = []

    if (!readOnly) {
      menuItems.push(
        /*{
                    type: 'divider'
                },*/
        {
          key: 'edit',
          label: (
            <Space>
              <EditOutlined />
              {t('Edit')}
            </Space>
          ),
          // disabled: !canEdit,
          onClick: handleTextModalOpen
        },
        {
          key: 'delete',
          label: (
            <Space>
              <DeleteOutlined className="red" />
              {t('Delete')}
            </Space>
          ),
          disabled: !canEdit,
          onClick: onDelete
        }
      )
    }

    return menuItems
  }

  return (
    <>
      {canEdit && !readOnly && (
        <PageHeader
          className={styles.pageHeader}
          extra={[
            <Dropdown key="settings" placement="bottomRight" trigger={['click']} menu={{items: getSettingsMenuItems()}}>
              <Button
                type="text"
                className={styles.toolbarBtn}
                icon={<SettingOutlined />}
                title={t('Settings')}
                onMouseDown={e => e.stopPropagation()}
              />
            </Dropdown>
          ]}
        />
      )}

      {text.level == null ? (
        <Typography.Text>{text.content}</Typography.Text>
      ) : (
        <Typography.Title level={text.level}>{text.content}</Typography.Title>
      )}

      <TextModal {...textModalProps} text={text} canEdit={canEdit} onChange={onChange} onClose={handleTextModalClose} />
    </>
  )
}
