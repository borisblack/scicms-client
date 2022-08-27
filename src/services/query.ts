import _ from 'lodash'
import {gql} from '@apollo/client'
import {ColumnFiltersState} from '@tanstack/react-table'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from './index'
import {Attribute, AttrType, Item, RelType} from '../types'
import {DateTime} from 'luxon'
import {
    DATE_FORMAT_STRING,
    DATE_HOURS_FORMAT_STRING,
    DATETIME_FORMAT_STRING,
    HOURS_FORMAT_STRING,
    STD_DATE_FORMAT_STRING,
    STD_DATE_HOURS_FORMAT_STRING,
    STD_DATETIME_FORMAT_STRING,
    STD_YEAR_MONTH_FORMAT_STRING,
    TIME_FORMAT_STRING,
    YEAR_FORMAT_STRING,
    YEAR_MONTH_FORMAT_STRING
} from '../config/constants'
import ItemService from './item'
import {RequestParams} from '../components/datagrid/DataGrid'

interface Response<T> {
    data: T
}

export type FiltersInput<FiltersType> = {
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
    }

    dt = DateTime.fromFormat(filterValue, STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

function buildTimeFilter(filterValue: string): FilterInput<unknown, string> {
    let dt = DateTime.fromFormat(filterValue, TIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    }

    dt = DateTime.fromFormat(filterValue, HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

function buildDateTimeFilter(filterValue: string): FilterInput<unknown, string> {
    let dt = DateTime.fromFormat(filterValue, DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, STD_DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, STD_DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

export default class QueryService {
    private static instance: QueryService | null = null

    static getInstance() {
        if (!QueryService.instance)
            QueryService.instance = new QueryService()

        return QueryService.instance
    }

    private itemService = ItemService.getInstance()

    findById = (item: Item, id: string): Promise<Response<any>> => {
        const query = gql(this.buildFindByIdQuery(item))

        return apolloClient.query({query, variables: {id}})
            .then(result => {
                if (result.errors) {
                    console.error(extractGraphQLErrorMessages(result.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return result.data[item.name]
            })
    }

    private buildFindByIdQuery = (item: Item) => `
        query find${_.upperFirst(item.name)} ($id: ID!) {
            ${item.name} (id: $id) {
                data {
                    ${this.listNonCollectionAttributes(item).join('\n')}
                }
            }
        }
    `

    findAll = (item: Item, {sorting, filters, pagination}: RequestParams, extraFiltersInput?: FiltersInput<unknown>): Promise<ResponseCollection<any>> => {
        const query = gql(this.buildFindAllQuery(item))
        const {page, pageSize} = pagination

        return apolloClient.query({
            query,
            variables: {
                sort: sorting.map(it => `${it.id}:${it.desc ? 'desc' : 'asc'}`),
                filters: {...this.buildItemFiltersInput(item, filters), ...extraFiltersInput},
                pagination: {page, pageSize}
            }
        })
            .then(result => {
                if (result.errors) {
                    console.error(extractGraphQLErrorMessages(result.errors))
                    throw new Error(i18n.t('An error occurred while executing the request'))
                }
                return result.data[item.pluralName]
            })
    }

    private buildFindAllQuery = (item: Item) => `
        query findAll${_.upperFirst(item.pluralName)} ($sort: [String], $filters: ${_.upperFirst(item.name)}FiltersInput, $pagination: PaginationInput) {
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
            if (attr.private || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            switch (attr.type) {
                case AttrType.string:
                case AttrType.text:
                case AttrType.uuid:
                case AttrType.email:
                case AttrType.password:
                case AttrType.sequence:
                case AttrType.enum:
                case AttrType.int:
                case AttrType.long:
                case AttrType.float:
                case AttrType.double:
                case AttrType.decimal:
                case AttrType.bool:
                case AttrType.date:
                case AttrType.time:
                case AttrType.datetime:
                case AttrType.timestamp:
                case AttrType.json:
                case AttrType.array:
                    result.push(attrName)
                    break
                case AttrType.media:
                    const media = this.itemService.getMedia()
                    result.push(`${attrName} { data { id ${media.titleAttribute} ${media.titleAttribute === 'filename' ? '' : 'filename'} } }`)
                    break
                case AttrType.location:
                    result.push(`${attrName} { data { id latitude longitude label } }`)
                    break
                case AttrType.relation:
                    if (!attr.target)
                        throw new Error('Illegal attribute')

                    const subItem = this.itemService.getByName(attr.target)
                    result.push(`${attrName} { data { id ${subItem.titleAttribute} } }`)
                    break
                default:
                    throw Error('Illegal attribute')
            }
        }

        return result
    }

    private buildItemFiltersInput = (item: Item, filters: ColumnFiltersState): FiltersInput<unknown> => {
        const {attributes} = item.spec
        const filtersInput: FiltersInput<unknown> = {}
        for (const filter of filters) {
            const attr = attributes[filter.id]
            if (attr.private || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            filtersInput[filter.id] = this.buildAttributeFiltersInput(attr, filter.value)
        }

        return filtersInput
    }

    private buildAttributeFiltersInput(attr: Attribute, filterValue: any): FiltersInput<unknown> | FilterInput<unknown, unknown> {
        if (attr.private || (attr.type === AttrType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
            throw Error('Illegal attribute')

        switch (attr.type) {
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
            case AttrType.media:
                return {filename: {containsi: filterValue}}
            case AttrType.location:
                return {label: {containsi: filterValue}}
            case AttrType.relation:
                if (!attr.target)
                    throw new Error('Illegal attribute')

                const subItem = this.itemService.getByName(attr.target)
                const {titleAttribute} = subItem
                return {
                    [titleAttribute]: this.buildAttributeFiltersInput(subItem.spec.attributes[titleAttribute], filterValue)
                }
            default:
                throw Error('Illegal attribute')
        }

        throw new Error('Illegal attribute')
    }
}
