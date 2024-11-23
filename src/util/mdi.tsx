import type {ReactNode} from 'react'
import md5 from 'crypto-js/md5'
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons'

import {ViewType} from '../types'
import {Item, ItemData, ItemDataWrapper} from '../types/schema'
import {ID_ATTR_NAME} from '../config/constants'
import i18n from '../i18n'
import {MDITabObservable} from '../uiKit/MDITabs'
import IconSuspense from '../uiKit/icons/IconSuspense'

const tempIds: Record<string, number> = {}

function generateId(itemName: string) {
  const tempId = (tempIds[itemName] ?? 0) + 1
  tempIds[itemName] = tempId

  return tempId.toString()
}


export function generateKey(data: ItemDataWrapper): string {
  const {item, viewType, data: itemData, extra} = data
  const itemName = item.name

  return generateKeyById(itemName, viewType, itemData?.id ?? data.id, extra)
}

export function generateKeyById(itemName: string, viewType: ViewType, id?: string, extra?: Record<string, any>): string {
  let key = `${itemName}#${viewType}`
  if (id != null) {
    key += `#${id}`
  } else if (viewType === ViewType.view) {
    key += `#${generateId(itemName)}`
  }

  const suffix = extra == null ? undefined : md5(JSON.stringify(extra)).toString()
  return suffix == null ? key : `${key}#${suffix}`
}

export function generateLabel(data: ItemDataWrapper): ReactNode {
  const {item, viewType, extra} = data
  const title = getTitle(data)

  return (
    <span className="mdi-tab-label" title={title}>
      {(viewType === ViewType.default) ? <SearchOutlined/> : <IconSuspense iconName={item.icon}/>}
      {title}
      {extra && <ExclamationCircleOutlined className="tab-label-suffix orange"/>}
    </span>
  )
}

export function getTitle(data: ItemDataWrapper): string {
  const {item, viewType, data: itemData} = data
  const key = generateKey(data)
  switch (viewType) {
    case ViewType.view:
      if (itemData?.[item.idAttribute]) {
        let titleAttrValue = itemData[item.titleAttribute]
        if (!titleAttrValue || item.titleAttribute === ID_ATTR_NAME)
          titleAttrValue = `${i18n.t(item.displayName)} ${itemData[item.idAttribute].substring(0, 8)}`

        return titleAttrValue
      }
      return `${i18n.t(item.displayName)} ${key.substring(key.lastIndexOf('#') + 1)} *`
    case ViewType.default:
    default:
      return i18n.t(item.displayPluralName)
  }
}

export function createMDITab(
  item: Item,
  viewType: ViewType,
  data?: ItemData,
  extra?: Record<string, any>,
  onUpdate?: (updatedData: ItemDataWrapper) => void,
  onClose?: (closedData: ItemDataWrapper, remove: boolean) => void
): MDITabObservable<ItemDataWrapper> {
  const itemDataWrapper = {
    item,
    viewType,
    id: (viewType === ViewType.view && data?.id == null) ? generateId(item.name) : undefined,
    data,
    extra
  }

  return {
    key: generateKey(itemDataWrapper),
    data: itemDataWrapper,
    onUpdate: onUpdate == null ? [] : [onUpdate],
    onClose: onClose == null ? [] : [onClose]
  }
}
