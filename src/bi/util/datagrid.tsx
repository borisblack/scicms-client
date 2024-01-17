import _ from 'lodash'
import {ReactNode} from 'react'
import {ColumnDef, ColumnFiltersState, createColumnHelper, SortingState} from '@tanstack/react-table'
import {Checkbox} from 'antd'
import {DateTime} from 'luxon'

import {FieldType, Pagination, PrimitiveFilterInput} from 'src/types'
import appConfig from 'src/config'
import {DataWithPagination, RequestParams} from 'src/components/datagrid/DataGrid'
import {
    LUXON_DATE_FORMAT_STRING,
    LUXON_DATE_HOURS_FORMAT_STRING,
    LUXON_DATETIME_FORMAT_STRING,
    LUXON_HOURS_FORMAT_STRING,
    LUXON_STD_DATE_FORMAT_STRING,
    LUXON_STD_DATE_HOURS_FORMAT_STRING,
    LUXON_STD_DATETIME_FORMAT_STRING,
    LUXON_STD_YEAR_MONTH_FORMAT_STRING,
    LUXON_TIME_FORMAT_STRING,
    LUXON_YEAR_FORMAT_STRING,
    LUXON_YEAR_MONTH_FORMAT_STRING,
    UTC
} from 'src/config/constants'
import i18n from 'src/i18n'
import {Column, Dataset, DatasetFiltersInput} from 'src/types/bi'
import * as DatasetService from 'src/services/dataset'
import {DatasetFieldInput, DatasetInput} from 'src/services/dataset'

interface DatasetData<T> extends DataWithPagination<T> {
    timeMs?: number
    cacheHit?: boolean
    query?: string
    params?: Record<string, any>
}

const {luxonDisplayDateFormatString, luxonDisplayTimeFormatString, luxonDisplayDateTimeFormatString} = appConfig.dateTime
const columnHelper = createColumnHelper<any>()

export const getInitialData = (): DataWithPagination<any> => ({
    data: [],
    pagination: {
        page: 1,
        pageSize: appConfig.query.defaultPageSize,
        total: 0
    }
})

export const getColumns = (actualFields: Record<string, Column>): ColumnDef<any, any>[] =>
    Object.keys(actualFields)
        .filter(fieldName => !actualFields[fieldName].hidden)
        .map(fieldName => {
            const field = actualFields[fieldName]
            return columnHelper.accessor(fieldName, {
                header: field.alias ? i18n.t(field.alias) as string : fieldName,
                cell: info => renderCell(field, info.getValue()),
                size: _.isString(field.colWidth) ? parseInt(field.colWidth.replace(/\D/g, '')) : (field.colWidth ?? appConfig.ui.dataGrid.colWidth),
                enableSorting: field.type !== FieldType.text,
                enableColumnFilter: true
            })
        })

const renderCell = (field: Column, value: any): ReactNode => {
    switch (field.type) {
        case FieldType.string:
        case FieldType.text:
            return value
        case FieldType.int:
        case FieldType.long:
        case FieldType.float:
        case FieldType.double:
        case FieldType.decimal:
            return value
        case FieldType.bool:
            return <Checkbox checked={value}/>
        case FieldType.date:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateFormatString) : null
        case FieldType.time:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayTimeFormatString) : null
        case FieldType.datetime:
        case FieldType.timestamp:
            return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateTimeFormatString) : null
        default:
            throw new Error('Illegal attribute')
    }
}

export const getHiddenColumns = (actualColumns: Record<string, Column>): string[] => []

export async function loadData(dataset: Dataset, actualFields: Record<string, Column>, {sorting, filters, pagination}: RequestParams): Promise<DatasetData<any>> {
    const {page, pageSize} = pagination
    const datasetInput: DatasetInput<any> = {
        fields: buildFieldsInput(actualFields),
        filters: buildFiltersInput(actualFields, filters),
        sort: buildSortInput(sorting),
        pagination: {page, pageSize},
    }

    const datasetResponse = await DatasetService.loadData(dataset.name, datasetInput)
    const responsePagination = datasetResponse.meta.pagination as Pagination
    return {
        data: datasetResponse.data,
        timeMs: datasetResponse.timeMs,
        cacheHit: datasetResponse.cacheHit,
        query: datasetResponse.query,
        params: datasetResponse.params,
        pagination: {
            page: responsePagination.page as number,
            pageSize: responsePagination.pageSize,
            total: responsePagination.total
        }
    }
}

export const buildFieldsInput = (actualColumns: Record<string, Column>): DatasetFieldInput[] =>
    Object.keys(actualColumns)
        .filter(colName => !actualColumns[colName].hidden)
        .map(colName => {
            const column = actualColumns[colName]
            return {
                name: colName,
                custom: column.custom ?? false,
                source: column.source,
                formula: column.formula,
                aggregate: column.aggregate
            }
        })

function buildFiltersInput(actualColumns: Record<string, Column>, filters: ColumnFiltersState): DatasetFiltersInput<any> {
    const filtersInput: DatasetFiltersInput<any> = {}
    for (const filter of filters) {
        const column = actualColumns[filter.id]
        if (!column || column.hidden)
            continue

        filtersInput[filter.id] = buildColumnFiltersInput(column, filter.value)
    }

    return filtersInput
}

function buildColumnFiltersInput(column: Column, filterValue: any): DatasetFiltersInput<any> | PrimitiveFilterInput<any> {
    if (column.hidden)
        throw Error('Illegal column.')

    switch (column.type) {
        case FieldType.string:
        case FieldType.text:
            return {$containsi: filterValue}
        case FieldType.int:
        case FieldType.long:
        case FieldType.float:
        case FieldType.double:
        case FieldType.decimal:
            return {$eq: filterValue}
        case FieldType.bool:
            const lowerStrValue = (filterValue as string).toLowerCase()
            if (lowerStrValue === '1' || lowerStrValue === 'true' || lowerStrValue === 'yes' || lowerStrValue === 'y')
                return  {$eq: true}
            else if (lowerStrValue === '0' || lowerStrValue === 'false' || lowerStrValue === 'no' || lowerStrValue === 'n')
                return {$eq: false}
            else
                break
        case FieldType.date:
            return buildDateFilter(filterValue)
        case FieldType.time:
            return buildTimeFilter(filterValue)
        case FieldType.datetime:
        case FieldType.timestamp:
            if (column.format === FieldType.date)
                return buildDateFilter(filterValue)
            else if (column.format === FieldType.time)
                return buildTimeFilter(filterValue)
            else
                return buildDateTimeFilter(filterValue)
        default:
            throw Error('Illegal column.')
    }

    throw new Error('Illegal column.')
}

function buildDateFilter(filterValue: string): PrimitiveFilterInput<string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {$gte: dt.toISODate() as string, $lte: endDt.toISODate() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {$gte: dt.toISODate() as string, $lte: endDt.toISODate() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {$gte: dt.toISODate() as string, $lte: endDt.toISODate() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {$gte: dt.toISODate() as string, $lte: endDt.toISODate() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {$gte: dt.toISODate() as string, $lte: endDt.toISODate() as string}
    }

    throw new Error(i18n.t('Invalid filter format.'))
}

function buildTimeFilter(filterValue: string): PrimitiveFilterInput<string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_TIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {$gte: dt.toISOTime() as string, $lte: endDt.toISOTime() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {$gte: dt.toISOTime() as string, $lte: endDt.toISOTime() as string}
    }

    throw new Error(i18n.t('Invalid filter format.'))
}

function buildDateTimeFilter(filterValue: string): PrimitiveFilterInput<string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {$gte: dt.toISO() as string, $lte: endDt.toISO() as string}
    }

    throw new Error(i18n.t('Invalid filter format.'))
}

const buildSortInput = (sorting: SortingState): string[] => sorting.map(sortItem => {
    const colName = sortItem.id
    const dir = sortItem.desc ? 'desc' : 'asc'
    return `${colName}:${dir}`
})
