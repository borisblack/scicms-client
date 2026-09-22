import React, {useCallback} from "react"
import {Button, Checkbox, Dropdown, Popover, Space, Tooltip} from "antd"
import {ClearOutlined, ExportOutlined, Html5Outlined, ReloadOutlined, SettingOutlined} from "@ant-design/icons"
import {Table} from "@tanstack/react-table"
import {useTranslation} from "react-i18next"

import styles from "./Toolbar.module.css"

interface Props {
  table: Table<any>
  hasFilters: boolean
  onRefresh: () => void
  onClearFilters: () => void
  onHtmlExport: () => void
}

function Toolbar({table, hasFilters, onRefresh, onClearFilters, onHtmlExport}: Props) {
  const {t} = useTranslation()

  const getExportMenu = useCallback(
    () => [
      {
        key: "html",
        label: (
          <Space>
            <Html5Outlined className="blue" />
            HTML
          </Space>
        ),
        onClick: onHtmlExport
      }
    ],
    [onHtmlExport]
  )

  return (
    <div className={styles.toolbar}>
      <Tooltip title={t("Refresh")}>
        <Button icon={<ReloadOutlined />} type="text" className={styles.toolbarBtn} onClick={onRefresh} />
      </Tooltip>

      {hasFilters && (
        <Tooltip title={t("Clear filters")}>
          <Button icon={<ClearOutlined />} type="text" className={styles.toolbarBtn} onClick={onClearFilters} />
        </Tooltip>
      )}

      <Popover
        content={table
          .getAllLeafColumns()
          .filter(column => column.id !== "drag-handle")
          .map(column => (
            <div key={column.id}>
              <Checkbox checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()}>
                {column.columnDef.header as string}
              </Checkbox>
            </div>
          ))}
        placement="leftTop"
        trigger="click"
      >
        <Tooltip title={t("Settings")}>
          <Button icon={<SettingOutlined />} type="text" className={styles.toolbarBtn} />
        </Tooltip>
      </Popover>

      <Dropdown placement="bottomLeft" trigger={["click"]} menu={{items: getExportMenu()}}>
        <Tooltip title={t("Export")}>
          <Button icon={<ExportOutlined />} type="text" className={styles.toolbarBtn} />
        </Tooltip>
      </Dropdown>
    </div>
  )
}

export default Toolbar
