import _ from 'lodash'
import {FC, ReactElement} from 'react'
import {Attribute} from 'src/types/schema'
import type {Plugin} from './Plugin'
import {
  ApiMiddleware,
  ApiMiddlewareContext,
  ApiOperation,
  CustomAttributeField,
  CustomAttributeFieldContext,
  CustomAttributeFieldMountPoint,
  CustomComponent,
  CustomComponentContext,
  CustomRenderer,
  CustomRendererContext
} from './types'

interface Prioritized {
  priority?: number
}

const DEFAULT_PRIORITY = 10

const prioritySorter = (a: Prioritized, b: Prioritized) =>
  (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY)

const attributeFieldSorter = (a: CustomAttributeField, b: CustomAttributeField) => {
  const aMountPoint = a.mountPoint
  const bMountPoint = b.mountPoint
  if (aMountPoint === bMountPoint)
    return 0

  if (aMountPoint === '*')
    return 1

  if (bMountPoint === '*')
    return -1

  return aMountPoint < bMountPoint ? 1 : -1
}

export class PluginEngine {
  private isLoaded: boolean = false
  private renderersByMountPoint: Record<string, CustomRenderer[]> = {}
  private componentsByMountPoint: Record<string, CustomComponent[]> = {}
  private attributeFields: CustomAttributeField[] = []
  private apiMiddlewareByItemName: Record<string, ApiMiddleware[]> = {}

  constructor(private plugins: Plugin[]) {}

  onLoad() {
    if (this.isLoaded)
      return

    // Load plugins
    for (const plugin of this.plugins) {
      plugin.onLoad()
    }

    // Renderers
    const renderers: CustomRenderer[] = this.plugins.flatMap(p => p.renderers)
      .sort(prioritySorter)
    
    this.renderersByMountPoint = _.groupBy(renderers, renderer => renderer.mountPoint)

    // Custom components
    const components: CustomComponent[] = this.plugins.flatMap(p => p.components)
      .sort(prioritySorter)

    this.componentsByMountPoint = _.groupBy(components, component => component.mountPoint)

    // Attribute fields
    this.attributeFields = this.plugins.flatMap(p => p.attributeFields)
      .sort(attributeFieldSorter)

    // API middleware
    const apiMiddlewares: ApiMiddleware[] = this.plugins.flatMap(p => p.apiMiddlewares)
      .sort(prioritySorter)

    this.apiMiddlewareByItemName = _.groupBy(apiMiddlewares, apiMiddleware => apiMiddleware.itemName)

    this.isLoaded = true
  }

  onUnload() {
    if (!this.isLoaded)
      return

    for (const plugin of this.plugins) {
      plugin.onUnload()
    }

    this.isLoaded = false
  }

  // Renderers
  hasRenderers(...mountPoints: string[]): boolean {
    for (const mountPoint of mountPoints) {
      if (this.renderersByMountPoint.hasOwnProperty(mountPoint))
        return true
    }
    return false
  }
  
  render(mountPoint: string, node: HTMLElement, context: CustomRendererContext) {
    const renderers = this.renderersByMountPoint[mountPoint]
    renderers?.forEach(renderer => {
      renderer.render({node, context})
    })
  }

  // Custom components
  hasComponents(...mountPoints: string[]): boolean {
    for (const mountPoint of mountPoints) {
      if (mountPoint in this.componentsByMountPoint)
        return true
    }
    return false
  }
  
  getComponents = (mountPoint: string): CustomComponent[] =>
    this.componentsByMountPoint[mountPoint] ?? []
  
  renderComponents(mountPoint: string, context: CustomComponentContext): ReactElement | null {
    const components = this.componentsByMountPoint[mountPoint]
    if (!components)
      return null
  
    return (
      <>
        {components.map(component => component.render({context}))}
      </>
    )
  }

  // Attribute fields
  hasAttributeField = (itemName: string, attrName: string): boolean =>
    this.getAttributeField(itemName, attrName) != null
  
  getAttributeField = (itemName: string, attrName: string): CustomAttributeField | undefined =>
    this.attributeFields.find(af => {
      const separatorIndex = af.mountPoint.indexOf('.')
      const fieldItemName = af.mountPoint.substring(0, separatorIndex)
      const fieldAttrName = af.mountPoint.substring(separatorIndex + 1)
      return fieldAttrName === attrName && (fieldItemName === itemName || fieldItemName === '*')
    })
  
  renderAttributeField(context: CustomAttributeFieldContext, defaultRender: FC<CustomAttributeFieldContext>): ReactElement | null {
    const attributeField = this.getAttributeField(context.data.item.name, context.attrName)
  
    return <>{attributeField ? attributeField.render({context}) : defaultRender(context)}</>
  }

  // Api middleware
  hasApiMiddleware = (itemName: string): boolean => itemName in this.apiMiddlewareByItemName || '*' in this.apiMiddlewareByItemName

  async handleApiMiddleware(itemName: string, operation: ApiOperation, context: ApiMiddlewareContext, next: () => any): Promise<any> {
    const apiMiddlewares = [...(this.apiMiddlewareByItemName[itemName] ?? []), ...(this.apiMiddlewareByItemName['*'] ?? [])]
    if (apiMiddlewares.length === 0)
      return await next()

    return await this.handleApiMiddlewares(apiMiddlewares, operation, context, next)
  }

  async handleApiMiddlewares(list: ApiMiddleware[], operation: ApiOperation, context: ApiMiddlewareContext, next: () => any): Promise<any> {
    if (list.length === 0)
      return await next()

    const first = list[0]
    return await first.handle(operation, context, () => this.handleApiMiddlewares(list.slice(1), operation, context, next))
  }
}