import {useCallback, useMemo} from 'react'
import {useItemOperations, useRegistry} from '../util/hooks'
import {DASHBOARD_ITEM_NAME, DATASET_ITEM_NAME} from '../config/constants'
import {QueryFilter} from '../types'

export function useBI() {
    const {items: itemMap} = useRegistry()
    const {open} = useItemOperations()
    const datasetItem = useMemo(() => itemMap[DATASET_ITEM_NAME], [itemMap])
    const dashboardItem = useMemo(() => itemMap[DASHBOARD_ITEM_NAME], [itemMap])

    const openDataset = useCallback(async (id: string) => {
        await open(datasetItem, id)
    }, [datasetItem, open])

    const openDashboard = useCallback(async (id: string, queryFilter: QueryFilter) => {
        await open(dashboardItem, id, {queryFilter})
    }, [dashboardItem, open])

    return {openDataset, openDashboard}
}