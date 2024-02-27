import {FieldType, PrimitiveFilterInput} from '.'
import {Datasource, DefaultItemTemplate} from './schema'

export interface Dataset extends DefaultItemTemplate {
    name: string
    description: string | null
    datasource: {data: Datasource | null}
    tableName: string | null
    query: string | null
    cacheTtl: number | null
    spec: DatasetSpec
    hash: string | null
}

export interface DatasetSpec {
    columns: Record<string, Column>
    sources?: DatasetSources
    useDesigner?: boolean
}

export interface Column {
    type: ColumnType
    custom: boolean
    source?: string
    aggregate?: AggregateType
    formula?: string
    hidden: boolean
    alias?: string
    format?: FieldType.int | FieldType.float | FieldType.date | FieldType.time | FieldType.datetime
    colWidth?: string | number | null
}

export type ColumnType =
    FieldType.string | FieldType.text |
    FieldType.int | FieldType.long | FieldType.float | FieldType.double | FieldType.decimal |
    FieldType.date | FieldType.time | FieldType.datetime | FieldType.timestamp |
    FieldType.bool

export interface NamedColumn extends Column {
    name: string
}

export interface Table {
    name: string,
    columns: Record<string, Column>
}

export interface DatasetSources {
    mainTable: Table | null
    joinedTables: JoinedTable[]
}

export interface JoinedTable extends Table {
    alias?: string
    joinType?: JoinType
    joins: Join[]
}

export interface Join {
    field?: string
    mainTableField?: string
    op: UnaryQueryOp
}

export interface Dashboard extends DefaultItemTemplate {
    name: string
    isPublic: boolean
    spec: IDashboardSpec
    categories: {data: DashboardCategory[]}
}

export interface DashboardExtra {
    queryFilter?: QueryFilter
}

export interface DashboardCategory extends DefaultItemTemplate {
    name: string
    icon: string | null
    dashboards: {data: Dashboard[]}
    parentCategories: {data: DashboardCategory[]}
    childCategories: {data: DashboardCategory[]}
}

export interface IDashboardSpec {
    layout?: DashboardLayoutItem[]
    dashes: IDash[]
    selectors?: ISelector[]
    texts?: IText[]
}

export interface DashboardLayoutItem {
    id: string
    type: DashboardItemType
    x: number
    y: number
    w: number
    h: number
}

export enum DashboardItemType {
    DASH = 'DASH',
    SELECTOR = 'SELECTOR',
    TEXT = 'TEXT'
}

export interface IDash {
    id: string
    name: string
    x?: number
    y?: number
    w?: number
    h?: number
    dataset?: string
    type: string
    unit?: string
    fields: Record<string, Column>
    isAggregate: boolean
    aggregateType?: AggregateType
    aggregateField?: string
    groupField?: string | string[]
    sortField?: string | string[]
    optValues: {[key: string]: any}
    defaultFilters: QueryBlock
    relatedDashboardId?: string
    refreshIntervalSeconds: number
}

export interface ISelector extends SelectorFilter {
    id: string
    name: string
    dataset?: string
    links: SelectorLink[]
}

export interface SelectorLink {
    dashId: string
    type: SelectorLinkType
}

export enum SelectorLinkType {
    in = 'in',
    out = 'out',
    both = 'both'
}

export interface IText {
    id: string
    content: string
    level?: 1 | 2 | 3 | 4 | 5
}

export interface ExecutionStatisticInfo {
    timeMs?: number
    cacheHit?: boolean
    query?: string
    params?: Record<string, any>
}

export enum AggregateType {
    count = 'count',
    countd = 'countd',
    sum = 'sum',
    avg = 'avg',
    min = 'min',
    max = 'max'
}

export enum StringAggregateType {
    count = 'count',
    countd = 'countd',
}

export enum BoolAggregateType {
    count = 'count',
    countd = 'countd',
}

export enum DateTimeAggregateType {
    count = 'count',
    countd = 'countd',
    min = 'min',
    max = 'max'
}

export interface QueryBlock {
    id: string
    logicalOp: PositiveLogicalOp
    filters: QueryFilter[]
    blocks: QueryBlock[]
}

interface AbstractFilter {
    op: BoolQueryOp | UnaryQueryOp | BinaryQueryOp | ListQueryOp
    value?: any
    extra?: {
        period?: TemporalPeriod
        unit?: TemporalUnit
        value?: number
        isManual?: boolean
        isManualLeft?: boolean
        isManualRight?: boolean
        left?: any
        right?: any
    }
}

export interface QueryFilter extends AbstractFilter {
    id: string
    columnName: string
    show?: boolean
}

export interface SelectorFilter extends AbstractFilter {
    field: string
    type: ColumnType
}

export type BoolQueryOp = QueryOp.$null | QueryOp.$notNull

export type UnaryQueryOp =
    QueryOp.$eq | QueryOp.$ne |
    QueryOp.$gt | QueryOp.$gte | QueryOp.$lt | QueryOp.$lte |
    QueryOp.$startsWith | QueryOp.$endsWith |
    QueryOp.$contains | QueryOp.$containsi |
    QueryOp.$notContains | QueryOp.$notContainsi

export type BinaryQueryOp = QueryOp.$between

export type ListQueryOp = QueryOp.$in | QueryOp.$notIn

export type PositiveLogicalOp = LogicalOp.$and | LogicalOp.$or

export enum QueryOp {
    $eq = '$eq',
    $ne = '$ne',
    $gt = '$gt',
    $gte = '$gte',
    $lt = '$lt',
    $lte = '$lte',
    $between = '$between',
    $startsWith = '$startsWith',
    $endsWith = '$endsWith',
    $contains = '$contains',
    $containsi = '$containsi',
    $notContains = '$notContains',
    $notContainsi = '$notContainsi',
    $in = '$in',
    $notIn = '$notIn',
    $null = '$null',
    $notNull = '$notNull'
}

export enum LogicalOp {
    $and = '$and',
    $or = '$or',
    $not = '$not'
}

export type TemporalType = FieldType.date | FieldType.time | FieldType.datetime | FieldType.timestamp

export enum TemporalPeriod {
    ARBITRARY = 'ARBITRARY',
    LAST = 'LAST',
    NEXT = 'NEXT'
}

export enum TemporalUnit {
    SECOND = 'SECOND',
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

export enum JoinType {
    inner = 'inner',
    left = 'left',
    right = 'right',
    full = 'full',
}

export type DatasetFiltersInput<T> = {
    $and?: DatasetFiltersInput<T>[]
    $or?: DatasetFiltersInput<T>[]
    $not?: DatasetFiltersInput<T>
} & {[name: string]: PrimitiveFilterInput<string | number | boolean>}