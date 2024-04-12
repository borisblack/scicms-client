import {ApiMiddleware, CustomAttributeField, CustomComponent, CustomRenderer} from './types'

export abstract class Plugin {
  renderers: CustomRenderer[] = []
  components: CustomComponent[] = []
  attributeFields: CustomAttributeField[] = []
  apiMiddlewares: ApiMiddleware[] = []

  abstract onLoad(): void

  abstract onUnload(): void

  addRenderer(renderer: CustomRenderer) {
    this.renderers.push(renderer)
  }

  addComponent(component: CustomComponent) {
    this.components.push(component)
  }

  addAttributeField(attributeField: CustomAttributeField) {
    this.attributeFields.push(attributeField)
  }

  addApiMiddleware(apiMiddleware: ApiMiddleware) {
    this.apiMiddlewares.push(apiMiddleware)
  }
}