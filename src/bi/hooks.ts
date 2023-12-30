import {useCallback, useEffect, useMemo, useState} from 'react'

import * as DatasetService from '../services/dataset'
import * as DashboardService from '../services/dashboard'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {useItemOperations, useRegistry} from '../util/hooks'
import {DASHBOARD_ITEM_NAME, DATASET_ITEM_NAME} from '../config/constants'
import {Dashboard, DashboardCategory, Dataset, QueryFilter} from '../types/bi'
import _ from 'lodash'

interface UseBIProps {
    withDatasets?: boolean
    withDashboards?: boolean
    withDashboardCategories?: boolean
}

const defaultProps = {
    withDatasets: false,
    withDashboards: false,
    withDashboardCategories: false
}

export function useBI({withDatasets, withDashboards, withDashboardCategories}: UseBIProps = defaultProps) {
    const {items: itemMap} = useRegistry()
    const {open} = useItemOperations()
    const datasetItem = useMemo(() => itemMap[DATASET_ITEM_NAME], [itemMap])
    const dashboardItem = useMemo(() => itemMap[DASHBOARD_ITEM_NAME], [itemMap])
    const [datasets, setDatasets] = useState<Dataset[]>([])
    const [dashboards, setDashboards] = useState<Dashboard[]>([])
    const [dashboardCategories, setDashboardCategories] = useState<DashboardCategory[]>([])

    useEffect(() => {
        if (withDatasets) {
            DatasetService.fetchDatasets()
                .then(datasetList => {
                    setDatasets(_.sortBy(datasetList, ds => ds.name))
                })
        }

        if (withDashboards) {
            DashboardService.fetchDashboards()
                .then(dashboardList => {
                    setDashboards(_.sortBy(dashboardList, db => db.name))
                })
        }

        if (withDashboardCategories) {
            DashboardCategoryService.fetchDashboardCategories()
                .then(dashboardCategoryList => {
                    setDashboardCategories(_.sortBy(dashboardCategoryList, dc => dc.name))
                })
        }
    }, [])

    const openDataset = useCallback(async (id: string) => {
        await open(datasetItem, id)
    }, [datasetItem, open])

    const openDashboard = useCallback(async (id: string, queryFilter?: QueryFilter) => {
        await open(dashboardItem, id, queryFilter ? {queryFilter} : undefined)
    }, [dashboardItem, open])

    return {datasets, dashboards, dashboardCategories, openDataset, openDashboard}
}