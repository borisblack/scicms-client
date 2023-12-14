import _ from 'lodash'
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons'
import {Item, ItemData, ItemDataWrapper, ViewType} from '../types'
import {objectToHash} from './index'
import React, {ReactNode} from 'react'
import {allIcons} from './icons'
import {ID_ATTR_NAME} from '../config/constants'
import i18n from '../i18n'
import {MDITab} from '../components/mdi-tabs'
import appConfig from '../config'

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

    const suffix = extra == null ? undefined : objectToHash(extra).toString()
    return suffix == null ? key : `${key}#${suffix}`
}

export function generateLabel(data: ItemDataWrapper): ReactNode {
    const {item, viewType, extra} = data
    const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? allIcons[item.icon] : null)
    const title = _.truncate(getTitle(data), {length: appConfig.ui.mdi.tabLabelMaxLength})

    return (
        <span>
            {Icon && <Icon/>}{title}{extra && <ExclamationCircleOutlined className="tab-label-suffix orange"/>}
        </span>
    )
}

export function getTitle(data: ItemDataWrapper): string {
    const {item, viewType, data: itemData} = data
    const key = generateKey(data)
    switch (viewType) {
        case ViewType.view:
            if (itemData?.id) {
                let titleAttrValue = itemData[item.titleAttribute]
                if (!titleAttrValue || item.titleAttribute === ID_ATTR_NAME)
                    titleAttrValue = `${i18n.t(item.displayName)} ${itemData.id.substring(0, 8)}`

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
): MDITab<ItemDataWrapper> {
    return {
        key: generateKey,
        label: generateLabel,
        data: {
            item,
            viewType,
            id: (viewType === ViewType.view && data?.id == null) ? generateId(item.name) : undefined,
            data,
            extra
        },
        onUpdate: onUpdate == null ? [] : [onUpdate],
        onClose: onClose == null ? [] : [onClose]
    }
}
