import {ApiMiddleware} from '../extensions/api-middleware'
import {itemMiddleware} from '../extensions/api-middleware/item'
import {itemTemplateMiddleware} from '../extensions/api-middleware/item-template'

interface ApiMiddlewareConfig {
    apiMiddleware: ApiMiddleware[]
}

// Add middleware here
const apiMiddlewareConfig: ApiMiddlewareConfig = {
  apiMiddleware: [
    itemMiddleware,
    itemTemplateMiddleware
  ]
}

export default apiMiddlewareConfig
