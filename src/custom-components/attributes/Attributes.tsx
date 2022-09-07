import {useCallback, useMemo, useState} from 'react'

import {CustomComponentRenderContext} from '../index'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from '../../config/constants'
import ItemTemplateService from '../../services/item-template'
import {ItemData, ItemSpec} from '../../types'
import PermissionService from '../../services/permission'
import * as ACL from '../../util/acl'
import DataGrid, {DataWithPagination, RequestParams} from '../../components/datagrid/DataGrid'
import appConfig from '../../config'
import {
    processLocal,
    getAttributeColumns,
    getHiddenAttributeColumns,
    getInitialData,
    NamedAttribute
} from '../../util/datagrid'
import {Row} from '@tanstack/react-table'

export default function Attributes({me, item, data}: CustomComponentRenderContext) {
    if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME)
        throw new Error('Illegal attribute')

    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])

    const permissions = useMemo(() => {
        const dataPermissionId = data?.permission?.data?.id
        const dataPermission = dataPermissionId ? permissionService.findById(dataPermissionId) : null
        const canEdit = !!dataPermission && item.name !== ITEM_TEMPLATE_ITEM_NAME && !data?.core && !!data?.current && ACL.canWrite(me, dataPermission)
        return [canEdit]
    }, [data, item.name, me, permissionService])
    const [canEdit] = permissions

    const columns = useMemo(() => getAttributeColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenAttributeColumns(), [])

    const getInitialNamedAttributes = useCallback((): NamedAttribute[] => {
        const spec: ItemSpec = data?.spec ?? {}
        const attributes = spec.attributes ?? {}
        let namedAttributes = Object.keys(spec.attributes ?? {})
            .map(attrName => ({name: attrName, ...attributes[attrName]}))
        
        if (item.name !== ITEM_TEMPLATE_ITEM_NAME && namedAttributes.length > 0) {
            const defaultTemplateAttrNameSet = new Set(Object.keys(itemTemplateService.getDefault().spec.attributes))
            namedAttributes = namedAttributes.filter(it => !defaultTemplateAttrNameSet.has(it.name))
        }
        
        return namedAttributes

    }, [data?.spec, item.name, itemTemplateService])
    const [namedAttributes, setNamedAttributes] = useState<NamedAttribute[]>(getInitialNamedAttributes())
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedAttribute>>(getInitialData())

    const handleRequest = useCallback(async (params: RequestParams) => {
        setFilteredData(processLocal(namedAttributes, params))
    }, [namedAttributes])

    const handleRowDoubleClick = useCallback((row: Row<ItemData>) => {}, [])
    
    return (
        <DataGrid
            columns={columns}
            data={filteredData}
            initialState={{
                hiddenColumns: hiddenColumns,
                pageSize: appConfig.query.defaultPageSize
            }}
            // toolbar={item.localized && <Checkbox onChange={handleLocalizationsCheckBoxChange}>{t('All Locales')}</Checkbox>}
            onRequest={handleRequest}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}