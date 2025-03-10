import {ReactNode} from 'react'
import {FormInstance} from 'antd'

import {AttributeFieldProps} from 'src/pages/app/attributeFields'
import {ItemMap} from 'src/services/item'
import {IBuffer, UserInfo} from 'src/types'
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

export interface CustomRenderer {
  mountPoint: CustomRendererMountPoint
  priority?: number
  render: (props: CustomRendererProps) => void
}

export interface CustomRendererProps {
  node: HTMLElement
  context: CustomRendererContext
}

export interface CustomRendererContext {
  item: Item
  buffer: IBuffer
  data?: ItemData | null
  onBufferChange: (buffer: IBuffer) => void
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

export interface CustomComponent {
  id: string
  mountPoint: CustomComponentMountPoint
  priority?: number
  title?: string // for tabs rendering
  icon?: string // for tabs rendering
  render: ({context}: CustomComponentProps) => ReactNode
}

export interface CustomComponentProps {
  context: CustomComponentContext
}

export interface CustomComponentContext {
  itemTab: ItemTab
  form?: FormInstance
  buffer: IBuffer
  onBufferChange: (buffer: IBuffer) => void
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

export interface ApiMiddleware {
  id: string
  itemName: string | '*'
  priority?: number
  handle: (operation: ApiOperation, context: ApiMiddlewareContext, next: () => any) => any
}

export interface ApiMiddlewareContext {
  me: UserInfo | null
  items: ItemMap
  item: Item
  buffer: IBuffer
  values: any
}
