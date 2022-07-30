import {DateTime} from 'luxon'
import React, {ReactElement, useMemo, useState} from 'react'
import {createColumnHelper} from '@tanstack/react-table'
import {Checkbox, Menu} from 'antd'

import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {
    DATE_FORMAT_STRING,
    DATETIME_FORMAT_STRING,
    DEFAULT_COLUMN_WIDTH,
    TIME_FORMAT_STRING
} from '../../config/constants'
import {Attribute, AttrType, Item} from '../../types'
import {findAll} from '../../util/query'

interface Props {
    item: Item
}

const columnHelper = createColumnHelper<any>()

function renderCell(attribute: Attribute, value: any): ReactElement | string | null {
    switch (attribute.type) {
        case AttrType.bool:
            return <Checkbox checked={value}/>
        case AttrType.date:
            return value ? DateTime.fromISO(value).toFormat(DATE_FORMAT_STRING) : null
        case AttrType.time:
            return value ? DateTime.fromISO(value).toFormat(TIME_FORMAT_STRING) : null
        case AttrType.datetime:
            return value ? DateTime.fromISO(value).toFormat(DATETIME_FORMAT_STRING) : null
        case AttrType.json:
            return value ? JSON.stringify(value) : null
        default:
            return value
    }
}

function DataGridWrapper({item}: Props) {
    const [loading, setLoading] = React.useState(false)
    const [data, setData] = useState([] as any[])

    const columnsMemoized = useMemo(() => {
        const columns = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attribute = attributes[attrName]
            if (attribute.private || attribute.type === AttrType.relation)
                continue

            const column = columnHelper.accessor(attrName, {
                header: attribute.displayName,
                cell: info => renderCell(attribute, info.getValue()),
                size: attribute.width ?? DEFAULT_COLUMN_WIDTH,
                meta: {
                    type: attribute.type
                }
            })

            columns.push(column)
        }

        return columns
    }, [item])

    function getHiddenColumns(): string[] {
        const {attributes} = item.spec
        const hiddenColumns = []
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attribute = attributes[attrName]
            if (attribute.hidden)
                hiddenColumns.push(attrName)
        }

        return hiddenColumns
    }

    async function handleRequest(params: RequestParams) {
        setLoading(true)
        const data = await findAll(item, params)
        setLoading(false)

        setData(data.data)
    }

    function openRow(row: any) {
        console.log(row)
        // const {values} = row
        // const {classItem} = metadata
        // dispatch(openPage({
        //     type: isRelationship ? (_.property(initialQueryItem, 'target_id') as FlatItem)[META_KEY].type : initialQueryItem[META_KEY].type,
        //     viewType: 'edit',
        //     id: values.id,
        //     label: _.property(classItem, 'label')
        // }))
    }

    const handleRowDoubleClick = (row: any) => {
        openRow(row)
    }

    const getRowContextMenu = (row: any) =>
        <Menu items={[{
            key: 'open',
            label: 'Открыть',
            onClick: () => openRow(row)
        }]}/>

    const dataMemoized = useMemo(() => data, [data])

    return (
        <DataGrid
            loading={loading}
            columns={columnsMemoized}
            data={dataMemoized}
            initialState={{
                hiddenColumns: getHiddenColumns()
            }}
            getRowContextMenu={getRowContextMenu}
            onRequest={handleRequest}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}

export default DataGridWrapper