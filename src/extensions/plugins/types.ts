import {ReactNode} from 'react'
import {FormInstance} from 'antd'

import {AttributeFieldProps} from 'src/pages/app/attributeFields'
import {ItemMap} from 'src/services/item'
import {UserInfo} from 'src/types'
import {Item, ItemData, ItemTab} from 'src/types/schema'

/**
 * Render mount points:
 * default.header
 * default.content
 * default.footer
 * <itemName>.default.header
 * <itemName>.default.content
 * <itemName>.default.footer
 * view.header
 * view.content
 * view.footer
 * <itemName>.view.header
 * <itemName>.view.content
 * <itemName>.view.footer
 * tabs.content
 * <itemName>.tabs.content
 */
export type CustomRendererMountPoint =
  | string
  | 'default.header'
  | 'default.content'
  | 'default.footer'
  | 'view.header'
  | 'view.footer'
  | 'view.content'
  | 'tabs.content'

export interface CustomRenderer<T extends ItemData> {
  mountPoint: CustomRendererMountPoint
  priority?: number
  render: (props: CustomRendererProps<T>) => void
}

export interface CustomRendererProps<T extends ItemData> {
  node: HTMLElement
  context: CustomRendererContext<T>
}

export interface CustomRendererContext<T extends ItemData> {
  item: Item

  /**
   * Returns value from data buffer. If the resolved value is undefined, the defaultValue is returned in its place.
   * Function doesn't get value from the Form instance.
   * @param name The name of the property to get
   * @param defaultValue The value returned for undefined resolved values
   * @returns The data buffer property value or defaultValue
   */
  getValue: <K extends keyof T>(name: K, defaultValue?: T[K]) => T[K]

  /**
   * Applies changes to the data buffer.
   * @param changes Changes to apply
   */
  setValue: (changes: Partial<T>) => void
}

/**
 * Custom component mount points (in additioonal to RenderMountPoint):
 * view.content.form.begin
 * view.content.form.end
 * <itemName>.view.content.form.begin
 * <itemName>.view.content.form.end
 * tabs.begin
 * tabs.end
 * <itemName>.tabs.begin
 * <itemName>.tabs.end
 */
export type CustomComponentMountPoint =
  | CustomRendererMountPoint
  | 'view.content.form.begin'
  | 'view.content.form.end'
  | 'tabs.begin'
  | 'tabs.end'

export interface CustomComponent<T extends ItemData> {
  id: string
  mountPoint: CustomComponentMountPoint
  priority?: number
  title?: string // for tabs rendering
  icon?: string // for tabs rendering
  render: (props: CustomComponentProps<T>) => ReactNode
}

export interface CustomComponentProps<T extends ItemData> {
  context: CustomComponentContext<T>
}

export interface CustomComponentContext<T extends ItemData> {
  itemTab: ItemTab
  form?: FormInstance
  /**
   * Returns value from data buffer. If the resolved value is undefined, the defaultValue is returned in its place.
   * Function doesn't get value from the Form instance.
   * @param name The name of the property to get
   * @param defaultValue The value returned for undefined resolved values
   * @returns The data buffer property value or defaultValue
   */
  getValue: <K extends keyof T>(name: K, defaultValue?: T[K]) => T[K]

  /**
   * Applies changes to the data buffer.
   * @param changes Changes to apply
   */
  setValue: (changes: Partial<T>) => void
}

/**
 * Custom attribute mount points (ascending priority):
 * *.<attributeName>
 * <itemName>.<attributeName>
 */
export type CustomAttributeFieldMountPoint = string

export interface CustomAttributeField {
  id: string
  mountPoint: CustomAttributeFieldMountPoint
  render: ({context}: CustomAttributeFieldProps) => ReactNode
}

export interface CustomAttributeFieldProps {
  context: CustomAttributeFieldContext
}

export interface CustomAttributeFieldContext extends AttributeFieldProps {}

export enum ApiOperation {
  FIND = 'FIND',
  FIND_ALL = 'FIND_ALL',
  CREATE = 'CREATE',
  CREATE_VERSION = 'CREATE_VERSION',
  CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
  UPDATE = 'UPDATE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  DELETE = 'DELETE',
  PURGE = 'PURGE',
  PROMOTE = 'PROMOTE'
}

export interface ApiMiddleware<T extends ItemData> {
  id: string
  itemName: string | '*'
  priority?: number
  handle: (operation: ApiOperation, context: ApiMiddlewareContext<T>, next: () => any) => any
}

export interface ApiMiddlewareContext<T extends ItemData> {
  me: UserInfo | null
  items: ItemMap
  item: Item
  /**
   * Returns value from data buffer. If the resolved value is undefined, the defaultValue is returned in its place.
   * Function doesn't get value from the Form instance.
   * @param name The name of the property to get
   * @param defaultValue The value returned for undefined resolved values
   * @returns The data buffer property value or defaultValue
   */
  getValue: <K extends keyof T>(name: K, defaultValue?: T[K]) => T[K]
}
