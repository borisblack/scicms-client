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
    LUXON_YEAR_MONTH_FORMAT_STRING,
    MEDIA_ITEM_NAME
} from '../config/constants'
import {RequestParams} from '../components/datagrid/DataGrid'
import {ItemMap, listNonCollectionAttributes} from './item'

export interface ExtRequestParams extends RequestParams {
    majorRev?: string | null
    locale?: string | null
    state?: string | null
}

export type ItemFiltersInput<FiltersType extends ItemData> = {
    and?: FiltersType[] | null
    or?: FiltersType[] | null
    not?: FiltersType | null
} & {[name: string]: ItemFiltersInput<FiltersType> | ItemFilterInput<FiltersType, string | boolean | number>}

export type ItemFilterInput<FilterType extends ItemData, ElementType extends string | boolean | number> = {
    eq?: ElementType | null
    ne?: ElementType | null
    gt?: ElementType | null
    gte?: ElementType | null
    lt?: ElementType | null
    lte?: ElementType | null
    between?: ElementType[]
    startsWith?: ElementType | null
    endsWith?: ElementType | null
    contains?: ElementType | null
    containsi?: ElementType | null
    notContains?: ElementType | null
    notContainsi?: ElementType | null
    in?: ElementType[] | null
    notIn?: ElementType[] | null
    null?: boolean | null
    notNull?: boolean | null
    and?: FilterType[] | null
    or?: FilterType[] | null
    not?: FilterType | null
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

export const findById = async (items: ItemMap, item: Item, id: string): Promise<Response> => {
    const query = gql(buildFindByIdQuery(items, item))

    const res = await apolloClient.query({query, variables: {id}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data[item.name]
}

const buildFindByIdQuery = (items: ItemMap, item: Item) => `
    query find${_.upperFirst(item.name)}($id: ID!) {
        ${item.name}(id: $id) {
            data {
                ${listNonCollectionAttributes(items, item).join('\n')}
            }
        }
    }
`

export const findAll = async (
    items: ItemMap,
    item: Item,
    {sorting, filters, pagination, majorRev, locale, state}: ExtRequestParams,
    extraFiltersInput?: ItemFiltersInput<ItemData>,
    attributePaths?: {[name: string]: string}
): Promise<ResponseCollection<ItemData>> => {
    const attributesOverride = _.mapValues(attributePaths, v => attributePathToGraphQl(v))
    const query = gql(buildFindAllQuery(items, item, null, attributesOverride))
    const {page, pageSize} = pagination
    const variables: any = {
        sort: buildSortExpression(items, item, sorting),
        filters: {...buildItemFiltersInput(items, item, filters), ...extraFiltersInput},
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

const buildSortExpression = (
    items: ItemMap,
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
                const target = items[attr.target as string]
                return `${attrName}.${target.titleAttribute}:${dir}`
            case FieldType.media:
                const media = items[MEDIA_ITEM_NAME]
                return `${attrName}.${media.titleAttribute}:${dir}`
            default:
                return `${attrName}:${dir}`
        }
    } else {
        return `${attrName}.${nestedAttrName}:${dir}`
    }
})

const buildFindAllQuery = (items: ItemMap, item: Item, state?: string | null, attributesOverride?: {[name: string]: string}) => `
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
                ${listNonCollectionAttributes(items, item, attributesOverride).join('\n')}
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

export async function findAllRelated(
    items: ItemMap,
    itemName: string,
    itemId: string,
    relAttrName: string,
    target: Item,
    {sorting, filters, pagination}: ExtRequestParams,
    extraFiltersInput?: ItemFiltersInput<ItemData>
): Promise<ResponseCollection<any>> {
    const query = gql(buildFindAllRelatedQuery(items, itemName, relAttrName, target))
    const {page, pageSize} = pagination
    const variables = {
        id: itemId,
        sort: buildSortExpression(items, target, sorting),
        filters: {...buildItemFiltersInput(items, target, filters), ...extraFiltersInput},
        pagination: {page, pageSize},
    }

    const res = await apolloClient.query({query, variables})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data[itemName].data[relAttrName]
}

const buildFindAllRelatedQuery = (items: ItemMap, itemName: string, relationAttrName: string, target: Item) => `
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
                        ${listNonCollectionAttributes(items, target).join('\n')}
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

const buildItemFiltersInput = (items: ItemMap, item: Item, filters: ColumnFiltersState): ItemFiltersInput<ItemData> => {
    const {attributes} = item.spec
    const filtersInput: ItemFiltersInput<ItemData> = {}
    for (const filter of filters) {
        const attr = attributes[filter.id]
        if (attr.private || (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany)))
            continue

        filtersInput[filter.id] = buildAttributeFiltersInput(items, attr, filter.value)
    }

    return filtersInput
}

function buildAttributeFiltersInput(items: ItemMap, attr: Attribute, filterValue: any): ItemFiltersInput<ItemData> | ItemFilterInput<ItemData, any> {
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

            const subItem = items[attr.target]
            const {titleAttribute} = subItem
            return {
                [titleAttribute]: buildAttributeFiltersInput(items, subItem.spec.attributes[titleAttribute], filterValue)
            }
        default:
            throw Error('Illegal attribute')
    }

    throw new Error('Illegal attribute')
}

export const findAllBy = async (items: ItemMap, item: Item, filtersInput: ItemFiltersInput<ItemData>): Promise<ItemData[]> => {
    const query = gql(buildFindAllBy(items, item))
    const res = await apolloClient.query({query, variables: {filters: filtersInput}})
    if (res.errors) {
        console.error(extractGraphQLErrorMessages(res.errors))
        throw new Error(i18n.t('An error occurred while executing the request'))
    }

    return res.data[item.pluralName].data
}

const buildFindAllBy = (items: ItemMap, item: Item) => `
    query findAll${_.upperFirst(item.pluralName)}By($filters: ${_.upperFirst(item.name)}FiltersInput!) {
        ${item.pluralName} (
            filters: $filters
        ) {
            data {
                ${listNonCollectionAttributes(items, item).join('\n')}
            }
        }
    }
`

export const findLocalization = async (items: ItemMap, item: Item, configId: string, majorRev: string, locale: string): Promise<ItemData | null> => {
    const query = gql(buildFindAllLocalizations(items, item))
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

const buildFindAllLocalizations = (items: ItemMap, item: Item) => `
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
                ${listNonCollectionAttributes(items, item).join('\n')}
            }
        }
    }
`
