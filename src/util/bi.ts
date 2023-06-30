import {
    Column,
    Dataset,
    DatasetFiltersInput,
    FieldType,
    LogicalOp,
    PositiveLogicalOp,
    PrimitiveFilterInput,
    QueryBlock,
    QueryFilter,
    QueryOp,
    TemporalPeriod,
    TemporalType,
    TemporalUnit
} from '../types'
import i18n from '../i18n'
import appConfig from '../config'
import biConfig from '../config/bi'
import {v4 as uuidv4} from 'uuid'
import dayjs, {Dayjs} from 'dayjs'
import {DateTime} from 'luxon'
import _ from 'lodash'
import {evaluate, getInfo} from '../extensions/functions'
import {notification} from 'antd'
import {PlotEvent} from '@ant-design/plots'
import {Plot} from '@antv/g2plot'

const {dash: dashConfig, dateTime: dateTimeConfig} = biConfig
const dateTimeRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.000)?(Z|([-+]00:00))?$/
const dateRegExp = /^\d{4}-\d{2}-\d{2}$/
const timeRegExp = /^\d{2}:\d{2}:\d{2}(\.000)?(Z|([-+]00:00))?$/
export const stringTypes = [FieldType.string, FieldType.text, FieldType.uuid, FieldType.sequence, FieldType.email, FieldType.password, FieldType.array, FieldType.json, FieldType.media, FieldType.relation]
export const numericTypes = [FieldType.int, FieldType.long, FieldType.float, FieldType.double, FieldType.decimal]
export const temporalTypes = [FieldType.date, FieldType.time, FieldType.datetime, FieldType.timestamp]
export const stringTypeSet = new Set(stringTypes)
export const numericTypeSet = new Set(numericTypes)
export const temporalTypeSet = new Set(temporalTypes)
export const temporalPeriods: string[] = Object.keys(TemporalPeriod)
export const allTemporalUnits: string[] = Object.keys(TemporalUnit)
export const timeTemporalUnits: TemporalUnit[] = [TemporalUnit.SECOND, TemporalUnit.MINUTE, TemporalUnit.HOUR]

export const stringQueryOps = [
    QueryOp.$eq,
    QueryOp.$ne,
    QueryOp.$startsWith,
    QueryOp.$endsWith,
    QueryOp.$contains,
    QueryOp.$containsi,
    QueryOp.$notContains,
    QueryOp.$notContainsi,
    QueryOp.$in,
    QueryOp.$notIn,
    QueryOp.$null,
    QueryOp.$notNull
]

export const numericQueryOps = [
    QueryOp.$eq,
    QueryOp.$ne,
    QueryOp.$gt,
    QueryOp.$gte,
    QueryOp.$lt,
    QueryOp.$lte,
    QueryOp.$between,
    QueryOp.$in,
    QueryOp.$notIn,
    QueryOp.$null,
    QueryOp.$notNull
]

export const temporalQueryOps = [
    QueryOp.$eq,
    QueryOp.$ne,
    QueryOp.$gt,
    QueryOp.$gte,
    QueryOp.$lt,
    QueryOp.$lte,
    QueryOp.$between,
    QueryOp.$null,
    QueryOp.$notNull
]

export const boolQueryOps = [
    QueryOp.$eq,
    QueryOp.$ne,
    QueryOp.$null,
    QueryOp.$notNull
]

export const queryOpTitles: {[key: string]: string} = {
    [QueryOp.$eq]: i18n.t('equals'),
    [QueryOp.$ne]: i18n.t('not equals'),
    [QueryOp.$gt]: i18n.t('greater than'),
    [QueryOp.$gte]: i18n.t('greater than or equals'),
    [QueryOp.$lt]: i18n.t('less than'),
    [QueryOp.$lte]: i18n.t('less than or equals'),
    [QueryOp.$between]: i18n.t('between'),
    [QueryOp.$startsWith]: i18n.t('starts with'),
    [QueryOp.$endsWith]: i18n.t('ends with'),
    [QueryOp.$contains]: i18n.t('contains'),
    [QueryOp.$containsi]: i18n.t('contains ignore case'),
    [QueryOp.$notContains]: i18n.t('not contains'),
    [QueryOp.$notContainsi]: i18n.t('not contains ignore case'),
    [QueryOp.$in]: i18n.t('in'),
    [QueryOp.$notIn]: i18n.t('not in'),
    [QueryOp.$null]: i18n.t('null'),
    [QueryOp.$notNull]: i18n.t('not null')
}

export const positiveLogicalOps: PositiveLogicalOp[] = [LogicalOp.$and, LogicalOp.$or]

export const logicalOpTitles: {[key: string]: string} = {
    [LogicalOp.$and]: i18n.t('and'),
    [LogicalOp.$or]: i18n.t('or'),
    [LogicalOp.$not]: i18n.t('not'),
}

export const temporalPeriodTitles: {[key: string]: string} = {
    [TemporalPeriod.ARBITRARY]: i18n.t('arbitrary'),
    [TemporalPeriod.LAST]: i18n.t('last'),
    [TemporalPeriod.NEXT]: i18n.t('next')
}

export const isString = (fieldType: FieldType) => stringTypeSet.has(fieldType)

export const isNumeric = (fieldType: FieldType) => numericTypeSet.has(fieldType)

export const isTemporal = (fieldType: FieldType) => temporalTypeSet.has(fieldType)

export const isBool = (fieldType: FieldType) => fieldType === FieldType.bool

export function queryOpList(fieldType: FieldType): QueryOp[] {
    if (isString(fieldType))
        return [...stringQueryOps]

    if (isNumeric(fieldType))
        return [...numericQueryOps]

    if (isTemporal(fieldType))
        return [...temporalQueryOps]

    if (isBool(fieldType))
        return [...boolQueryOps]

    throw new Error(`Illegal field type: ${fieldType}`)
}

export const generateQueryBlock = (): QueryBlock => ({
    id: uuidv4(),
    logicalOp: LogicalOp.$and,
    filters: [],
    blocks: []
})

export function startTemporalFromPeriod(period: TemporalPeriod, temporalType: TemporalType): Dayjs {
    switch (period) {
        case TemporalPeriod.LAST_5_MINUTES:
            return dayjs().subtract(5, 'minute')
        case TemporalPeriod.LAST_15_MINUTES:
            return dayjs().subtract(15, 'minute')
        case TemporalPeriod.LAST_30_MINUTES:
            return dayjs().subtract(30, 'minute')
        case TemporalPeriod.LAST_HOUR:
            return dayjs().subtract(1, 'hour')
        case TemporalPeriod.LAST_3_HOURS:
            return dayjs().subtract(3, 'hour')
        case TemporalPeriod.LAST_6_HOURS:
            return dayjs().subtract(6, 'hour')
        case TemporalPeriod.LAST_12_HOURS:
            return dayjs().subtract(12, 'hour')
        default:
            break
    }

    if (temporalType !== FieldType.time) {
        switch (period) {
            case TemporalPeriod.LAST_DAY:
                return dayjs().subtract(1, 'day')
            case TemporalPeriod.LAST_3_DAYS:
                return dayjs().subtract(3, 'day')
            case TemporalPeriod.LAST_WEEK:
                return dayjs().subtract(1, 'week')
            case TemporalPeriod.LAST_2_WEEKS:
                return dayjs().subtract(2, 'week')
            case TemporalPeriod.LAST_MONTH:
                return dayjs().subtract(1, 'month')
            case TemporalPeriod.LAST_3_MONTHS:
                return dayjs().subtract(3, 'month')
            case TemporalPeriod.LAST_6_MONTHS:
                return dayjs().subtract(6, 'month')
            case TemporalPeriod.LAST_YEAR:
                return dayjs().subtract(1, 'year')
            case TemporalPeriod.LAST_3_YEARS:
                return dayjs().subtract(3, 'year')
            case TemporalPeriod.LAST_5_YEARS:
                return dayjs().subtract(5, 'year')
            case TemporalPeriod.LAST_10_YEARS:
                return dayjs().subtract(10, 'year')
            case TemporalPeriod.LAST_20_YEARS:
                return dayjs().subtract(20, 'year')
            case TemporalPeriod.LAST_30_YEARS:
                return dayjs().subtract(30, 'year')
            default:
                break
        }
    }

    throw new Error('Illegal argument')
}

export const formatTemporalIso = (temporal: Dayjs | null, temporalType: TemporalType): string | null => {
    if (!temporal)
        return null

    const dt = DateTime.fromISO(temporal.toISOString())
    if (temporalType === FieldType.date)
        return dt.toISODate()

    if (temporalType === FieldType.time)
        return dt.toISOTime()

    return dt.setZone(appConfig.dateTime.timeZone, {keepLocalTime: true}).toISO()
}

export const formatTemporalDisplay = (temporal: string | null, temporalType: TemporalType): string => {
    if (temporal == null)
        return ''

    const dt = dayjs(temporal)
    if (temporalType === FieldType.date)
        return dt.format(dateTimeConfig.dateFormatString)
    else if (temporalType === FieldType.time)
        return dt.format(dateTimeConfig.timeFormatString)
    else
        return dt.format((dt.hour() === 0 && dt.minute() === 0) ? dateTimeConfig.dateFormatString : dateTimeConfig.dateTimeFormatString)
}

export const columnType = (column: Column): FieldType =>
    (column.type === FieldType.datetime || column.type === FieldType.timestamp) ? (column.format ?? FieldType.datetime) : column.type

export const formatValue = (value: any, type: FieldType) => {
    if (!value)
        return value

    switch (type) {
        case FieldType.date:
            return dayjs(value).format(dateTimeConfig.dateFormatString)
        case FieldType.time:
            return dayjs(value).format(dateTimeConfig.timeFormatString)
        case FieldType.datetime:
        case FieldType.timestamp:
            const dt = dayjs(value)
            return dt.format((dt.hour() === 0 && dt.minute() === 0) ? dateTimeConfig.dateFormatString : dateTimeConfig.dateTimeFormatString)
        case FieldType.int:
        case FieldType.long:
        case FieldType.float:
        case FieldType.double:
        case FieldType.decimal:
        case FieldType.sequence:
            return `${value}`.replace(/\d{1,3}(?=(\d{3})+(?:\.\d+)?$)/g, s => `${s} `)
        default:
            return value
    }
}

export function defaultDashColor(): string | undefined {
    const colors = defaultDashColors()
    return (colors == null || colors.length === 0) ? undefined : colors[0]
}

export function defaultDashColors(cnt: number = 0): string[] | undefined {
    const allDashConfig = dashConfig?.all ?? {}
    const colors = (cnt <= 10) ? (allDashConfig.colors10 ?? allDashConfig.colors20) : (allDashConfig.colors20 ?? allDashConfig.colors10)
    if (colors == null)
        return undefined

    return colors.length === 0 ? undefined : colors
}

export function toFormQueryBlock(dataset: Dataset, queryBlock?: QueryBlock): QueryBlock {
    if (queryBlock == null)
        return generateQueryBlock()

    const formQueryBlock = _.cloneDeep(queryBlock)
    processQueryFilters(dataset, formQueryBlock.filters, true)

    for (let i = 0; i < formQueryBlock.blocks.length; i++) {
        formQueryBlock.blocks[i] = toFormQueryBlock(dataset, formQueryBlock.blocks[i])
    }

    return formQueryBlock
}

export function fromFormQueryBlock(dataset: Dataset, formQueryBlock?: QueryBlock): QueryBlock {
    if (formQueryBlock == null)
        return generateQueryBlock()

    const queryBlock = _.cloneDeep(formQueryBlock)
    processQueryFilters(dataset, queryBlock.filters, false)

    for (let i = 0; i < queryBlock.blocks.length; i++) {
        queryBlock.blocks[i] = fromFormQueryBlock(dataset, queryBlock.blocks[i])
    }

    return queryBlock
}

function processQueryFilters(dataset: Dataset, queryFilters: QueryFilter[], toForm: boolean) {
    const columns = dataset.spec?.columns ?? {}
    for (const filter of queryFilters) {
        const {columnName, op} = filter
        const column = columns[columnName]
        if (column == null)
            throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

        if (op === QueryOp.$null || op === QueryOp.$notNull) {
            filter.value = null
            continue
        }

        const {type} = column
        if (type == null || !isTemporal(type))
            continue

        const temporalType = type as TemporalType
        const extra = filter.extra ?? {}
        if (op === QueryOp.$eq || op === QueryOp.$ne || op === QueryOp.$gt || op === QueryOp.$gte || op === QueryOp.$lt || op === QueryOp.$lte) {
            if (filter.value != null && !extra.isManual)
                filter.value = toForm ? dayjs(filter.value) : formatTemporalIso(filter.value as Dayjs, temporalType)

            continue
        }

        if (op === QueryOp.$between) {
            if (extra.left != null && !extra.isManualLeft)
                extra.left = toForm ? dayjs(extra.left) : formatTemporalIso(extra.left as Dayjs, temporalType)

            if (extra.right != null && !extra.isManualRight)
                extra.right = toForm ? dayjs(extra.right) : formatTemporalIso(extra.right as Dayjs, temporalType)
        }
    }
}

export function toDatasetFiltersInput(dataset: Dataset, queryBlock: QueryBlock): DatasetFiltersInput<any> {
    const datasetFiltersInput: DatasetFiltersInput<any> = {}
    datasetFiltersInput.$and = []
    const colFilters = _.groupBy(queryBlock.filters, f => f.columnName)
    for (const col in colFilters) {
        const colFiltersList = colFilters[col]
        const opFilters = _.groupBy(colFiltersList, f => f.op)
        for (const op in opFilters) {
            const opFiltersList = opFilters[op]
            while (opFiltersList.length > 1) {
                const filter = opFiltersList.pop() as QueryFilter
                datasetFiltersInput.$and.push({[col]: {[op]: toDatasetFilterInputValue(dataset, filter)}})
            }
            const filterInput = (datasetFiltersInput[col] ?? {}) as {[op: string]: any}
            filterInput[op] = toDatasetFilterInputValue(dataset, opFiltersList[0])
            datasetFiltersInput[col] = filterInput as PrimitiveFilterInput<any>
        }
    }

    for (const nestedBlock of queryBlock.blocks) {
        if (nestedBlock.logicalOp === LogicalOp.$or) {
            const orFiltersInput: DatasetFiltersInput<any> = {}
            orFiltersInput.$or = [toDatasetFiltersInput(dataset, nestedBlock)]
            datasetFiltersInput.$and.push(orFiltersInput)
        } else {
            datasetFiltersInput.$and.push(toDatasetFiltersInput(dataset, nestedBlock))
        }
    }

    return datasetFiltersInput
}

export const toSingleDatasetFiltersInput = (dataset: Dataset, queryFilter: QueryFilter): DatasetFiltersInput<any> => ({
    [queryFilter.columnName]: {
        [queryFilter.op]: toDatasetFilterInputValue(dataset, queryFilter)
    }
})

function toDatasetFilterInputValue(dataset: Dataset, filter: QueryFilter): any {
    const {columnName} = filter
    const columns = dataset.spec?.columns ?? {}
    const column = columns[columnName]
    if (column == null)
        throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

    return parseFilterValue(column.type, filter)
}

function parseFilterValue(type: FieldType, filter: QueryFilter): any {
    const {op, value} = filter
    if (op === QueryOp.$null || op === QueryOp.$notNull)
        return true

    const extra = filter.extra ?? {}
    if (op === QueryOp.$between) {
        const left = extra.isManualLeft ? parseManualFilterValue(extra.left) : extra.left
        const right = extra.isManualRight ? parseManualFilterValue(extra.right) : extra.right
        if (isTemporal(type)) {
            const period = extra.period ?? TemporalPeriod.ARBITRARY
            if (period === TemporalPeriod.ARBITRARY) {
                return [left, right]
            } else {
                const temporalType = type as TemporalType
                return [
                    formatTemporalIso(startTemporalFromPeriod(period, temporalType), temporalType),
                    formatTemporalIso(dayjs(), temporalType)
                ]
            }
        } else {
            return [left, right]
        }
    }

    if (op === QueryOp.$in || op === QueryOp.$notIn) {
        const arr = value == null ? [] : (value as string).split(/\s*,\s*/)
        if (isNumeric(type))
            return arr.map(a => Number(a))

        return arr
    }

    return extra.isManual ? parseManualFilterValue(value) : value
}

function parseManualFilterValue(value?: string): any {
    if (value == null)
        return null

    try {
        return evaluate({expression: value})
    } catch (e: any) {
        // notifyErrorThrottled(i18n.t('Expression evaluation error'), e.message)
        notification.error({message: i18n.t('Expression evaluation error') as string, description: e.message})
        return undefined
    }
}

export function printQueryBlock(dataset: Dataset, queryBlock: QueryBlock): string | undefined {
    let buf: string[]  = []
    const logicalOpTitle = logicalOpTitles[queryBlock.logicalOp ?? LogicalOp.$and]
    for (const queryFilter of queryBlock.filters) {
        if (!queryFilter.show)
            continue

        if (buf.length > 0)
            buf.push(logicalOpTitle)

        buf.push(printQueryFilter(dataset, queryFilter))
    }

    for (const nestedQueryBlock of queryBlock.blocks) {
        const nestedQueryBlockContent = printQueryBlock(dataset, nestedQueryBlock)
        if (nestedQueryBlockContent == null)
            continue

        if (buf.length > 0)
            buf.push(logicalOpTitle)

        buf.push(`(${nestedQueryBlockContent})`)
    }

    return buf.length === 0 ? undefined : buf.join(' ')
}

function printQueryFilter(dataset: Dataset, filter: QueryFilter): string {
    const {columnName, op} = filter
    const columns = dataset.spec?.columns ?? {}
    const column = columns[columnName]
    if (column == null)
        throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

    const opTitle = queryOpTitles[op]
    const columnAlias = column.alias ?? columnName
    if (op === QueryOp.$null || op === QueryOp.$notNull)
        return `${columnAlias} ${opTitle}`

    const filterValue = parseFilterValue(column.type, filter)
    if (op === QueryOp.$between) {
        if (!isTemporal(column.type))
            return `${columnAlias} ${opTitle} (${filterValue[0]} ${i18n.t('and')} ${filterValue[1]})`

        const temporalType = columnType(column) as TemporalType
        const period = filter.extra?.period ?? TemporalPeriod.ARBITRARY
        if (period === TemporalPeriod.ARBITRARY) {
            const left = formatTemporalDisplay(filterValue[0], temporalType)
            const right = formatTemporalDisplay(filterValue[1], temporalType)
            return `${columnAlias} ${opTitle} (${left} ${i18n.t('and')} ${right})`
        } else {
            return `${columnAlias} ${i18n.t('for')} ${temporalPeriodTitles[period]}`
        }
    }

    if (op === QueryOp.$in || op === QueryOp.$notIn)
        return `${columnAlias} ${opTitle} (${(filterValue as any[]).join(', ')})`

    return `${columnAlias} ${opTitle} ${isTemporal(column.type) ? formatTemporalDisplay(filterValue, columnType(column) as TemporalType) : filterValue}`
}

export const printSingleQueryFilter = (queryFilter: QueryFilter): string =>
    `${queryFilter.columnName} ${queryOpTitles[queryFilter.op]} ${formatValue(queryFilter.value, guessType(queryFilter.value))}`

export function getCustomFunctionsInfo(): string[] {
    const buf: string[] = []
    const categoryFunctionsInfo = _.groupBy(getInfo(), info => info.category)
    for (const category in categoryFunctionsInfo) {
        buf.push(`${i18n.t(category)}:`)
        const functionsInfo = categoryFunctionsInfo[category]
        for (const func of functionsInfo) {
            buf.push(`${func.id}() - ${i18n.t(func.description ?? 'No description')}`)
        }
    }

    return buf
}

export function handleDashClick(chart: Plot<any>, event: PlotEvent, fieldName: string, cb: (queryFilter: QueryFilter) => void) {
    if (event.type !== 'click')
        return

    const v = event.data?.data?.[fieldName]
    if (v == null)
        return

    cb({
        id: uuidv4(),
        columnName: fieldName,
        op: QueryOp.$eq,
        value: v
    })
}

function guessType(value: string | number | boolean): FieldType {
    const valueType = typeof value
    if (valueType === 'boolean')
        return FieldType.bool

    if (valueType === 'number')
        return FieldType.decimal

    if (valueType === 'string') {
        const strValue = value as string
        if (strValue.match(dateRegExp))
            return FieldType.date

        if (strValue.match(timeRegExp))
            return FieldType.time

        if (strValue.match(dateTimeRegExp))
            return FieldType.datetime
    }

    return FieldType.string
}
