import _ from 'lodash'
import {gql} from '@apollo/client'

import {Attribute, AttrType, Item, RelType} from '../types'
import {apolloClient} from './index'
import appConfig from '../config'
import {RequestParams} from '../components/datagrid/DataGrid'
import {ColumnFiltersState} from '@tanstack/react-table'
import {ItemCache} from '../features/registry/registrySlice'
import {DateTime} from 'luxon'
import {
    DATE_FORMAT_STRING,
    DATETIME_FORMAT_STRING,
    HOUR_FORMAT_STRING,
    STD_DATE_FORMAT_STRING,
    STD_DATETIME_FORMAT_STRING,
    TIME_FORMAT_STRING,
    YEAR_FORMAT_STRING
} from '../config/constants'

type FiltersInput<FiltersType> = {
    and?: [FiltersType]
    or?: [FiltersType]
    not?: FiltersType
} & {[name: string]: FiltersInput<unknown> | FilterInput<unknown, unknown>}

type FilterInput<FilterType, ElementType> = {
    and?: [FilterType]
    or?: [FilterType]
    not?: FilterType
    eq?: ElementType
    ne?: ElementType
    gt?: ElementType
    gte?: ElementType
    lt?: ElementType
    lte?: ElementType
    between?: ElementType[]
    startsWith?: ElementType
    endsWith?: ElementType
    contains?: ElementType
    containsi?: ElementType
    notContains?: ElementType
    notContainsi?: ElementType
    in?: ElementType[]
    notIn?: ElementType[]
    null?: boolean
    notNull?: boolean
}

interface ResponseCollection<T> {
    data: T[]
    meta: ResponseCollectionMeta
}

interface ResponseCollectionMeta {
    pagination: Pagination
}

interface Pagination {
    limit?: number
    page: number
    pageCount?: number
    pageSize: number
    start?: number
    total: number
}

function buildDateFilter(filterValue: string): FilterInput<unknown, string> {
    let dt = DateTime.fromFormat(filterValue, DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    } else {
        dt = DateTime.fromFormat(filterValue, STD_DATE_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    } else {
        dt = DateTime.fromFormat(filterValue, YEAR_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    } else
        return {}
}

function buildTimeFilter(filterValue: string): FilterInput<unknown, string> {
    let dt = DateTime.fromFormat(filterValue, TIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    } else {
        dt = DateTime.fromFormat(filterValue, HOUR_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    } else
        return {}
}

function buildDateTimeFilter(filterValue: string): FilterInput<unknown, string> {
    let dt = DateTime.fromFormat(filterValue, DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    } else {
        dt = DateTime.fromFormat(filterValue, STD_DATETIME_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    } else {
        dt = DateTime.fromFormat(filterValue, DATE_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    } else {
        dt = DateTime.fromFormat(filterValue, STD_DATE_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    } else {
        dt = DateTime.fromFormat(filterValue, YEAR_FORMAT_STRING)
    }
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    } else
        return {}
}

export default class QueryService {
    constructor(private items: ItemCache) {}

    findAll = (item: Item, {sorting, filters, pagination}: RequestParams): Promise<ResponseCollection<any>> => {
        const query = gql(this.buildFindAllQuery(item))
        const {page, pageSize} = pagination

        return apolloClient.query({
            query,
            variables: {
                sort: sorting.map(it => `${it.id}:${it.desc ? 'desc' : 'asc'}`),
                filters: this.buildItemFiltersInput(item, filters),
                pagination: {page, pageSize}
            }
        })
            .then(result => {
                if (result.errors) {
                    throw new Error(result.errors.map(err => err.message).join('; '))
                }
                return result.data[item.pluralName]
            })
    }

    private buildFindAllQuery = (item: Item) => `
        query findAll${_.upperFirst(item.pluralName)}($sort: [String], $filters: ${_.upperFirst(item.name)}FiltersInput, $pagination: PaginationInput) {
            ${item.pluralName} (
                sort: $sort
                filters: $filters
                pagination: $pagination
            ) {
                data {
                    ${this.listNonCollectionAttributes(item).join('\n')}
                }
                meta {
                    pagination {
                        page
                        pageCount
                        pageSize
                        total
                    }
                }
            }
        }
    `

    private listNonCollectionAttributes = (item: Item): string[] => {
        const result: string[] = []
        const {attributes} = item.spec
        for (const attrName in attributes) {
            if (!attributes.hasOwnProperty(attrName))
                continue

            const attr = attributes[attrName]
            if (
                attr.private
                || attr.type === AttrType.media
                || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany))
            )
                continue

            if (attr.type === AttrType.relation) {
                if (appConfig.query.findAll.useDisplayAttrName) {
                    if (!attr.target)
                        throw new Error('Illegal attribute')

                    const subItem = this.items[attr.target]
                    result.push(`${attrName} { data { ${subItem.displayAttrName ?? 'id'} } }`)
                } else {
                    result.push(`${attrName} { data { id } }`)
                }
            } else {
                result.push(attrName)
            }
        }

        return result
    }

    private buildItemFiltersInput = (item: Item, filters: ColumnFiltersState): FiltersInput<unknown> => {
        const {attributes} = item.spec
        const filtersInput: FiltersInput<unknown> = {}
        for (const filter of filters) {
            const attr = attributes[filter.id]
            if (
                attr.private
                || attr.type === AttrType.media
                || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany))
            )
                continue

            filtersInput[filter.id] = this.buildAttributeFiltersInput(attr, filter.value)
        }

        return filtersInput
    }

    private buildAttributeFiltersInput(attribute: Attribute, filterValue: any): FiltersInput<unknown> | FilterInput<unknown, unknown> {
        if (
            attribute.private
            || attribute.type === AttrType.media
            || (attribute.type === AttrType.relation && (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany))
        )
            throw Error('Illegal attribute')

        switch (attribute.type) {
            case AttrType.string:
            case AttrType.text:
            case AttrType.uuid:
            case AttrType.email:
            case AttrType.password:
            case AttrType.sequence:
            case AttrType.enum:
            case AttrType.json:
            case AttrType.array:
                return {containsi: filterValue}
            case AttrType.int:
            case AttrType.long:
            case AttrType.float:
            case AttrType.double:
            case AttrType.decimal:
                return {eq: filterValue}
            case AttrType.bool:
                const lowerStrValue = (filterValue as string).toLowerCase()
                if (lowerStrValue === '1' || lowerStrValue === 'true' || lowerStrValue === 'yes' || lowerStrValue === 'y' || lowerStrValue === 'on')
                    return  {eq: true}
                else if (lowerStrValue === '0' || lowerStrValue === 'false' || lowerStrValue === 'no' || lowerStrValue === 'n' || lowerStrValue === 'off')
                    return {eq: false}
                else
                    break
            case AttrType.date:
                return buildDateFilter(filterValue)
            case AttrType.time:
                return buildTimeFilter(filterValue)
            case AttrType.datetime:
            case AttrType.timestamp:
                return buildDateTimeFilter(filterValue)
            case AttrType.relation:
                if (!attribute.target)
                    throw new Error('Illegal attribute')

                const subItem = this.items[attribute.target]
                const displayAttrName = subItem.displayAttrName ?? 'id'
                return {
                    [displayAttrName]: this.buildAttributeFiltersInput(subItem.spec.attributes[displayAttrName], filterValue)
                }
            default:
                throw Error('Illegal attribute')
        }

        return {}
    }
}
