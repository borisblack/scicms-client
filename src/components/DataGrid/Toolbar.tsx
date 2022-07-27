import React from 'react'
import {Checkbox, Popover} from 'antd'
import {SettingOutlined} from '@ant-design/icons'

interface Props {
    allColumns: any[]
}

function Toolbar({allColumns}: Props) {
    return (
        <>
            <Popover
                content={
                    allColumns.map(column => (
                        <div key={column.id}>
                            <Checkbox {...column.getToggleHiddenProps()}>{column.Header}</Checkbox>
                        </div>
                    ))
                }
                placement='right'
                trigger='click'
            >
                <SettingOutlined title="Настройки"/>
            </Popover>
        </>
    )
}

export default Toolbar