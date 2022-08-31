import _ from 'lodash'
import {gql} from '@apollo/client'
import {ColumnFiltersState} from '@tanstack/react-table'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from './index'
import {Attribute, AttrType, Item, ItemData, RelType, Response, ResponseCollection} from '../types'
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

    findById = async (item: Item, id: string): Promise<Response> => {
        const query = gql(this.buildFindByIdQuery(item))

        const res = await apolloClient.query({query, variables: {id}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data[item.name]
    }

    private buildFindByIdQuery = (item: Item) => `
        query find${_.upperFirst(item.name)}($id: UUID!) {
            ${item.name}(id: $id) {
                data {
                    ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                }
            }
        }
    `

    findAll = async (item: Item, {sorting, filters, pagination, majorRev, locale, state}: RequestParams, extraFiltersInput?: FiltersInput<unknown>): Promise<ResponseCollection<any>> => {
        const query = gql(this.buildFindAllQuery(item))
        const {page, pageSize} = pagination
        const variables: any = {
            sort: sorting.map(it => `${it.id}:${it.desc ? 'desc' : 'asc'}`),
            filters: {...this.buildItemFiltersInput(item, filters), ...extraFiltersInput},
            pagination: {page, pageSize},
        }
        if (item.versioned && majorRev)
            variables.majorRev = majorRev

        if (item.localized && locale)
            variables.locale = locale

        if (state)
            variables.state = state

        const res = await apolloClient.query({query, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data[item.pluralName]
    }

    private buildFindAllQuery = (item: Item, state?: string) => `
        query findAll${_.upperFirst(item.pluralName)}(
            $sort: [String]
            $filters: ${_.upperFirst(item.name)}FiltersInput
            $pagination: PaginationInput
            ${item.versioned ? '$majorRev: String' : ''}
            ${item.localized ? '$locale: String' : ''}
            ${state ? '$state: String' : ''}
        ) {
            ${item.pluralName}(
                sort: $sort
                filters: $filters
                pagination: $pagination,
                ${item.versioned ? 'majorRev: $majorRev' : ''}
                ${item.localized ? 'locale: $locale' : ''}
                ${state ? 'state: $state' : ''}
            ) {
                data {
                    ${this.itemService.listNonCollectionAttributes(item).join('\n')}
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

    findLocalization = async (item: Item, configId: string, majorRev: string, locale: string): Promise<ItemData | null> => {
        const query = gql(this.buildFindAllLocalizations(item))
        const res = await apolloClient.query({query, variables: {configId, majorRev, locale}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }
        const data = res.data[item.pluralName].data as ItemData[]
        if (data.length > 1) {
            throw new Error('The localization request returned more than one record')
        }

        return data.length === 1 ? data[0] : null
    }

    private buildFindAllLocalizations = (item: Item) => `
        query findAll${_.upperFirst(item.name)}Localizations ($configId: String!, majorRev: String!, $locale: String!) {
            ${item.pluralName} (
                majorRev: $majorRev
                locale: $locale
                filters: {
                    configId: {
                        eq: $configId
                    }
                }
            ) {
                data {
                    id
                }
            }
        }
    `
}
