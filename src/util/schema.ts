import {CONFIG_ID_ATTR_NAME, CURRENT_ATTR_NAME, GENERATION_ATTR_NAME, LIFECYCLE_ATTR_NAME, LOCALE_ATTR_NAME, LOCKED_BY_ATTR_NAME, MAJOR_REV_ATTR_NAME, PERMISSION_ATTR_NAME, STATE_ATTR_NAME} from 'src/config/constants'
import {Attribute, Item} from 'src/types/schema'

export const sortAttributes = (attributes: Record<string, Attribute>): Record<string, Attribute> =>
  Object.entries(attributes)
    .sort(([ka, va], [kb, vb]) => {
      if (va.sortOrder == null && vb.sortOrder == null)
        return 0

      if (va.sortOrder == null && vb.sortOrder != null)
        return 1

      if (va.sortOrder != null && vb.sortOrder == null)
        return -1

      return (va.sortOrder ?? 0) - (vb.sortOrder ?? 0)
    })
    .reduce((obj, [k, v]) => {
      obj[k] = v
      return obj
    }, {} as Record<string, Attribute>)

export function hasAttribute(item: Item, attrName: string): boolean {
  return item.spec.attributes.hasOwnProperty(attrName)
}

export function hasConfigIdAttribute(item: Item): boolean {
  return hasAttribute(item, CONFIG_ID_ATTR_NAME)
}

export function hasMajorRevAttribute(item: Item): boolean {
  return hasAttribute(item, MAJOR_REV_ATTR_NAME)
}

export function hasGenerationAttribute(item: Item): boolean {
  return hasAttribute(item, GENERATION_ATTR_NAME)
}

export function hasCurrentAttribute(item: Item): boolean {
  return hasAttribute(item, CURRENT_ATTR_NAME)
}

export function hasLocaleAttribute(item: Item): boolean {
  return hasAttribute(item, LOCALE_ATTR_NAME)
}

export function hasLifecycleAttribute(item: Item): boolean {
  return hasAttribute(item, LIFECYCLE_ATTR_NAME)
}

export function hasStateAttribute(item: Item): boolean {
  return hasAttribute(item, STATE_ATTR_NAME)
}

export function hasPermissionAttribute(item: Item): boolean {
  return hasAttribute(item, PERMISSION_ATTR_NAME)
}

export function hasLockedByAttribute(item: Item): boolean {
  return hasAttribute(item, LOCKED_BY_ATTR_NAME)
}

export function isItemLockable(item: Item): boolean {
  if (!item)
    return false

  return !item.notLockable && hasLockedByAttribute(item)
}
