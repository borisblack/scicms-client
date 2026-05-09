import {ItemData} from 'src/types/schema'
import {ApiMiddleware, CustomAttributeField, CustomComponent, CustomRenderer} from './types'

export abstract class Plugin<T extends ItemData> {
  renderers: CustomRenderer<T>[] = []
  components: CustomComponent<T>[] = []
  attributeFields: CustomAttributeField[] = []
  apiMiddlewares: ApiMiddleware<T>[] = []

  abstract onLoad(): void

  abstract onUnload(): void

  addRenderer(renderer: CustomRenderer<T>) {
    this.renderers.push(renderer)
  }

  addComponent(component: CustomComponent<T>) {
    this.components.push(component)
  }

  addAttributeField(attributeField: CustomAttributeField) {
    this.attributeFields.push(attributeField)
  }

  addApiMiddleware(apiMiddleware: ApiMiddleware<T>) {
    this.apiMiddlewares.push(apiMiddleware)
  }
}
