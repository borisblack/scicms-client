import React, {useCallback} from 'react'
import {Checkbox, Dropdown, Menu, Popover, Space, Tooltip} from 'antd'
import {ClearOutlined, ExportOutlined, Html5Outlined, ReloadOutlined, SettingOutlined} from '@ant-design/icons'
import {Table} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'

import styles from './DataGrid.module.css'

interface Props {
    table: Table<any>
    hasFilters: boolean
    onRefresh: () => void
    onClearFilters: () => void
    onHtmlExport: () => void
}

function Toolbar({table, hasFilters, onRefresh, onClearFilters, onHtmlExport}: Props) {
    const {t} = useTranslation()

    const renderExportMenu = useCallback(() => (
        <Menu
            items={[{
                key: 'html',
                label: (
                    <Space>
                        <Html5Outlined className="blue"/>
                        HTML
                    </Space>
                ),
                onClick: onHtmlExport
            }]}
        />
    ), [onHtmlExport])

    return (
        <div className={styles.toolbar}>
            <Tooltip title={t('Refresh')}>
                <ReloadOutlined className={styles.toolbarBtn} onClick={onRefresh}/>
            </Tooltip>

            {hasFilters && (
                <Tooltip title={t('Clear filters')}>
                    <ClearOutlined className={styles.toolbarBtn} onClick={onClearFilters}/>
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
                    <SettingOutlined className={styles.toolbarBtn}/>
                </Popover>
            </Tooltip>

            <Tooltip title={t('Export')}>
                <Dropdown placement="bottomLeft" trigger={['click']} overlay={renderExportMenu()}>
                    <ExportOutlined className={styles.toolbarBtn} title={t('Export')}/>
                </Dropdown>
            </Tooltip>
        </div>
    )
}

export default Toolbar