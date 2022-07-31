import {DateTime} from 'luxon'
import {ReactElement, useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createColumnHelper} from '@tanstack/react-table'
import {Checkbox, Menu, message} from 'antd'

import {
    DATE_FORMAT_STRING,
    DATETIME_FORMAT_STRING,
    DEFAULT_COLUMN_WIDTH,
    TIME_FORMAT_STRING
} from '../../config/constants'
import {Attribute, AttrType, Item, RelType} from '../../types'
import QueryService from '../../services/query'
import {useAppSelector} from '../../util/hooks'
import {selectItems} from '../registry/registrySlice'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'

interface Props {
    item: Item
}

const columnHelper = createColumnHelper<any>()

function DataGridWrapper({item}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([] as any[])
    const items = useAppSelector(selectItems)

    const queryService = useMemo(() => {
        if (!items)
            throw new Error('Illegal state')

        return new QueryService(items)
    }, [items])

    const renderCell = useCallback((attribute: Attribute, value: any): ReactElement | string | null => {
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
            case AttrType.array:
                return value ? JSON.stringify(value) : null
            case AttrType.relation:
                if (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
                    throw new Error('Cannot render oneToMany or manyToMany relation')

                if (items === null || !attribute.target)
                    throw new Error('Illegal state')

                const subItem = items[attribute.target]
                return (value && value.data) ? value.data[subItem.displayAttrName ?? 'id'] : null
            default:
                return value
        }
    }, [items])

    const columnsMemoized = useMemo(() => {
        const columns = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attr = attributes[attrName]
            if (attr.private || attr.type === AttrType.media || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            const column = columnHelper.accessor(attrName, {
                header: attr.displayName,
                cell: info => renderCell(attr, info.getValue()),
                size: attr.width ?? DEFAULT_COLUMN_WIDTH,
                enableSorting: attr.type !== AttrType.relation
            })

            columns.push(column)
        }

        return columns
    }, [item, renderCell])

    const hiddenColumnsMemoized = useMemo((): string[] => {
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
    }, [item])

    const dataMemoized = useMemo(() => data, [data])

    const handleRequest = useCallback(async (params: RequestParams) => {
        if (params.filters.length === 0) {
            setData([])
            return
        }

        try {
            setLoading(true)
            const data = await queryService.findAll(item, params)
            setData(data.data)
        } catch (e: any) {
            console.error(e.message)
            message.error(t('An error occurred while executing the request'))
        } finally {
            setLoading(false)
        }
    }, [item, t])

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

    return (
        <DataGrid
            loading={loading}
            columns={columnsMemoized}
            data={dataMemoized}
            initialState={{
                hiddenColumns: hiddenColumnsMemoized
            }}
            getRowContextMenu={getRowContextMenu}
            onRequest={handleRequest}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}

export default DataGridWrapper