import React, {useCallback} from 'react'
import {Button, Checkbox, Dropdown, Popover, Space, Tooltip} from 'antd'
import {ClearOutlined, ExportOutlined, Html5Outlined, ReloadOutlined, SettingOutlined} from '@ant-design/icons'
import {Table} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'

import styles from './Toolbar.module.css'

interface Props {
    table: Table<any>
    hasFilters: boolean
    onRefresh: () => void
    onClearFilters: () => void
    onHtmlExport: () => void
}

function Toolbar({table, hasFilters, onRefresh, onClearFilters, onHtmlExport}: Props) {
  const {t} = useTranslation()

  const getExportMenu = useCallback(() => [{
    key: 'html',
    label: (
      <Space>
        <Html5Outlined className="blue"/>
                HTML
      </Space>
    ),
    onClick: onHtmlExport
  }], [onHtmlExport])

  return (
    <div className={styles.toolbar}>
      <Tooltip title={t('Refresh')}>
        <Button
          icon={<ReloadOutlined/>}
          type="text"
          className={styles.toolbarBtn}
          onClick={onRefresh}
        />
      </Tooltip>

      {hasFilters && (
        <Tooltip title={t('Clear filters')}>
          <Button
            icon={<ClearOutlined/>}
            type="text"
            className={styles.toolbarBtn}
            onClick={onClearFilters}
          />
        </Tooltip>
      )}

      <Tooltip title={t('Settings')}>
        <Popover
          content={
            table.getAllLeafColumns().map(column => (
              <div key={column.id}>
                <Checkbox
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                >
                  {column.columnDef.header as string}
                </Checkbox>
              </div>
            ))
          }
          placement='leftTop'
          trigger='click'
        >
          <Button
            icon={<SettingOutlined/>}
            type="text"
            className={styles.toolbarBtn}
          />
        </Popover>
      </Tooltip>

      <Tooltip title={t('Export')}>
        <Dropdown placement="bottomLeft" trigger={['click']} menu={{items: getExportMenu()}}>
          <Button
            icon={<ExportOutlined/>}
            type="text"
            className={styles.toolbarBtn}
          />
        </Dropdown>
      </Tooltip>
    </div>
  )
}

export default Toolbar