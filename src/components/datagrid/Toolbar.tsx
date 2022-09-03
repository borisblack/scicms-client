import React from 'react'
import {Checkbox, Popover} from 'antd'
import {ClearOutlined, ReloadOutlined, SettingOutlined} from '@ant-design/icons'
import {Table} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'

import styles from './DataGrid.module.css'

interface Props {
    table: Table<any>
    hasFilters: boolean
    onRefresh: () => void
    onClearFilters: () => void
}

function Toolbar({table, hasFilters, onRefresh, onClearFilters}: Props) {
    const {t} = useTranslation()

    return (
        <div className={styles.toolbar}>
            <ReloadOutlined className={styles.toolbarBtn} title={t('Refresh')} onClick={onRefresh}/>
            {hasFilters && <ClearOutlined className={styles.toolbarBtn} title={t('Clear filters')} onClick={onClearFilters}/>}
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
                <SettingOutlined className={styles.toolbarBtn} title={t('Settings')}/>
            </Popover>
        </div>
    )
}

export default Toolbar