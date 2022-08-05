import React from 'react'
import {Checkbox, Popover} from 'antd'
import {ReloadOutlined, SettingOutlined} from '@ant-design/icons'
import {Table} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'

import styles from './DataGrid.module.css'

interface Props {
    table: Table<any>
    onRefresh: () => void
}

function Toolbar({table, onRefresh}: Props) {
    const {t} = useTranslation()

    return (
        <div className={styles.toolbar}>
            <ReloadOutlined className={styles.toolbarBtn} title={t('Refresh')} onClick={onRefresh}/>

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