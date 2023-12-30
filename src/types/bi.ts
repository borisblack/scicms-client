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
}

export interface Column {
    type: FieldType
    format?: FieldType.int | FieldType.float | FieldType.date | FieldType.time | FieldType.datetime
    alias?: string
    colWidth?: string | number | null
}

export interface Table {
    name: string,
    columns: Record<string, Column>
}

export interface DatasetSources {
    mainTable?: Table
    joinedTables: JoinedTable[]
}

export interface JoinedTable extends Table {
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
    dashes: IDash[]
}

export interface IDash {
    id: string
    name: string
    x: number
    y: number
    w: number
    h: number
    dataset?: string
    type: string
    unit?: string
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

export enum AggregateType {
    count = 'count',
    sum = 'sum',
    avg = 'avg',
    min = 'min',
    max = 'max'
}

export interface QueryBlock {
    id: string
    logicalOp: PositiveLogicalOp
    filters: QueryFilter[]
    blocks: QueryBlock[]
}

export interface QueryFilter {
    id: string
    columnName: string
    op: BoolQueryOp | UnaryQueryOp | BinaryQueryOp | ListQueryOp
    value?: any
    show?: boolean
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