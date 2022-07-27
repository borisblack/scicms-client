import React, {useMemo, useState} from 'react'
import {createColumnHelper} from '@tanstack/react-table'
import {Checkbox, Menu} from 'antd'

import {useAppDispatch} from '../../hooks'
import DataGrid, {FetchParams} from './DataGrid'
import {DateTime} from 'luxon'
import {DATE_FORMAT_STRING, DATETIME_FORMAT_STRING, TIME_FORMAT_STRING} from '../../config/constants'
import {Attribute, AttrType, Item} from '../../types'

interface Props {
    item: Item
}

interface FetchResult {
    data: any[]
    page: number
    pageSize: number
    total: number
}

const columnHelper = createColumnHelper<any>()

function DataGridWrapper({item}: Props) {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = React.useState(false)
    const [data, setData] = useState([] as any[])
    const [pageSize, setPageSize] = React.useState(20)
    const [total, setTotal] = React.useState(0)

    function getColumns() {
        const columns = []
        for (const attrName in item.spec.attributes) {
            if (!item.spec.attributes.hasOwnProperty(attrName))
                continue

            const attribute = item.spec.attributes[attrName]
            const column = columnHelper.accessor(attrName, {
                header: attribute.displayName,
                cell: info => renderCell(attribute, info.getValue())
            })

            columns.push(column)
        }

        return columns
    }

    function renderCell(attribute: Attribute, value: any): any {
        switch (attribute.type) {
            case AttrType.bool:
                return <Checkbox checked={value}/>
            case AttrType.date:
                return value ? DateTime.fromISO(value).toFormat(DATE_FORMAT_STRING) : null
            case AttrType.time:
                return value ? DateTime.fromISO(value).toFormat(TIME_FORMAT_STRING) : null
            case AttrType.datetime:
                return value ? DateTime.fromISO(value).toFormat(DATETIME_FORMAT_STRING) : null
            default:
                return value
        }
    }

    async function handleRequest({page, pageSize, sortBy, filters}: FetchParams): Promise<FetchResult> {
        const queryItem = buildQueryItem({page, pageSize, sortBy, filters})

        setLoading(true)
        // const result = await actionApi.applyPage(queryItem)
        setLoading(false)

        // return {
        //     data: result.data.map(el => mapRow(el, isRelationship)),
        //     page: result.page,
        //     pageSize: result.pageSize,
        //     total: result.total,
        // }

        return {
            data: [],
            page: 1,
            pageSize: 20,
            total: 20,
        }
    }

    function buildQueryItem({page, pageSize, sortBy, filters}: FetchParams): Item {
        const queryItem = item
        // queryItem.setPage(pageIndex + 1)
        // queryItem.setPageSize(pageSize)
        //
        // if (sortBy.length > 0) {
        //     const orderBy = sortBy.map(({id, desc}) => `${id}${desc ? ' DESC' : ''}`)
        //     queryItem.setOrderBy(orderBy.join(', '))
        // }
        //
        //
        // for (const filter of filters) {
        //     const {id, value} = filter
        //     const prop = metadata.properties[id]
        //     const dataType = _.property(prop, 'data_type')
        //     if (isRelationship) {
        //         // Set value
        //         const target = queryItem.getProperty('target_id')
        //         target.setProperty(id, value)
        //
        //         // Set condition
        //         if (dataType === 'string' || dataType === 'text')
        //             target.setPropertyAttribute(id, CONDITION_KEY, Condition.LIKE)
        //     } else {
        //         // Set value
        //         queryItem.setProperty(id, value)
        //
        //         // Set condition
        //         if (dataType === 'string' || dataType === 'text')
        //             queryItem.setPropertyAttribute(id, CONDITION_KEY, Condition.LIKE)
        //     }
        // }

        return queryItem
    }

    async function handleFetchData({page, pageSize, sortBy, filters}: FetchParams) {
        const result = await handleRequest({page, pageSize, sortBy, filters})
        setData(result.data)
        setPageSize(result.pageSize)
        setTotal(result.total)
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

    const columnsMemoized = useMemo(() => getColumns(), [])

    const dataMemoized = useMemo(() => data, [data])

    return (
        <DataGrid
            loading={loading}
            columns={columnsMemoized}
            data={dataMemoized}
            pageSize={pageSize}
            total={total}
            initialState={{
                page: 1,
                pageSize: 20,
            }}
            getRowContextMenu={getRowContextMenu}
            onFetchData={handleFetchData}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}

export default DataGridWrapper