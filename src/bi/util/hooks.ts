import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'

import * as DatasetService from 'src/services/dataset'
import * as DashboardService from 'src/services/dashboard'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {useItemOperations, useRegistry} from 'src/util/hooks'
import {DASHBOARD_ITEM_NAME, DATASET_ITEM_NAME} from 'src/config/constants'
import {Dashboard, DashboardCategory, Dataset, IDash, ISelector, QueryFilter, SelectorLinkType} from 'src/types/bi'
import {SelectorFilter} from '../../types/bi'

interface UseBIProps {
    withDatasets?: boolean
    withDashboards?: boolean
    withDashboardCategories?: boolean
}

interface UseBIResult {
    datasets: Dataset[]
    dashboards: Dashboard[]
    dashboardCategories: DashboardCategory[]
    openDataset: (id: string) => void
    openDashboard: (id: string, queryFilter?: QueryFilter) => void
}


const defaultUseBIProps = {
  withDatasets: false,
  withDashboards: false,
  withDashboardCategories: false
}

export function useBI({withDatasets, withDashboards, withDashboardCategories}: UseBIProps = defaultUseBIProps): UseBIResult {
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

interface UseSelectorsProps {
    selectors: ISelector[]
    onSelectorChange: (selector: ISelector) => void
}

interface UseSelectorsResult {
    selectedDashFilters: Record<string, SelectorFilter[]>
    selectDashValue: (id: string, value: any) => void
}

export function useSelectors({selectors, onSelectorChange}: UseSelectorsProps): UseSelectorsResult {
  const selectedDashFilters = useMemo<Record<string, SelectorFilter[]>>(() => {
    const res: Record<string, SelectorFilter[]> = {}
    selectors
      .filter(selector => selector.value != null)
      .filter(selector => selector.links.filter(link => link.type === SelectorLinkType.out || link.type === SelectorLinkType.both).length > 0)
      .forEach(selector => {
        selector.links
          .filter(link => link.type === SelectorLinkType.out || link.type === SelectorLinkType.both)
          .forEach(link => {
            res[link.dashId] = res[link.dashId] ?? []
            res[link.dashId].push({
              field: selector.field,
              type: selector.type,
              op: selector.op,
              value: selector.value,
              extra: selector.extra
            })
          })
      })

    return res
  }, [selectors])

  const selectDashValue = useCallback((id: string, value: any) => {
    selectors
      .filter(selector => selector.links.filter(link => link.dashId === id && (link.type === SelectorLinkType.in || link.type === SelectorLinkType.both)).length > 0)
      .forEach(selector => onSelectorChange({
        ...selector,
        value
      }))
  }, [selectors, onSelectorChange])

  return {
    selectedDashFilters,
    selectDashValue
  }
}