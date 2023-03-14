import _ from 'lodash'
import {gql} from '@apollo/client'
import {ColumnFiltersState, SortingState} from '@tanstack/react-table'

import i18n from '../i18n'
import {apolloClient, extractGraphQLErrorMessages} from './index'
import {Attribute, FieldType, Item, ItemData, RelType, Response, ResponseCollection} from '../types'
import {DateTime} from 'luxon'
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
    LUXON_YEAR_MONTH_FORMAT_STRING
} from '../config/constants'
import ItemService from './item'
import {RequestParams} from '../components/datagrid/DataGrid'

export interface ExtRequestParams extends RequestParams {
    majorRev?: string | null
    locale?: string | null
    state?: string | null
}

export type ItemFiltersInput<FiltersType extends ItemData> = {
    and?: FiltersType[]
    or?: FiltersType[]
    not?: FiltersType
} & {[name: string]: ItemFiltersInput<FiltersType> | ItemFilterInput<FiltersType, string | boolean | number>}

export type ItemFilterInput<FilterType extends ItemData, ElementType extends string | boolean | number> = {
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
    and?: FilterType[]
    or?: FilterType[]
    not?: FilterType
}

const SORT_ATTR_PATTERN = /^(\w+)\.?(\w+)?$/

function buildDateFilter(filterValue: string): ItemFilterInput<ItemData, string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISODate(), lte: endDt.toISODate()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

function buildTimeFilter(filterValue: string): ItemFilterInput<ItemData, string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_TIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISOTime(), lte: endDt.toISOTime()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

function buildDateTimeFilter(filterValue: string): ItemFilterInput<ItemData, string> {
    let dt = DateTime.fromFormat(filterValue, LUXON_DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATETIME_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('minute')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_HOURS_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('hour')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_DATE_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('day')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_STD_YEAR_MONTH_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('month')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    dt = DateTime.fromFormat(filterValue, LUXON_YEAR_FORMAT_STRING)
    if (dt.isValid) {
        const endDt = dt.endOf('year')
        return {gte: dt.toISO(), lte: endDt.toISO()}
    }

    throw new Error(i18n.t('Invalid filter format'))
}

function attributePathToGraphQl(attributePath: string): string {
    const tokens = attributePath.split('.')
    if (tokens.length === 1)
        return attributePath

    return tokens.join(' { ') + ' }'.repeat(tokens.length - 1)
}

function getAttribute(data: ItemData, attributePath: string): any {
    const tokens = attributePath.split('.')
    if (tokens.length === 1)
        return data[attributePath]

    return tokens.reduce((obj, s) => (obj ?? {})[s], data)
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
        query find${_.upperFirst(item.name)}($id: ID!) {
            ${item.name}(id: $id) {
                data {
                    ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                }
            }
        }
    `

    findAll = async (
        item: Item,
        {sorting, filters, pagination, majorRev, locale, state}: ExtRequestParams,
        extraFiltersInput?: ItemFiltersInput<ItemData>,
        attributePaths?: {[name: string]: string}
    ): Promise<ResponseCollection<ItemData>> => {
        const attributesOverride = _.mapValues(attributePaths, v => attributePathToGraphQl(v))
        const query = gql(this.buildFindAllQuery(item, null, attributesOverride))
        const {page, pageSize} = pagination
        const variables: any = {
            sort: this.buildSortExpression(item, sorting),
            filters: {...this.buildItemFiltersInput(item, filters), ...extraFiltersInput},
            pagination: {page, pageSize},
        }
        if (item.versioned && majorRev)
            variables.majorRev = majorRev

        if (item.localized && locale)
            variables.locale = locale

        // if (item.localized)
        //     variables.locale = locale || this.coreConfigService.coreConfig.i18n.defaultLocale

        if (state)
            variables.state = state

        const res = await apolloClient.query({query, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        const responseCollection = res.data[item.pluralName] as ResponseCollection<ItemData>
        if (_.isEmpty(attributePaths))
            return responseCollection

        const dataWithAttributePaths: ItemData[] = responseCollection.data.map(d => {
            const o = {...d}
            _.forOwn(attributePaths, v => {
                o[v] = getAttribute(d, v)
            })

            return o
        })

        return {...responseCollection, data: dataWithAttributePaths}
    }

    private buildSortExpression = (
        item: Item,
        sorting: SortingState,
        overrideAttributes?: {[name: string]: string}
    ) => sorting.map(it => {
        const matchRes = it.id.match(SORT_ATTR_PATTERN)
        if (matchRes == null)
            throw new Error(`Illegal sort attribute [${it.id}]`)

        const attrName = matchRes[1]
        const nestedAttrName = matchRes[2]
        const dir = it.desc ? 'desc' : 'asc'
        if (nestedAttrName == null) {
            const attr = item.spec.attributes[attrName]
            switch (attr.type) {
                case FieldType.relation:
                    const target = this.itemService.getByName(attr.target as string)
                    return `${attrName}.${target.titleAttribute}:${dir}`
                case FieldType.media:
                    const media = this.itemService.getMedia()
                    return `${attrName}.${media.titleAttribute}:${dir}`
                default:
                    return `${attrName}:${dir}`
            }
        } else {
            return `${attrName}.${nestedAttrName}:${dir}`
        }
    })

    private buildFindAllQuery = (item: Item, state?: string | null, attributesOverride?: {[name: string]: string}) => `
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
                    ${this.itemService.listNonCollectionAttributes(item, attributesOverride).join('\n')}
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

    async findAllRelated(
        itemName: string,
        itemId: string,
        relAttrName: string,
        target: Item,
        {sorting, filters, pagination}: ExtRequestParams,
        extraFiltersInput?: ItemFiltersInput<ItemData>
    ): Promise<ResponseCollection<any>> {
        const query = gql(this.buildFindAllRelatedQuery(itemName, relAttrName, target))
        const {page, pageSize} = pagination
        const variables = {
            id: itemId,
            sort: this.buildSortExpression(target, sorting),
            filters: {...this.buildItemFiltersInput(target, filters), ...extraFiltersInput},
            pagination: {page, pageSize},
        }

        const res = await apolloClient.query({query, variables})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data[itemName].data[relAttrName]
    }

    private buildFindAllRelatedQuery = (itemName: string, relationAttrName: string, target: Item) => `
        query find${_.upperFirst(itemName)}${_.upperFirst(relationAttrName)}(
            $id: ID!
            $sort: [String]
            $filters: ${_.upperFirst(target.name)}FiltersInput
            $pagination: PaginationInput
        ) {
            ${itemName}(id: $id) {
                data {
                    ${relationAttrName}(
                        sort: $sort
                        filters: $filters
                        pagination: $pagination
                    ) {
                        data {
                            ${this.itemService.listNonCollectionAttributes(target).join('\n')}
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
            }
        }
    `

    private buildItemFiltersInput = (item: Item, filters: ColumnFiltersState): ItemFiltersInput<ItemData> => {
        const {attributes} = item.spec
        const filtersInput: ItemFiltersInput<ItemData> = {}
        for (const filter of filters) {
            const attr = attributes[filter.id]
            if (attr.private || (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
                continue

            filtersInput[filter.id] = this.buildAttributeFiltersInput(attr, filter.value)
        }

        return filtersInput
    }

    private buildAttributeFiltersInput(attr: Attribute, filterValue: any): ItemFiltersInput<ItemData> | ItemFilterInput<ItemData, any> {
        if (attr.private || (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
            throw Error('Illegal attribute')

        switch (attr.type) {
            case FieldType.string:
            case FieldType.text:
            case FieldType.uuid:
            case FieldType.email:
            case FieldType.password:
            case FieldType.sequence:
            case FieldType.enum:
            case FieldType.json:
            case FieldType.array:
                return {containsi: filterValue}
            case FieldType.int:
            case FieldType.long:
            case FieldType.float:
            case FieldType.double:
            case FieldType.decimal:
                return {eq: filterValue}
            case FieldType.bool:
                const lowerStrValue = (filterValue as string).toLowerCase()
                if (lowerStrValue === '1' || lowerStrValue === 'true' || lowerStrValue === 'yes' || lowerStrValue === 'y')
                    return  {eq: true}
                else if (lowerStrValue === '0' || lowerStrValue === 'false' || lowerStrValue === 'no' || lowerStrValue === 'n')
                    return {eq: false}
                else
                    break
            case FieldType.date:
                return buildDateFilter(filterValue)
            case FieldType.time:
                return buildTimeFilter(filterValue)
            case FieldType.datetime:
            case FieldType.timestamp:
                return buildDateTimeFilter(filterValue)
            case FieldType.media:
                return {filename: {containsi: filterValue}}
            case FieldType.relation:
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

    findAllBy = async (item: Item, filtersInput: ItemFiltersInput<ItemData>): Promise<ItemData[]> => {
        const query = gql(this.buildFindAllBy(item))
        const res = await apolloClient.query({query, variables: {filters: filtersInput}})
        if (res.errors) {
            console.error(extractGraphQLErrorMessages(res.errors))
            throw new Error(i18n.t('An error occurred while executing the request'))
        }

        return res.data[item.pluralName].data
    }

    private buildFindAllBy = (item: Item) => `
        query findAll${_.upperFirst(item.pluralName)}By($filters: ${_.upperFirst(item.name)}FiltersInput!) {
            ${item.pluralName} (
                filters: $filters
            ) {
                data {
                    ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                }
            }
        }
    `

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
        query findAll${_.upperFirst(item.name)}Localizations($configId: String!, $majorRev: String!, $locale: String!) {
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
                    ${this.itemService.listNonCollectionAttributes(item).join('\n')}
                }
            }
        }
    `
}
