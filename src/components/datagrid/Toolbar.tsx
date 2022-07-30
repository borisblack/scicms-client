import React from 'react'
import {Checkbox, Popover} from 'antd'
import {SettingOutlined} from '@ant-design/icons'
import {Table} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'

interface Props {
    table: Table<any>
}

function Toolbar({table}: Props) {
    const {t} = useTranslation()

    return (
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
            placement='rightTop'
            trigger='click'
        >
            <SettingOutlined title={t('Settings')}/>
        </Popover>
    )
}

export default Toolbar