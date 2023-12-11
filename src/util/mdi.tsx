import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons'
import {ItemDataWrapper, ViewType} from '../types'
import {objectToHash} from './index'
import React, {ReactNode} from 'react'
import {allIcons} from './icons'
import {ID_ATTR_NAME} from '../config/constants'
import i18n from '../i18n'
import {MDITab} from '../components/mdi-tabs'

const tempIds: Record<string, number> = {}

export function generateKey(data: ItemDataWrapper): string {
    const {item, viewType, data: itemData, extra} = data
    const itemName = item.name

    return generateKeyById(itemName, viewType, itemData?.id, extra)
}

export function generateKeyById(itemName: string, viewType: ViewType, id?: string, extra?: Record<string, any>): string {
    let key = `${itemName}#${viewType}`
    if (id != null) {
        key += `#${id}`
    } else if (viewType === ViewType.view) {
        const tempId = (tempIds[itemName] ?? 0) + 1
        tempIds[itemName] = tempId
        key += `#${tempId}`
    }

    const suffix = extra == null ? undefined : objectToHash(extra).toString()
    return suffix == null ? key : `${key}#${suffix}`
}

export function generateLabel(data: ItemDataWrapper): ReactNode {
    const {item, viewType, extra} = data
    const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? allIcons[item.icon] : null)
    const title = getTitle(data)

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
    data: ItemDataWrapper,
    onUpdate?: (updatedData: ItemDataWrapper) => void,
    onClose?: (closedData: ItemDataWrapper, remove: boolean) => void
): MDITab<ItemDataWrapper> {
    return {
        key: generateKey,
        label: generateLabel,
        data,
        onUpdate: onUpdate == null ? [] : [onUpdate],
        onClose: onClose == null ? [] : [onClose]
    }
}
