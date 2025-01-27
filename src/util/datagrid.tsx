import _ from 'lodash'
import {ReactElement} from 'react'
import {ColumnDef, ColumnFiltersState, createColumnHelper, SortingState} from '@tanstack/react-table'
import {Checkbox, Tag, Typography} from 'antd'
import {DateTime} from 'luxon'

import {FieldType} from '../types'
import {Attribute, Item, ItemData, Media, RelType} from '../types/schema'
import {DataWithPagination, RequestParams} from '../uiKit/DataGrid'
import QueryManager, {ExtRequestParams, ItemFiltersInput} from '../services/query'
import {ACCESS_ITEM_NAME, FILENAME_ATTR_NAME, MASK_ATTR_NAME, MEDIA_ITEM_NAME, UTC} from '../config/constants'
import i18n from '../i18n'
import {getBit} from './index'
import {download} from '../services/media'
import {ItemMap} from '../services/item'
import {sortAttributes} from './schema'

interface GetColumnsParams {
  items: ItemMap
  item: Item
  defaultColWidth: number
  maxTextLength: number
  luxonDisplayDateFormatString: string
  luxonDisplayTimeFormatString: string
  luxonDisplayDateTimeFormatString: string
  onOpenItem: (item: Item, id: string) => void
}

interface RenderCellParams {
  items: ItemMap
  item: Item
  data: ItemData
  attrName: string
  attribute: Attribute
  value: any
  maxTextLength: number
  luxonDisplayDateFormatString: string
  luxonDisplayTimeFormatString: string
  luxonDisplayDateTimeFormatString: string
  onOpenItem: (item: Item, id: string) => void
}

interface ProcessLocalParams {
  data: any[]
  params: RequestParams
  minPageSize: number
  maxPageSize: number
}

interface PaginateLocalParams {
  data: any[]
  page: number
  pageSize: number
  minPageSize: number
  maxPageSize: number
}

const {Link} = Typography
const columnHelper = createColumnHelper<any>()

export function getInitialData<T>(pageSize: number): DataWithPagination<T> {
  return {
    data: [],
    pagination: {
      page: 1,
      pageSize,
      total: 0
    }
  }
}

export function getColumns({
  items,
  item,
  defaultColWidth,
  maxTextLength,
  luxonDisplayDateFormatString,
  luxonDisplayTimeFormatString,
  luxonDisplayDateTimeFormatString,
  onOpenItem
}: GetColumnsParams): ColumnDef<ItemData, any>[] {
  const columns: ColumnDef<ItemData, any>[] = []
  const {attributes} = item.spec
  const sortedAttributes = sortAttributes(attributes)
  for (const [attrName, attr] of Object.entries(sortedAttributes)) {
    if (
      attr.private ||
      (attr.type === FieldType.relation && (attr.relType === RelType.oneToMany || attr.relType === RelType.manyToMany))
    )
      continue

    const column = columnHelper.accessor(attrName, {
      header: i18n.t(attr.displayName) as string,
      cell: info =>
        renderCell({
          items,
          item,
          data: info.row.original,
          attrName,
          attribute: attr,
          value: info.getValue(),
          maxTextLength,
          luxonDisplayDateFormatString,
          luxonDisplayTimeFormatString,
          luxonDisplayDateTimeFormatString,
          onOpenItem
        }),
      size: attr.colWidth ?? defaultColWidth,
      enableSorting: attr.type !== FieldType.text && attr.type !== FieldType.json && attr.type !== FieldType.array,
      enableColumnFilter: item.name !== ACCESS_ITEM_NAME || attrName !== MASK_ATTR_NAME
    })

    columns.push(column as ColumnDef<ItemData>)
  }

  return columns
}

const renderCell = ({
  items,
  item,
  data,
  attrName,
  attribute,
  value,
  maxTextLength,
  luxonDisplayDateFormatString,
  luxonDisplayTimeFormatString,
  luxonDisplayDateTimeFormatString,
  onOpenItem
}: RenderCellParams): ReactElement | string | null => {
  switch (attribute.type) {
    case FieldType.string:
      if (item.name === MEDIA_ITEM_NAME && attrName === FILENAME_ATTR_NAME && value != null) {
        return <Link onClick={() => download(data.id, value)}>{value}</Link>
      }
      return value
    case FieldType.uuid:
    case FieldType.email:
    case FieldType.password:
    case FieldType.sequence:
      return value
    case FieldType.enum:
      return i18n.t(value)
    case FieldType.text:
      return value ? _.truncate(value, {length: maxTextLength}) : value
    case FieldType.int:
      if (item.name === ACCESS_ITEM_NAME && attrName === MASK_ATTR_NAME && value != null) {
        const r = getBit(value, 0) ? 'R' : '-'
        const w = getBit(value, 1) ? 'W' : '-'
        const c = getBit(value, 2) ? 'C' : '-'
        const d = getBit(value, 3) ? 'D' : '-'
        const a = getBit(value, 4) ? 'A' : '-'

        return <Tag style={{fontFamily: 'monospace', fontWeight: 600}}>{`${a} ${d} ${c} ${w} ${r}`}</Tag>
      }
      return value
    case FieldType.long:
    case FieldType.float:
    case FieldType.double:
    case FieldType.decimal:
      return value
    case FieldType.json:
    case FieldType.array:
      return value ? _.truncate(JSON.stringify(value), {length: maxTextLength}) : null
    case FieldType.bool:
      return (
        <div className="text-centered">
          <Checkbox checked={value} />
        </div>
      )
    case FieldType.date:
      return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateFormatString) : null
    case FieldType.time:
      return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayTimeFormatString) : null
    case FieldType.datetime:
    case FieldType.timestamp:
      return value ? DateTime.fromISO(value, {zone: UTC}).toFormat(luxonDisplayDateTimeFormatString) : null
    case FieldType.media:
      const media = items[MEDIA_ITEM_NAME]
      const mediaData: Media | null = value?.data
      if (!mediaData) return null

      return (
        <Link onClick={() => download(mediaData.id, mediaData.filename)}>
          {(mediaData as any)[media.titleAttribute] ?? mediaData.filename}
        </Link>
      )
    case FieldType.relation:
      if (attribute.relType === RelType.oneToMany || attribute.relType === RelType.manyToMany)
        throw new Error('Cannot render oneToMany or manyToMany relation')

      if (!attribute.target) throw new Error('Illegal state')

      const subItem = items[attribute.target]
      const title = value && value.data ? value.data[subItem.titleAttribute] ?? value.data.id : null
      if (title == null) return null

      return <Link onClick={() => onOpenItem(subItem, value.data.id)}>{title}</Link>
    default:
      throw new Error('Illegal attribute')
  }
}

export function getHiddenColumns(item: Item): string[] {
  const {attributes} = item.spec
  const hiddenColumns = []
  for (const attrName in attributes) {
    if (!attributes.hasOwnProperty(attrName)) continue

    const attribute = attributes[attrName]
    if (attribute.colHidden) hiddenColumns.push(attrName)
  }

  return hiddenColumns
}

export async function findAll(
  items: ItemMap,
  item: Item,
  params: ExtRequestParams,
  extraFiltersInput?: ItemFiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
  const queryManager = new QueryManager(items)
  const responseCollection = await queryManager.findAll(item, params, extraFiltersInput)
  const {page, pageSize, total} = responseCollection.meta.pagination
  return {
    data: responseCollection.data,
    pagination: {page: page as number, pageSize, total}
  }
}

export async function findAllRelated(
  items: ItemMap,
  itemName: string,
  itemId: string,
  relAttrName: string,
  target: Item,
  params: ExtRequestParams,
  extraFiltersInput?: ItemFiltersInput<ItemData>
): Promise<DataWithPagination<any>> {
  const queryManager = new QueryManager(items)
  const item = items[itemName]
  const responseCollection = await queryManager.findAllRelated(
    item,
    itemId,
    relAttrName,
    target,
    params,
    extraFiltersInput
  )
  const {page, pageSize, total} = responseCollection.meta.pagination
  return {
    data: responseCollection.data,
    pagination: {page: page as number, pageSize, total}
  }
}

export function processLocal({data, params, minPageSize, maxPageSize}: ProcessLocalParams): DataWithPagination<any> {
  const {sorting, filters, pagination} = params
  const {page, pageSize} = pagination
  const filtered = filterLocal(data, filters)
  const sorted = sortLocal(filtered, sorting)

  return paginateLocal({data: sorted, page: page as number, pageSize: pageSize as number, minPageSize, maxPageSize})
}

function filterLocal(data: any[], filters: ColumnFiltersState): any[] {
  if (filters.length === 0) {
    return data
  } else {
    const filterMap = filters.reduce((obj, f) => {
      obj[f.id] = f.value
      return obj
    }, {} as any)

    return data.filter(it => {
      let matched = 0
      for (const key in it) {
        const filterVal = filterMap[key]
        if (filterVal == null) continue

        let dataVal = it[key]
        if (dataVal == null) return false

        if (_.isBoolean(dataVal)) {
          const lowerFilterVal = filterVal.toLowerCase()
          if (
            !(
              (dataVal &&
                (lowerFilterVal === '1' ||
                  lowerFilterVal === 'true' ||
                  lowerFilterVal === 'yes' ||
                  lowerFilterVal === 'y')) ||
              (!dataVal &&
                (lowerFilterVal === '0' ||
                  lowerFilterVal === 'false' ||
                  lowerFilterVal === 'no' ||
                  lowerFilterVal === 'n'))
            )
          ) {
            return false
          }
        } else {
          if (_.isArray(dataVal)) dataVal = dataVal.join(', ')

          if (!_.isString(dataVal)) dataVal = _.toString(dataVal)

          if (dataVal.match(new RegExp(filterVal, 'i')) == null) return false
        }
        matched++
      }

      return matched === filters.length
    })
  }
}

function sortLocal(data: any[], sorting: SortingState): any[] {
  if (sorting.length === 0) {
    return data
  } else {
    const sortingState = sorting[0]
    return [...data].sort((a, b) => {
      const {id, desc} = sortingState
      let aVal = a[id] ?? ''
      if (Array.isArray(aVal)) aVal = aVal.join(', ')

      let bVal = b[id] ?? ''
      if (Array.isArray(bVal)) bVal = bVal.join(', ')

      if (desc) {
        if (aVal < bVal) return 1
        else if (aVal > bVal) return -1
        else return 0
      } else {
        if (aVal < bVal) return -1
        else if (aVal > bVal) return 1
        else return 0
      }
    })
  }
}

function paginateLocal({data, page, pageSize, minPageSize, maxPageSize}: PaginateLocalParams): DataWithPagination<any> {
  if (page < 1 && (pageSize < minPageSize || pageSize > maxPageSize)) throw new Error('Illegal argument')

  const total = data.length
  let pageNumber = page
  let offset = (page - 1) * pageSize
  if (offset >= total) {
    pageNumber = 1
    offset = 0
  }

  const paginated = data.slice(offset, offset + pageSize)

  return {
    data: paginated,
    pagination: {page: pageNumber, pageSize, total}
  }
}
