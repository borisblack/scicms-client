import _ from 'lodash'
import {v4 as uuidv4} from 'uuid'
import dayjs, {Dayjs} from 'dayjs'
import {DateTime} from 'luxon'
import {notification, Space} from 'antd'

import {evaluate, getInfo} from 'src/extensions/functions'
import {FieldType, PrimitiveFilterInput} from 'src/types'
import {
  AggregateType,
  BoolAggregateType,
  Column,
  ColumnType,
  Dataset,
  DatasetFiltersInput,
  DateTimeAggregateType,
  IDash,
  LogicalOp,
  PositiveLogicalOp,
  QueryBlock,
  QueryFilter,
  QueryOp,
  SelectorFilter,
  StringAggregateType,
  TemporalPeriod,
  TemporalType,
  TemporalUnit
} from 'src/types/bi'
import i18n from 'src/i18n'
import {extractSessionData} from 'src/util'
import FieldTypeIcon from 'src/components/FieldTypeIcon/FieldTypeIcon'

interface FormatParams {
  dateFormatString: string
  timeFormatString: string
  dateTimeFormatString: string
}

interface FormatTemporalDisplayParams extends FormatParams {
  temporal: string | null
  temporalType: TemporalType
}

interface FormatValueParams extends FormatParams {
  value: any
  type: FieldType
  fractionDigits: number
}

interface PrintQueryFilterParams extends FormatParams {
  dataset: Dataset
  filter: QueryFilter
  timezone: string
}

interface PrintSingleQueryFilterParams extends FormatParams {
  queryFilter: QueryFilter
  fractionDigits: number
}

interface PrintQueryBlockParams extends FormatParams {
  dataset: Dataset
  queryBlock: QueryBlock
  timezone: string
}

interface FormatTemporalIsoParams {
  temporal: Dayjs | null
  temporalType: TemporalType
  timezone: string
}

interface ProcessDatasetQueryFiltersParams {
  dataset: Dataset
  queryFilters: QueryFilter[]
  toForm: boolean
  timezone: string
}

interface ProcessQueryFilterParams {
  type: ColumnType
  filter: QueryFilter
  toForm: boolean
  timezone: string
}

interface ParseFilterValueParams {
  type: FieldType
  filter: QueryFilter | SelectorFilter
  timezone: string
}

const dateTimeRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.000)?(Z|([-+]00:00))?$/
const dateRegExp = /^\d{4}-\d{2}-\d{2}$/
const timeRegExp = /^\d{2}:\d{2}:\d{2}(\.000)?(Z|([-+]00:00))?$/
export const stringTypes = [
  FieldType.string,
  FieldType.text,
  FieldType.uuid,
  FieldType.sequence,
  FieldType.email,
  FieldType.password,
  FieldType.array,
  FieldType.json,
  FieldType.media,
  FieldType.relation
]
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

export const boolQueryOps = [QueryOp.$eq, QueryOp.$ne, QueryOp.$null, QueryOp.$notNull]

export const datasetFieldTypes = [
  FieldType.bool,
  FieldType.string,
  FieldType.text,
  FieldType.int,
  FieldType.long,
  FieldType.float,
  FieldType.double,
  FieldType.decimal,
  FieldType.date,
  FieldType.time,
  FieldType.datetime,
  FieldType.timestamp
]

export const datasetFieldTypeOptions = datasetFieldTypes.map(dft => ({
  label: (
    <Space>
      <FieldTypeIcon fieldType={dft} />
      {dft}
    </Space>
  ),
  value: dft
}))

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
  [LogicalOp.$not]: i18n.t('not')
}

export const temporalPeriodTitles: {[key: string]: string} = {
  [TemporalPeriod.ARBITRARY]: i18n.t('arbitrary'),
  [TemporalPeriod.LAST]: i18n.t('last'),
  [TemporalPeriod.NEXT]: i18n.t('next')
}

export const temporalUnitTitles: {[key: string]: string} = {
  [TemporalUnit.SECOND]: i18n.t('seconds'),
  [TemporalUnit.MINUTE]: i18n.t('minutes'),
  [TemporalUnit.HOUR]: i18n.t('hours'),
  [TemporalUnit.DAY]: i18n.t('days'),
  [TemporalUnit.WEEK]: i18n.t('weeks'),
  [TemporalUnit.MONTH]: i18n.t('months'),
  [TemporalUnit.YEAR]: i18n.t('years')
}

export const isString = (fieldType: FieldType) => stringTypeSet.has(fieldType)

export const isNumeric = (fieldType: FieldType) => numericTypeSet.has(fieldType)

export const isTemporal = (fieldType: FieldType) => temporalTypeSet.has(fieldType)

export const isBool = (fieldType: FieldType) => fieldType === FieldType.bool

export function queryOpList(fieldType: FieldType): QueryOp[] {
  if (isString(fieldType)) return [...stringQueryOps]

  if (isNumeric(fieldType)) return [...numericQueryOps]

  if (isTemporal(fieldType)) return [...temporalQueryOps]

  if (isBool(fieldType)) return [...boolQueryOps]

  throw new Error(`Illegal field type: ${fieldType}`)
}

export const generateQueryBlock = (): QueryBlock => ({
  id: uuidv4(),
  logicalOp: LogicalOp.$and,
  filters: [],
  blocks: []
})

export function intervalFromPeriod(period: TemporalPeriod, unit: TemporalUnit, value: number): Dayjs[] {
  const now = dayjs()
  if (period === TemporalPeriod.LAST) {
    switch (unit) {
      case TemporalUnit.SECOND:
        return [dayjs().subtract(value, 'second'), now]
      case TemporalUnit.MINUTE:
        return [dayjs().subtract(value, 'minute'), now]
      case TemporalUnit.HOUR:
        return [dayjs().subtract(value, 'hour'), now]
      case TemporalUnit.DAY:
        return [dayjs().subtract(value, 'day'), now]
      case TemporalUnit.WEEK:
        return [dayjs().subtract(value, 'week'), now]
      case TemporalUnit.MONTH:
        return [dayjs().subtract(value, 'month'), now]
      case TemporalUnit.YEAR:
        return [dayjs().subtract(value, 'year'), now]
      default:
        break
    }
  }

  if (period === TemporalPeriod.NEXT) {
    switch (unit) {
      case TemporalUnit.SECOND:
        return [now, dayjs().add(value, 'second')]
      case TemporalUnit.MINUTE:
        return [now, dayjs().add(value, 'minute')]
      case TemporalUnit.HOUR:
        return [now, dayjs().add(value, 'hour')]
      case TemporalUnit.DAY:
        return [now, dayjs().add(value, 'day')]
      case TemporalUnit.WEEK:
        return [now, dayjs().add(value, 'week')]
      case TemporalUnit.MONTH:
        return [now, dayjs().add(value, 'month')]
      case TemporalUnit.YEAR:
        return [now, dayjs().add(value, 'year')]
      default:
        break
    }
  }

  throw new Error('Illegal argument')
}

export const formatTemporalIso = ({temporal, temporalType, timezone}: FormatTemporalIsoParams): string | null => {
  if (!temporal) return null

  const dt = DateTime.fromISO(temporal.toISOString())
  if (temporalType === FieldType.date) return dt.toISODate()

  if (temporalType === FieldType.time) return dt.toISOTime()

  return dt.setZone(timezone, {keepLocalTime: true}).toISO()
}

const formatTemporalDisplay = ({
  temporal,
  temporalType,
  dateFormatString,
  timeFormatString,
  dateTimeFormatString
}: FormatTemporalDisplayParams): string => {
  if (temporal == null) return ''

  const dt = dayjs(temporal)
  if (temporalType === FieldType.date) return dt.format(dateFormatString)
  else if (temporalType === FieldType.time) return dt.format(timeFormatString)
  else return dt.format(dt.hour() === 0 && dt.minute() === 0 ? dateFormatString : dateTimeFormatString)
}

export const columnType = (column: Column): FieldType =>
  column.type === FieldType.datetime || column.type === FieldType.timestamp
    ? column.format ?? FieldType.datetime
    : column.type

export const formatValue = ({
  value,
  type,
  dateFormatString,
  timeFormatString,
  dateTimeFormatString,
  fractionDigits
}: FormatValueParams) => {
  if (!value) return value

  switch (type) {
    case FieldType.date:
      return dayjs(value).format(dateFormatString)
    case FieldType.time:
      return dayjs(value).format(timeFormatString)
    case FieldType.datetime:
    case FieldType.timestamp:
      const dt = dayjs(value)
      return dt.format(dt.hour() === 0 && dt.minute() === 0 ? dateFormatString : dateTimeFormatString)
    case FieldType.int:
    case FieldType.long:
    case FieldType.sequence:
      return separateDigitGroups(parseInt(value))
    case FieldType.float:
    case FieldType.double:
    case FieldType.decimal:
      return separateDigitGroups(_.isInteger(value) ? value : parseFloat(value).toFixed(fractionDigits))
    default:
      return value
  }
}

const separateDigitGroups = (value: number | string) =>
  `${value}`.replace(/\d{1,3}(?=(\d{3})+(?:\.\d+)?$)/g, s => `${s} `)

export function toPercent(value: number, percentFractionDigits: number): string {
  const percent = value * 100
  return _.isInteger(percent) ? percent.toString() : percent.toFixed(percentFractionDigits)
}

export function defaultDashColor(colors10: string[], colors20: string[]): string | undefined {
  const colors = defaultDashColors(0, colors10, colors20)
  return colors == null || colors.length === 0 ? undefined : colors[0]
}

export function defaultDashColors(cnt: number, colors10: string[], colors20: string[]): string[] | undefined {
  const colors = cnt <= 10 ? colors10 ?? colors20 : colors20 ?? colors10
  if (colors == null) return undefined

  return colors.length === 0 ? undefined : colors
}

export function toFormQueryBlock(dataset: Dataset, timezone: string, queryBlock?: QueryBlock): QueryBlock {
  if (queryBlock == null) return generateQueryBlock()

  const formQueryBlock = _.cloneDeep(queryBlock)
  processDatasetQueryFilters({dataset, queryFilters: formQueryBlock.filters, toForm: true, timezone})

  for (let i = 0; i < formQueryBlock.blocks.length; i++) {
    formQueryBlock.blocks[i] = toFormQueryBlock(dataset, timezone, formQueryBlock.blocks[i])
  }

  return formQueryBlock
}

export function fromFormQueryBlock(dataset: Dataset, timezone: string, formQueryBlock?: QueryBlock): QueryBlock {
  if (formQueryBlock == null) return generateQueryBlock()

  const queryBlock = _.cloneDeep(formQueryBlock)
  processDatasetQueryFilters({dataset, queryFilters: queryBlock.filters, toForm: false, timezone})

  for (let i = 0; i < queryBlock.blocks.length; i++) {
    queryBlock.blocks[i] = fromFormQueryBlock(dataset, timezone, queryBlock.blocks[i])
  }

  return queryBlock
}

function processDatasetQueryFilters({dataset, queryFilters, toForm, timezone}: ProcessDatasetQueryFiltersParams) {
  const columns = dataset.spec?.columns ?? {}
  for (const filter of queryFilters) {
    const {columnName, op} = filter
    const column = columns[columnName]
    if (column == null) throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

    if (op === QueryOp.$null || op === QueryOp.$notNull) {
      filter.value = null
      continue
    }

    const {type} = column
    processQueryFilter({type, filter, toForm, timezone})
  }
}

function processQueryFilter({type, filter, toForm, timezone}: ProcessQueryFilterParams) {
  const {op} = filter
  if (op === QueryOp.$null || op === QueryOp.$notNull) {
    filter.value = null
    return
  }

  if (type == null || !isTemporal(type)) return

  const temporalType = type as TemporalType
  const extra = filter.extra ?? {}
  if (
    op === QueryOp.$eq ||
    op === QueryOp.$ne ||
    op === QueryOp.$gt ||
    op === QueryOp.$gte ||
    op === QueryOp.$lt ||
    op === QueryOp.$lte
  ) {
    if (filter.value != null && !extra.isManual)
      filter.value = toForm
        ? dayjs(filter.value)
        : formatTemporalIso({temporal: filter.value as Dayjs, temporalType, timezone})

    return
  }

  if (op === QueryOp.$between) {
    if (extra.left != null && !extra.isManualLeft)
      extra.left = toForm
        ? dayjs(extra.left)
        : formatTemporalIso({temporal: extra.left as Dayjs, temporalType, timezone})

    if (extra.right != null && !extra.isManualRight)
      extra.right = toForm
        ? dayjs(extra.right)
        : formatTemporalIso({temporal: extra.right as Dayjs, temporalType, timezone})
  }
}

export function toFormSelectorFilter(selectorFilter: SelectorFilter, timezone: string): SelectorFilter {
  const formSelectorFilter = _.cloneDeep(selectorFilter)
  processSelectorFilter(formSelectorFilter, true, timezone)

  return formSelectorFilter
}

export function fromFormSelectorFilter(formSelectorFilter: SelectorFilter, timezone: string): SelectorFilter {
  const selectorFilter = _.cloneDeep(formSelectorFilter)
  processSelectorFilter(selectorFilter, false, timezone)

  return selectorFilter
}

function processSelectorFilter(filter: SelectorFilter, toForm: boolean, timezone: string) {
  const {type, op} = filter
  if (op === QueryOp.$null || op === QueryOp.$notNull) {
    filter.value = null
    return
  }

  if (!isTemporal(type)) return

  const temporalType = type as TemporalType
  const extra = filter.extra ?? {}
  if (
    op === QueryOp.$eq ||
    op === QueryOp.$ne ||
    op === QueryOp.$gt ||
    op === QueryOp.$gte ||
    op === QueryOp.$lt ||
    op === QueryOp.$lte
  ) {
    if (filter.value != null && !extra.isManual)
      filter.value = toForm
        ? dayjs(filter.value)
        : formatTemporalIso({temporal: filter.value as Dayjs, temporalType, timezone})

    return
  }

  if (op === QueryOp.$between) {
    if (extra.left != null && !extra.isManualLeft)
      extra.left = toForm
        ? dayjs(extra.left)
        : formatTemporalIso({temporal: extra.left as Dayjs, temporalType, timezone})

    if (extra.right != null && !extra.isManualRight)
      extra.right = toForm
        ? dayjs(extra.right)
        : formatTemporalIso({temporal: extra.right as Dayjs, temporalType, timezone})
  }
}

export function toDatasetFiltersInput(
  dataset: Dataset,
  queryBlock: QueryBlock,
  timezone: string
): DatasetFiltersInput<any> {
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
        datasetFiltersInput.$and.push({[col]: {[op]: toDatasetFilterInputValue(dataset, filter, timezone)}})
      }
      const filterInput = (datasetFiltersInput[col] ?? {}) as {[op: string]: any}
      filterInput[op] = toDatasetFilterInputValue(dataset, opFiltersList[0], timezone)
      datasetFiltersInput[col] = filterInput as PrimitiveFilterInput<any>
    }
  }

  for (const nestedBlock of queryBlock.blocks) {
    if (nestedBlock.logicalOp === LogicalOp.$or) {
      const orFiltersInput: DatasetFiltersInput<any> = {}
      orFiltersInput.$or = [toDatasetFiltersInput(dataset, nestedBlock, timezone)]
      datasetFiltersInput.$and.push(orFiltersInput)
    } else {
      datasetFiltersInput.$and.push(toDatasetFiltersInput(dataset, nestedBlock, timezone))
    }
  }

  return datasetFiltersInput
}

export const toSingleDatasetFiltersInput = (
  dataset: Dataset,
  queryFilter: QueryFilter,
  timezone: string
): DatasetFiltersInput<any> => ({
  [queryFilter.columnName]: {
    [queryFilter.op]: toDatasetFilterInputValue(dataset, queryFilter, timezone)
  }
})

export const toSingleSelectorFiltersInput = (
  selectorFilter: SelectorFilter,
  timezone: string
): DatasetFiltersInput<any> => ({
  [selectorFilter.field]: {
    [selectorFilter.op]: toSelectorFilterInputValue(selectorFilter, timezone)
  }
})

function toDatasetFilterInputValue(dataset: Dataset, filter: QueryFilter, timezone: string): any {
  const {columnName} = filter
  const columns = dataset.spec?.columns ?? {}
  const column = columns[columnName]
  if (column == null) throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

  return parseFilterValue({type: column.type, filter, timezone})
}

function toSelectorFilterInputValue(filter: SelectorFilter, timezone: string): any {
  return parseFilterValue({type: filter.type, filter, timezone})
}

function parseFilterValue({type, filter, timezone}: ParseFilterValueParams): any {
  const {op, value} = filter
  if (op === QueryOp.$null || op === QueryOp.$notNull) return true

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
        const temporalUnit = extra.unit as TemporalUnit
        const temporalValue = extra.value as number
        return intervalFromPeriod(period, temporalUnit, temporalValue).map(t =>
          formatTemporalIso({temporal: t, temporalType, timezone})
        )
      }
    } else {
      return [left, right]
    }
  }

  if (op === QueryOp.$in || op === QueryOp.$notIn) {
    const arr = value == null ? [] : (value as string).split(/\s*,\s*/)
    if (isNumeric(type)) return arr.map(a => Number(a))

    return arr
  }

  return extra.isManual ? parseManualFilterValue(value) : value
}

function parseManualFilterValue(value?: string): any {
  if (value == null) return null

  try {
    return evaluate({expression: value})
  } catch (e: any) {
    // notifyErrorThrottled(i18n.t('Expression evaluation error'), e.message)
    notification.error({
      message: i18n.t('Expression evaluation error') as string,
      description: e.message
    })
    return undefined
  }
}

export function printQueryBlock({
  dataset,
  queryBlock,
  dateFormatString,
  timeFormatString,
  dateTimeFormatString,
  timezone
}: PrintQueryBlockParams): string | undefined {
  let buf: string[] = []
  const logicalOpTitle = logicalOpTitles[queryBlock.logicalOp ?? LogicalOp.$and]
  for (const queryFilter of queryBlock.filters) {
    if (!queryFilter.show) continue

    if (buf.length > 0) buf.push(logicalOpTitle)

    buf.push(
      printQueryFilter({
        dataset,
        filter: queryFilter,
        dateFormatString,
        timeFormatString,
        dateTimeFormatString,
        timezone
      })
    )
  }

  for (const nestedQueryBlock of queryBlock.blocks) {
    const nestedQueryBlockContent = printQueryBlock({
      dataset,
      queryBlock: nestedQueryBlock,
      dateFormatString,
      timeFormatString,
      dateTimeFormatString,
      timezone
    })
    if (nestedQueryBlockContent == null) continue

    if (buf.length > 0) buf.push(logicalOpTitle)

    buf.push(`(${nestedQueryBlockContent})`)
  }

  return buf.length === 0 ? undefined : buf.join(' ')
}

function printQueryFilter({
  dataset,
  filter,
  dateFormatString,
  timeFormatString,
  dateTimeFormatString,
  timezone
}: PrintQueryFilterParams): string {
  const {columnName, op} = filter
  const columns = dataset.spec?.columns ?? {}
  const column = columns[columnName]
  if (column == null) throw new Error(`Column '${columnName}' not found in dataset '${dataset.name}'`)

  const opTitle = queryOpTitles[op]
  const columnAlias = column.alias ?? columnName
  if (op === QueryOp.$null || op === QueryOp.$notNull) return `${columnAlias} ${opTitle}`

  const filterValue = parseFilterValue({type: column.type, filter, timezone})
  if (op === QueryOp.$between) {
    if (!isTemporal(column.type))
      return `${columnAlias} ${opTitle} (${filterValue[0]} ${i18n.t('and')} ${filterValue[1]})`

    const temporalType = columnType(column) as TemporalType
    const period = filter.extra?.period ?? TemporalPeriod.ARBITRARY
    if (period === TemporalPeriod.ARBITRARY) {
      const left = formatTemporalDisplay({
        temporal: filterValue[0],
        temporalType,
        dateFormatString,
        timeFormatString,
        dateTimeFormatString
      })
      const right = formatTemporalDisplay({
        temporal: filterValue[1],
        temporalType,
        dateFormatString,
        timeFormatString,
        dateTimeFormatString
      })
      return `${columnAlias} ${opTitle} (${left} ${i18n.t('and')} ${right})`
    } else {
      return `${columnAlias} ${i18n.t('for')} ${temporalPeriodTitles[period]}`
    }
  }

  if (op === QueryOp.$in || op === QueryOp.$notIn)
    return `${columnAlias} ${opTitle} (${(filterValue as any[]).join(', ')})`

  return `${columnAlias} ${opTitle} ${isTemporal(column.type) ? formatTemporalDisplay({temporal: filterValue, temporalType: columnType(column) as TemporalType, dateFormatString, timeFormatString, dateTimeFormatString}) : filterValue}`
}

export const printSingleQueryFilter = ({
  queryFilter,
  dateFormatString,
  timeFormatString,
  dateTimeFormatString,
  fractionDigits
}: PrintSingleQueryFilterParams): string =>
  `${queryFilter.columnName} ${queryOpTitles[queryFilter.op]} ${formatValue({value: queryFilter.value, type: guessType(queryFilter.value), dateFormatString, timeFormatString, dateTimeFormatString, fractionDigits})}`

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

function guessType(value: string | number | boolean): FieldType {
  const valueType = typeof value
  if (valueType === 'boolean') return FieldType.bool

  if (valueType === 'number') return FieldType.decimal

  if (valueType === 'string') {
    const strValue = value as string
    if (strValue.match(dateRegExp)) return FieldType.date

    if (strValue.match(timeRegExp)) return FieldType.time

    if (strValue.match(dateTimeRegExp)) return FieldType.datetime
  }

  return FieldType.string
}

export function extractSessionFilters(dashboardId: string, dashId: string) {
  const sessionData = extractSessionData()
  return _.get(sessionData, ['dashboards', dashboardId, 'dashes', dashId, 'filters'])
}

export function saveSessionFilters(dashboardId: string, dashId: string, filters: QueryBlock) {
  const newSessionData = extractSessionData()
  _.set(newSessionData, ['dashboards', dashboardId, 'dashes', dashId, 'filters'], filters)
  localStorage.setItem('sessionData', JSON.stringify(newSessionData))
}

export function getActualFilters(dashboardId: string, dash: IDash) {
  const sessionFilters = extractSessionFilters(dashboardId, dash.id)
  return sessionFilters ?? dash.defaultFilters ?? generateQueryBlock()
}

export function getAggregateTypes(type: FieldType): AggregateType[] {
  switch (type) {
    case FieldType.string:
    case FieldType.text:
      return Object.keys(StringAggregateType) as AggregateType[]
    case FieldType.int:
    case FieldType.long:
    case FieldType.float:
    case FieldType.double:
    case FieldType.decimal:
      return Object.keys(AggregateType) as AggregateType[]
    case FieldType.bool:
      return Object.keys(BoolAggregateType) as AggregateType[]
    case FieldType.date:
    case FieldType.time:
    case FieldType.datetime:
    case FieldType.timestamp:
      return Object.keys(DateTimeAggregateType) as AggregateType[]
    default:
      throw new Error('Illegal argument')
  }
}

export const getAggregateOptions = (type?: FieldType) =>
  type ? getAggregateTypes(type).map(aggregateType => ({label: aggregateType, value: aggregateType})) : []

export function getFormats(type: FieldType): FieldType[] {
  switch (type) {
    case FieldType.float:
    case FieldType.double:
    case FieldType.decimal:
      return [FieldType.int, FieldType.float] as FieldType[]
    case FieldType.datetime:
    case FieldType.timestamp:
      return [FieldType.date, FieldType.time, FieldType.datetime] as FieldType[]
    default:
      return []
  }
}

export const getFormatOptions = (type: FieldType) => getFormats(type).map(f => ({label: f, value: f}))

export function calculateAggregationResultType(type: FieldType, aggregation: AggregateType): FieldType {
  switch (aggregation) {
    case AggregateType.count:
    case AggregateType.countd:
      return FieldType.int
    case AggregateType.sum:
    case AggregateType.avg:
    case AggregateType.min:
    case AggregateType.max:
      return type
    default:
      throw new Error('Illegal argument')
  }
}
