import {useCallback, useMemo, useRef, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, message, Space} from 'antd'

import appConfig from '../../config'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {findAllRelated, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {Attribute, Item, ItemData} from '../../types'
import {useTranslation} from 'react-i18next'
import {PlusCircleOutlined} from '@ant-design/icons'
import {ID_ATTR_NAME} from '../../config/constants'
import {Callback, CallbackOperation} from '../../services/mediator'
import MutationService from '../../services/mutation'
import ItemService from '../../services/item'

interface Props {
    item: Item
    itemData: ItemData
    relAttrName: string
    relAttribute: Attribute
    pageKey: string
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
}

export default function RelationsDataGridWrapper({item, itemData, relAttrName, relAttribute, pageKey, onItemCreate, onItemView}: Props) {
    if (!relAttribute.target)
        throw Error('Illegal attribute')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const createdIds = useRef<Set<string>>(new Set())
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    const target = useMemo(() => itemService.getByName(relAttribute.target as string), [itemService, relAttribute.target])
    const columnsMemoized = useMemo(() => getColumns(target), [target])

    const inversedAttrName = useMemo((): string | undefined => {
        const relAttribute = item.spec.attributes[relAttrName]
        return relAttribute.inversedBy ?? relAttribute.mappedBy
    }, [item.spec.attributes, relAttrName])

    const hiddenColumnsMemoized = useMemo(() => {
        const hiddenColumns = getHiddenColumns(target)
        return inversedAttrName ? [...hiddenColumns, inversedAttrName] : hiddenColumns
    }, [inversedAttrName, target])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const dataWithPagination = await findAllRelated(item.name, itemData.id, relAttrName, target, params)
            setData(dataWithPagination)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item.name, itemData.id, relAttrName, target])

    const createInitialData = useCallback((): ItemData | null => {
        if (!inversedAttrName)
            return null

        const initialData: any = {id: itemData.id}
        if (item.titleAttribute !== ID_ATTR_NAME)
            initialData[item.titleAttribute] = itemData[item.titleAttribute]

        return {[inversedAttrName]: {data: initialData}} as ItemData
    }, [item.titleAttribute, itemData, inversedAttrName])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const handleCreate = () => {
        const initialData = createInitialData()
        const cb: Callback = initialData ? () => refresh : processManyToManyUnidirectionalRelation

        onItemCreate(target, initialData, cb, pageKey)
    }

    async function processManyToManyUnidirectionalRelation(operation: CallbackOperation, id: string) {
        if (!relAttribute.intermediate)
            throw Error('Illegal attribute')

        const intermediate = itemService.getByName(relAttribute.intermediate)
        if (operation === CallbackOperation.UPDATE && !createdIds.current.has(id)) {
            await mutationService.create(intermediate, {source: itemData.id, target: id})
            createdIds.current.add(id)
        }

        if (operation === CallbackOperation.DELETE) {
            // TODO: Find to delete
            // await mutationService.delete(intermediate, {source: itemData.id, target: id})
            // createdIds.current.delete(id)
        }

        refresh()
    }

    const handleRowDoubleClick = (row: Row<ItemData>) => onItemView(target, row.original.id, refresh, pageKey)

    return (
        <>
            <DataGrid
                loading={loading}
                columns={columnsMemoized}
                data={data}
                version={version}
                initialState={{
                    hiddenColumns: hiddenColumnsMemoized,
                    pageSize: appConfig.query.findAll.defaultPageSize
                }}
                toolbar={(
                    <Space style={{marginBottom: 16}}>
                        <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>
                    </Space>
                )}
                onRequest={handleRequest}
                onRowDoubleClick={handleRowDoubleClick}
            />
        </>
    )
}